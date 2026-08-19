import { query } from '../db/pool.js';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'checked_in', 'checked-in', 'checked_out', 'checked-out', 'cancelled'];

async function logActivity(userName, userRole, action, module, details) {
  try {
    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userName, userRole, action, module, details]
    );
  } catch (e) {
    console.error('Failed to write activity log:', e.message);
  }
}

export async function createReservation(req, res) {
  try {
    const {
      guestName, name, email, phone,
      checkIn, checkOut, checkInDate, checkOutDate,
      guests, roomId, roomType,
      specialRequests, totalPrice, totalAmount, paidAmount,
      cnicPassport, address, bookingSource, status
    } = req.body;

    // ── Type Validations ───────────────────────────────────────────────────
    const rawName = guestName || name;
    if (rawName !== undefined && typeof rawName !== 'string') {
      return res.status(400).json({ success: false, message: 'Guest name must be a valid string.' });
    }
    if (email !== undefined && typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email must be a valid string.' });
    }
    if (phone !== undefined && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (roomId !== undefined && roomId !== null && typeof roomId !== 'string') {
      return res.status(400).json({ success: false, message: 'Room ID must be a valid string.' });
    }
    if (roomType !== undefined && roomType !== null && typeof roomType !== 'string') {
      return res.status(400).json({ success: false, message: 'Room type must be a valid string.' });
    }
    if (specialRequests !== undefined && specialRequests !== null && typeof specialRequests !== 'string') {
      return res.status(400).json({ success: false, message: 'Special requests must be a valid string.' });
    }
    if (cnicPassport !== undefined && cnicPassport !== null && typeof cnicPassport !== 'string') {
      return res.status(400).json({ success: false, message: 'CNIC/Passport must be a valid string.' });
    }
    if (address !== undefined && address !== null && typeof address !== 'string') {
      return res.status(400).json({ success: false, message: 'Address must be a valid string.' });
    }
    if (bookingSource !== undefined && bookingSource !== null && typeof bookingSource !== 'string') {
      return res.status(400).json({ success: false, message: 'Booking source must be a valid string.' });
    }

    const customerName = rawName ? rawName.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const inDate = checkIn || checkInDate;
    const outDate = checkOut || checkOutDate;

    if (!customerName || !cleanEmail || !cleanPhone || !inDate || !outDate) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, check-in, and check-out dates are required.' });
    }

    // ── Date & Numeric Validations (Server-side) ───────────────────────────
    const start = new Date(inDate);
    const end = new Date(outDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date format.' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    if (nights < 1 || nights > 365) {
      return res.status(400).json({ success: false, message: 'Stay duration must be between 1 and 365 nights.' });
    }

    const guestCount = guests !== undefined ? parseInt(guests, 10) : 1;
    if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
      return res.status(400).json({ success: false, message: 'Guest count must be an integer between 1 and 20.' });
    }

    const rawTotal = totalPrice !== undefined ? totalPrice : (totalAmount !== undefined ? totalAmount : 250 * nights);
    const total = parseFloat(rawTotal);
    if (isNaN(total) || total < 0 || total > 1000000) {
      return res.status(400).json({ success: false, message: 'Total price must be a valid number between 0 and 1,000,000.' });
    }

    const paid = paidAmount !== undefined ? parseFloat(paidAmount) : 0;
    if (isNaN(paid) || paid < 0 || paid > total) {
      return res.status(400).json({ success: false, message: 'Paid amount must be a number between 0 and total amount.' });
    }

    let initialStatus = 'pending';
    if (status !== undefined && status !== null) {
      if (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status.trim().toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid reservation status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}.`
        });
      }
      initialStatus = status.trim().toLowerCase().replace(/-/g, '_');
    }

    // ── 1. Find or create customer ──────────────────────────────────────────
    let customerResult = await query('SELECT * FROM customers WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    let customerId;

    if (customerResult.rows.length === 0) {
      customerId = `gst-${Date.now()}`;
      await query(
        `INSERT INTO customers (id, name, email, phone, address, cnic_passport)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerId, customerName, cleanEmail, cleanPhone, address ? address.trim() : '', cnicPassport ? cnicPassport.trim() : '']
      );
    } else {
      customerId = customerResult.rows[0].id;
      // Update phone if changed
      await query('UPDATE customers SET phone = $2 WHERE id = $1', [customerId, cleanPhone]);
    }

    // ── 2. Room assignment & availability validation ────────────────────────
    let assignedRoomId = roomId ? roomId.trim() : null;
    let assignedRoomType = roomType ? roomType.trim() : 'Standard';

    if (assignedRoomId) {
      const rmResult = await query(
        'SELECT * FROM rooms WHERE id = $1 OR room_number = $1',
        [assignedRoomId]
      );
      if (rmResult.rows.length > 0) {
        const rm = rmResult.rows[0];
        if (rm.status && rm.status.toLowerCase() !== 'available') {
          return res.status(400).json({
            success: false,
            message: `Room #${rm.room_number} is currently reserved or unavailable.`
          });
        }
        assignedRoomType = rm.type || assignedRoomType;
        assignedRoomId = rm.id;
      }
    } else {
      // Auto-assign first available room of the requested type
      const matchResult = await query(
        `SELECT id FROM rooms
         WHERE (type = $1 OR type ILIKE $1) AND status = 'available'
         LIMIT 1`,
        [assignedRoomType]
      );
      if (matchResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No available rooms found for category ${assignedRoomType}.`
        });
      }
      assignedRoomId = matchResult.rows[0].id;
    }

    // ── 3. Calculate stay details ───────────────────────────────────────────
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-2026-${randomNum}`;
    const reservationId = `bk-${Date.now()}`;

    // ── 4. Insert reservation ──────────────────────────────────────────────
    await query(
      `INSERT INTO reservations
         (id, booking_code, customer_id, room_id, room_type,
          check_in_date, check_out_date, nights, guests,
          total_amount, paid_amount, booking_status, special_requests, booking_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        reservationId, bookingCode, customerId, assignedRoomId, assignedRoomType,
        inDate, outDate, nights, guestCount,
        total, paid, initialStatus, specialRequests ? specialRequests.trim() : '', bookingSource ? bookingSource.trim() : 'Website'
      ]
    );

    // ── 5. Update room status → reserved ───────────────────────────────────
    await query("UPDATE rooms SET status = 'reserved' WHERE id = $1", [assignedRoomId]);

    // ── 6. Insert payment record if paid > 0 ──────────────────────────────
    if (paid > 0) {
      await query(
        `INSERT INTO payments (id, reservation_id, booking_code, amount, payment_method, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`pay-${Date.now()}`, reservationId, bookingCode, paid, 'Credit Card', 'Paid']
      );
    }

    // ── 7. Log activity ────────────────────────────────────────────────────
    await logActivity(
      customerName, 'Customer',
      'New Reservation Created', 'Bookings',
      `Booking ${bookingCode} created for ${customerName} (${inDate} to ${outDate}).`
    );

    return res.status(201).json({
      status: 200,
      success: true,
      bookingReference: bookingCode,
      bookingCode,
      reservationId,
      message: `Reservation ${bookingCode} successfully created.`,
      erpPayload: { bookingReference: bookingCode, guestName: customerName, checkIn: inDate, checkOut: outDate, totalPrice: total }
    });
  } catch (error) {
    console.error('createReservation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create reservation.' });
  }
}

