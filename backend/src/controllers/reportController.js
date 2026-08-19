import { query } from '../db/pool.js';

export async function getDashboardReports(req, res) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Room stats
    const roomStats = await query(`
      SELECT
        COUNT(*)                                                   AS total_rooms,
        COUNT(*) FILTER (WHERE status = 'occupied')                AS occupied_rooms,
        COUNT(*) FILTER (WHERE status = 'reserved')                AS reserved_rooms,
        COUNT(*) FILTER (WHERE status = 'available')               AS available_rooms,
        COUNT(*) FILTER (WHERE status = 'maintenance')             AS maintenance_rooms,
        COUNT(*) FILTER (WHERE status = 'cleaning')                AS cleaning_rooms
      FROM rooms
    `);

    // Booking stats + revenue
    const bookingStats = await query(`
      SELECT
        COUNT(*)                                                             AS total_bookings,
        COUNT(*) FILTER (WHERE booking_status IN ('checked_in','confirmed')) AS active_bookings,
        COALESCE(SUM(paid_amount) FILTER (WHERE paid_amount > 0), 0)        AS total_revenue
      FROM reservations
    `);

    // Today's check-ins & check-outs
    const todayCheckIns = await query(
      `SELECT r.*, c.name AS guest_name, c.email AS guest_email, rm.room_number
       FROM reservations r
       LEFT JOIN customers c ON c.id = r.customer_id
       LEFT JOIN rooms rm ON rm.id = r.room_id
       WHERE r.check_in_date = $1`,
      [todayStr]
    );

    const todayCheckOuts = await query(
      `SELECT r.*, c.name AS guest_name, c.email AS guest_email, rm.room_number
       FROM reservations r
       LEFT JOIN customers c ON c.id = r.customer_id
       LEFT JOIN rooms rm ON rm.id = r.room_id
       WHERE r.check_out_date = $1`,
      [todayStr]
    );

    // Recent activity logs
    const recentActivity = await query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
    );

    const rs = roomStats.rows[0];
    const bs = bookingStats.rows[0];
    const totalRooms = parseInt(rs.total_rooms, 10);

    return res.json({
      success: true,
      stats: {
        totalRooms,
        occupiedRooms:    parseInt(rs.occupied_rooms, 10),
        reservedRooms:    parseInt(rs.reserved_rooms, 10),
        availableRooms:   parseInt(rs.available_rooms, 10),
        maintenanceRooms: parseInt(rs.maintenance_rooms, 10),
        cleaningRooms:    parseInt(rs.cleaning_rooms, 10),
        occupancyRate: totalRooms > 0
          ? Math.round(((parseInt(rs.occupied_rooms) + parseInt(rs.reserved_rooms)) / totalRooms) * 100)
          : 0,
        totalBookings:     parseInt(bs.total_bookings, 10),
        activeBookings:    parseInt(bs.active_bookings, 10),
        totalRevenue:      parseFloat(bs.total_revenue),
        todayCheckInsCount:  todayCheckIns.rows.length,
        todayCheckOutsCount: todayCheckOuts.rows.length
      },
      todayCheckIns:  todayCheckIns.rows,
      todayCheckOuts: todayCheckOuts.rows,
      recentActivity: recentActivity.rows
    });
  } catch (error) {
    console.error('getDashboardReports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate dashboard reports.' });
  }
}

export async function getActivityLogs(req, res) {
  try {
    const result = await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200');
    return res.json({ success: true, activityLogs: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
  }
}
