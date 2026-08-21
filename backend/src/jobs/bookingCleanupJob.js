import { query } from '../db/pool.js';

/**
 * Automatically cleans up fake, duplicate, or abandoned bookings:
 * - Status is 'pending'
 * - Paid amount is 0 (Unpaid)
 * - Created more than 1 hour ago (created_at < NOW() - INTERVAL '1 hour')
 */
export async function autoCleanExpiredPendingBookings() {
  try {
    // 1. Fetch expired pending bookings
    const expiredResult = await query(`
      SELECT r.id, r.booking_code, r.customer_id, r.room_id, r.created_at, c.email AS cust_email
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      WHERE (r.booking_status = 'pending' OR r.booking_status IS NULL)
        AND (r.paid_amount <= 0 OR r.paid_amount IS NULL)
        AND r.created_at < (NOW() - INTERVAL '1 hour')
    `);

    const expiredBookings = expiredResult.rows;
    if (expiredBookings.length === 0) {
      return { cleanedCount: 0 };
    }

    console.log(`[Auto-Cleanup] Found ${expiredBookings.length} expired/fake pending booking(s) older than 1 hour. Cleaning up...`);

    const ids = expiredBookings.map((b) => b.id);
    const bookingCodes = expiredBookings.map((b) => b.booking_code);

    // 2. Remove associated payments and invoices
    await query(
      `DELETE FROM payments 
       WHERE reservation_id = ANY($1::varchar[]) OR booking_code = ANY($2::varchar[])`,
      [ids, bookingCodes]
    );

    await query(
      `DELETE FROM invoices 
       WHERE booking_id = ANY($1::varchar[])`,
      [ids]
    );

    // 3. Delete the expired reservations
    await query(
      `DELETE FROM reservations 
       WHERE id = ANY($1::varchar[])`,
      [ids]
    );

    // 4. Log in activity_logs
    try {
      const logDetails = `Auto-cleared ${expiredBookings.length} expired fake/duplicate booking(s) older than 1 hour: ${bookingCodes.slice(0, 5).join(', ')}${bookingCodes.length > 5 ? '...' : ''}`;
      await query(
        `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `log-autoclean-${Date.now()}`,
          'System Auto-Cleaner',
          'System',
          'Auto Clean Expired Bookings',
          'Reservations',
          logDetails
        ]
      );
    } catch (logErr) {
      console.warn('[Auto-Cleanup] Could not write to activity_logs:', logErr.message);
    }

    console.log(`[Auto-Cleanup] Successfully cleared ${expiredBookings.length} expired booking(s).`);
    return { cleanedCount: expiredBookings.length, bookingCodes };
  } catch (error) {
    console.error('[Auto-Cleanup] Error cleaning expired bookings:', error.message);
    return { cleanedCount: 0, error: error.message };
  }
}

/**
 * Starts the periodic background cleanup job (runs every 5 minutes).
 */
export function startBookingCleanupScheduler(intervalMs = 5 * 60 * 1000) {
  // Run once immediately on start
  autoCleanExpiredPendingBookings().catch((err) => {
    console.error('[Auto-Cleanup] Initial run error:', err);
  });

  // Schedule recurring execution
  const intervalId = setInterval(() => {
    autoCleanExpiredPendingBookings().catch((err) => {
      console.error('[Auto-Cleanup] Scheduled run error:', err);
    });
  }, intervalMs);

  // Unref so it doesn't prevent graceful shutdown in test environments
  if (intervalId.unref) {
    intervalId.unref();
  }

  console.log(`⏱️ [Auto-Cleanup] 1-Hour Pending Booking Cleanup Scheduler active (interval: ${intervalMs / 60000} min).`);
  return intervalId;
}