export async function getAllReservations(req, res) {
  try {
    const result = await query(`
      SELECT
        r.id,
        r.booking_code,
        r.customer_id,
        c.name  AS guest_name,
        c.phone AS guest_phone,
        c.email AS guest_email,
        r.room_id,
        rm.room_number,
        r.room_type,
        r.check_in_date,
        r.check_out_date,
        r.nights,
        r.guests,
        r.total_amount,
        r.paid_amount,
        r.booking_status,
        r.special_requests,
        r.booking_source,
        r.created_at
      FROM reservations r
      LEFT JOIN customers c  ON c.id  = r.customer_id
      LEFT JOIN rooms     rm ON rm.id = r.room_id
      ORDER BY r.created_at DESC
    `);

    const reservations = result.rows.map((r) => {
      let status = r.booking_status;
      if (status === 'confirmed')   status = 'Confirmed';
      else if (status === 'checked_in')  status = 'Checked-in';
      else if (status === 'checked_out') status = 'Checked-out';
      else if (status === 'cancelled')   status = 'Cancelled';
      else if (status === 'pending')     status = 'Pending';

      return {
        id: r.id,
        bookingCode: r.booking_code,
        guestId: r.customer_id,
        guestName: r.guest_name || 'Guest',
        guestPhone: r.guest_phone || '',
        guestEmail: r.guest_email || '',
        roomId: r.room_id,
        roomNumber: r.room_number || 'Unassigned',
        roomType: r.room_type,
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        nights: r.nights,
        guests: r.guests,
        totalAmount: parseFloat(r.total_amount),
        paidAmount: parseFloat(r.paid_amount),
        status,
        specialRequests: r.special_requests,
        bookingSource: r.booking_source,
        createdAt: r.created_at
      };
    });

    return res.json({ success: true, bookings: reservations, reservations });
  } catch (error) {
    console.error('getAllReservations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reservations.' });
  }
}

