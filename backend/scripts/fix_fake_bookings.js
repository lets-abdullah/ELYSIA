import { query } from '../src/db/pool.js';
import { sanitizeInput } from '../src/utils/sanitize.js';

async function fixFakeBookings() {
  console.log('--- Starting Database Cleanup & Price Restoration ---');

  // 1. Fetch all reservations grouped by customer
  const resList = await query(`
    SELECT r.*, c.email AS cust_email, c.name AS cust_name, rm.price AS room_price, rm.room_number
    FROM reservations r
    LEFT JOIN customers c ON c.id = r.customer_id
    LEFT JOIN rooms rm ON rm.id = r.room_id
    ORDER BY r.created_at DESC
  `);

  console.log(`Found ${resList.rows.length} total reservations in database.`);

  // Group by customer email
  const customerMap = new Map();
  for (const row of resList.rows) {
    const emailKey = (row.cust_email || row.customer_id || 'unknown').toLowerCase();
    if (!customerMap.has(emailKey)) {
      customerMap.set(emailKey, []);
    }
    customerMap.get(emailKey).push(row);
  }

  for (const [email, bookings] of customerMap.entries()) {
    console.log(`\nProcessing customer: ${email} (Total bookings: ${bookings.length})`);

    // Keep only the first booking (most recent), delete the rest
    const keepBooking = bookings[0];
    const deleteBookings = bookings.slice(1);

    for (const toDelete of deleteBookings) {
      console.log(`  Deleting duplicate booking: ${toDelete.booking_code} (ID: ${toDelete.id})`);
      // Delete payment records for this reservation
      await query('DELETE FROM payments WHERE reservation_id = $1 OR booking_code = $2', [toDelete.id, toDelete.booking_code]);
      // Delete invoice records for this reservation
      await query('DELETE FROM invoices WHERE booking_id = $1', [toDelete.id]);
      // Delete reservation
      await query('DELETE FROM reservations WHERE id = $1', [toDelete.id]);
    }

    // Now fix the 1 remaining booking:
    // Determine proper room price
    let officialRoomPrice = parseFloat(keepBooking.room_price) || 0;
    if (officialRoomPrice <= 0 && keepBooking.room_id) {
      const rm = await query('SELECT price FROM rooms WHERE id = $1', [keepBooking.room_id]);
      if (rm.rows.length > 0) {
        officialRoomPrice = parseFloat(rm.rows[0].price) || 0;
      }
    }
    if (officialRoomPrice <= 0) {
      officialRoomPrice = 198; // Standard room price default ($198 / night)
    }

    const nights = Math.max(1, parseInt(keepBooking.nights, 10) || 1);
    const originalTotalPrice = officialRoomPrice * nights;

    console.log(`  Fixing remaining booking: ${keepBooking.booking_code}`);
    console.log(`    Original Room Rate: $${officialRoomPrice}/night x ${nights} night(s) = $${originalTotalPrice}`);
    console.log(`    Setting Paid Amount to $0 (Unpaid) and Status to 'pending'`);

    await query(
      `UPDATE reservations
       SET total_amount = $1, paid_amount = 0, booking_status = 'pending'
       WHERE id = $2`,
      [originalTotalPrice, keepBooking.id]
    );

    // Delete or update any payment records for this remaining booking to 0
    await query('DELETE FROM payments WHERE reservation_id = $1 OR booking_code = $2', [keepBooking.id, keepBooking.booking_code]);

    // Sanitize customer name in customers table
    const cleanCustName = sanitizeInput(keepBooking.cust_name) || 'Guest User';
    const warningMsg = 'Security Warning: You have attempted spam, manipulated room rates, or duplicate bookings. Fake and unauthorized bookings are strictly prohibited and will be automatically cancelled. Repeated violations may result in permanent account suspension.';

    await query(
      `UPDATE customers
       SET name = $1, warning_message = $2
       WHERE id = $3 OR LOWER(email) = LOWER($4)`,
      [cleanCustName, warningMsg, keepBooking.customer_id, email]
    );

    // Also set warning on user login profile if an account exists
    await query(
      `UPDATE users
       SET warning_message = $1
       WHERE LOWER(email) = LOWER($2)`,
      [warningMsg, email]
    );
  }

  // Sanitize any remaining customer names in customers table that might still have XSS tags
  const allCustomers = await query('SELECT id, name FROM customers');
  for (const c of allCustomers.rows) {
    const sanitized = sanitizeInput(c.name) || 'Guest User';
    if (sanitized !== c.name) {
      console.log(`Sanitizing customer ID ${c.id}: "${c.name}" -> "${sanitized}"`);
      await query('UPDATE customers SET name = $1 WHERE id = $2', [sanitized, c.id]);
    }
  }

  console.log('\n✅ All fake bookings cleaned up. 1 booking kept per account with original price restored and payment set to Unpaid!');
  process.exit(0);
}

fixFakeBookings().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