export async function updateReservationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, roomId, settlePayment } = req.body;

    if (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid reservation status. Allowed statuses: pending, confirmed, checked-in, checked-out, cancelled.`
      });
    }

    // Fetch current reservation
    const resResult = await query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (resResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const reservation = resResult.rows[0];
    const lowerStatus = status.trim().toLowerCase().replace(/-/g, '_');
    const targetRoomId = roomId ? roomId.trim() : reservation.room_id;

    // ── Role Security: Only Admin and Manager can cancel reservations ────────
    const userRoleLower = req.user ? (req.user.role || '').toLowerCase() : '';
    if (lowerStatus === 'cancelled' && userRoleLower === 'receptionist') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Admin and Manager roles have permission to cancel reservations.'
      });
    }

    // ── Update reservation status ──────────────────────────────────────────
    await query(
      'UPDATE reservations SET booking_status = $2 WHERE id = $1',
      [id, lowerStatus]
    );

    // ── Sync room status ───────────────────────────────────────────────────
    if (targetRoomId) {
      let newRoomStatus;
      if (lowerStatus === 'checked_in')                              newRoomStatus = 'occupied';
      else if (lowerStatus === 'checked_out' || lowerStatus === 'cancelled') newRoomStatus = 'available';
      else if (lowerStatus === 'confirmed')                          newRoomStatus = 'reserved';

      if (newRoomStatus) {
        await query('UPDATE rooms SET status = $2 WHERE id = $1', [targetRoomId, newRoomStatus]);
      }
    }

    // ── Auto-settle payment on Check-Out ───────────────────────────────────
    if (lowerStatus === 'checked_out') {
      const totalAmt = parseFloat(reservation.total_amount) || 0;
      const alreadyPaid = parseFloat(reservation.paid_amount) || 0;
      const outstanding = Math.max(0, totalAmt - alreadyPaid);

      // Mark reservation as fully paid
      await query('UPDATE reservations SET paid_amount = $2 WHERE id = $1', [id, totalAmt]);

      // Insert payment record if there's an outstanding balance
      if (outstanding > 0 || settlePayment) {
        await query(
          `INSERT INTO payments (id, reservation_id, booking_code, amount, payment_method, payment_status, settled_at_checkout)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
          [
            `pay-${Date.now()}`,
            id,
            reservation.booking_code,
            outstanding > 0 ? outstanding : totalAmt,
            'Front Desk Settlement',
            'Paid'
          ]
        );
      }
    }

    // ── Activity log ───────────────────────────────────────────────────────
    const userName = req.user ? req.user.name : 'Front Desk';
    const userRole = req.user ? req.user.role : 'Receptionist';
    let logMsg;
    if (lowerStatus === 'checked_out') {
      logMsg = `Guest checked out. Payment settled. Room released to Available.`;
    } else if (lowerStatus === 'checked_in') {
      logMsg = `Guest checked in. Room set to Occupied.`;
    } else if (lowerStatus === 'cancelled') {
      logMsg = `Reservation ${reservation.booking_code} cancelled. Room released to Available.`;
    } else {
      logMsg = `Reservation ${reservation.booking_code} status updated to '${status}'.`;
    }

    await logActivity(userName, userRole, 'Booking Status Update', 'Bookings', logMsg);

    return res.json({
      success: true,
      message: `Reservation status updated to ${status}.`,
      roomStatus: lowerStatus === 'checked_out' || lowerStatus === 'cancelled'
        ? 'available'
        : lowerStatus === 'checked_in' ? 'occupied' : 'reserved'
    });
  } catch (error) {
    console.error('updateReservationStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update reservation status.' });
  }
}

export async function deleteReservation(req, res) {
  try {
    const { id } = req.params;

    // Check if reservation exists
    const resResult = await query('SELECT room_id FROM reservations WHERE id = $1', [id]);
    if (resResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // Free up the room first
    if (resResult.rows[0].room_id) {
      await query("UPDATE rooms SET status = 'available' WHERE id = $1", [resResult.rows[0].room_id]);
    }

    await query('DELETE FROM reservations WHERE id = $1', [id]);

    return res.json({ success: true, message: 'Reservation deleted successfully.' });
  } catch (error) {
    console.error('deleteReservation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete reservation.' });
  }
}

export async function getMyReservations(req, res) {
  try {
    const userEmail = req.user ? req.user.email : null;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const result = await query(
      `SELECT
        r.id,
        r.booking_code AS "bookingCode",
        r.customer_id AS "customerId",
        r.room_id AS "roomId",
        r.room_type AS "roomType",
        r.check_in_date AS "checkInDate",
        r.check_out_date AS "checkOutDate",
        r.nights,
        r.guests,
        r.total_amount AS "totalAmount",
        r.paid_amount AS "paidAmount",
        r.booking_status AS "bookingStatus",
        r.special_requests AS "specialRequests",
        r.created_at AS "createdAt",
        rm.room_number AS "roomNumber",
        rm.name AS "roomName",
        rm.image AS "roomImage",
        rm.price AS "pricePerNight"
       FROM reservations r
       JOIN customers c ON r.customer_id = c.id
       LEFT JOIN rooms rm ON r.room_id = rm.id
       WHERE LOWER(c.email) = LOWER($1)
       ORDER BY r.created_at DESC`,
      [userEmail]
    );

    return res.json({
      success: true,
      reservations: result.rows
    });
  } catch (error) {
    console.error('getMyReservations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch personal reservations.' });
  }
}

