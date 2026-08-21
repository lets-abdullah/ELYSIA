import { query } from '../db/pool.js';
import { sanitizeInput } from '../utils/sanitize.js';
import { autoCleanExpiredPendingBookings } from '../jobs/bookingCleanupJob.js';

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

    // ── Type & Input Sanitization (XSS Prevention) ─────────────────────────
    const rawName = sanitizeInput(guestName || name);
    const cleanEmail = email ? sanitizeInput(email).toLowerCase() : '';
    const cleanPhone = phone ? sanitizeInput(phone) : '';
    const cleanSpecialRequests = specialRequests ? sanitizeInput(specialRequests) : '';
    const cleanCnicPassport = cnicPassport ? sanitizeInput(cnicPassport) : '';
    const cleanAddress = address ? sanitizeInput(address) : '';
    const cleanBookingSource = bookingSource ? sanitizeInput(bookingSource) : 'Website';

    const inDate = checkIn || checkInDate;
    const outDate = checkOut || checkOutDate;

    if (!rawName || !cleanEmail || !cleanPhone || !inDate || !outDate) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, check-in, and check-out dates are required.' });
    }

    if (rawName.length < 2 || rawName.length > 100) {
      return res.status(400).json({ success: false, message: 'Guest name must be between 2 and 100 characters.' });
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

    // ── 1. Room Assignment & Database Price Resolution ─────────────────────
    // Fetch authoritative room details and room price directly from Database!
    let assignedRoomId = roomId ? sanitizeInput(roomId) : null;
    let assignedRoomType = roomType ? sanitizeInput(roomType) : 'Standard';
    let roomPricePerNight = 0;

    if (assignedRoomId) {
      const rmResult = await query(
        'SELECT * FROM rooms WHERE id = $1 OR room_number = $1',
        [assignedRoomId]
      );
      if (rmResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected room not found.'
        });
      }
      const rm = rmResult.rows[0];
      if (rm.status && rm.status.toLowerCase() !== 'available') {
        return res.status(400).json({
          success: false,
          message: `Room #${rm.room_number} is currently reserved or unavailable.`
        });
      }
      assignedRoomType = rm.type || assignedRoomType;
      assignedRoomId = rm.id;
      roomPricePerNight = parseFloat(rm.price) || 0;
    } else {
      // Auto-assign first available room of the requested type
      const matchResult = await query(
        `SELECT * FROM rooms
         WHERE (type = $1 OR type ILIKE $1) AND status = 'available'
         ORDER BY room_number ASC
         LIMIT 1`,
        [assignedRoomType]
      );
      if (matchResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No available rooms found for category ${assignedRoomType}.`
        });
      }
      const rm = matchResult.rows[0];
      assignedRoomId = rm.id;
      assignedRoomType = rm.type || assignedRoomType;
      roomPricePerNight = parseFloat(rm.price) || 0;
    }

    if (roomPricePerNight <= 0) {
      roomPricePerNight = 150; // Fallback safe base rate
    }

    // ── 2. Authoritative Server-Side Price Calculation ────────────────────
    // NEVER trust client-supplied totalPrice or totalAmount!
    const serverCalculatedTotal = roomPricePerNight * nights;

    // Only authorized staff (admin/manager/receptionist) can override price manually if needed
    const userRoleLower = req.user ? (req.user.role || '').toLowerCase() : '';
    const isStaff = ['admin', 'manager', 'receptionist'].includes(userRoleLower);

    let total = serverCalculatedTotal;
    if (isStaff && (totalPrice !== undefined || totalAmount !== undefined)) {
      const customPrice = parseFloat(totalPrice !== undefined ? totalPrice : totalAmount);
      if (!isNaN(customPrice) && customPrice >= 0) {
        total = customPrice;
      }
    }

    // ── 3. Single Active Booking Restriction ──────────────────────────────
    // A customer/user cannot book a 2nd room while they have an active booking!
    if (!isStaff) {
      const activeRes = await query(
        `SELECT r.booking_code, r.booking_status
         FROM reservations r
         JOIN customers c ON r.customer_id = c.id
         WHERE (LOWER(c.email) = LOWER($1) OR c.phone = $2)
           AND r.booking_status IN ('pending', 'confirmed', 'checked_in', 'checked-in')
         LIMIT 1`,
        [cleanEmail, cleanPhone]
      );
      if (activeRes.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Active reservation already exists (${activeRes.rows[0].booking_code} - ${activeRes.rows[0].booking_status}). You can only book 1 room at a time. Please wait until your current stay is completed or cancelled.`
        });
      }
    }

    // ── 4. Paid Amount & Status Validation ────────────────────────────────
    let paid = 0;
    if (isStaff && paidAmount !== undefined) {
      const parsedPaid = parseFloat(paidAmount);
      if (!isNaN(parsedPaid) && parsedPaid >= 0 && parsedPaid <= total) {
        paid = parsedPaid;
      }
    }

    let initialStatus = 'pending';
    if (isStaff && status !== undefined && status !== null) {
      if (ALLOWED_STATUSES.includes(status.trim().toLowerCase())) {
        initialStatus = status.trim().toLowerCase().replace(/-/g, '_');
      }
    }

    // ── 5. Find or create customer ──────────────────────────────────────────
    let customerResult = await query('SELECT * FROM customers WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    let customerId;

    if (customerResult.rows.length === 0) {
      customerId = `gst-${Date.now()}`;
      await query(
        `INSERT INTO customers (id, name, email, phone, address, cnic_passport)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerId, rawName, cleanEmail, cleanPhone, cleanAddress, cleanCnicPassport]
      );
    } else {
      customerId = customerResult.rows[0].id;
      // Update phone/name if changed
      await query('UPDATE customers SET name = $2, phone = $3 WHERE id = $1', [customerId, rawName, cleanPhone]);
    }

    // ── 5. Generate Reference Code ──────────────────────────────────────────
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-2026-${randomNum}`;
    const reservationId = `bk-${Date.now()}`;

    // ── 6. Insert reservation ──────────────────────────────────────────────
    await query(
      `INSERT INTO reservations
         (id, booking_code, customer_id, room_id, room_type,
          check_in_date, check_out_date, nights, guests,
          total_amount, paid_amount, booking_status, special_requests, booking_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        reservationId, bookingCode, customerId, assignedRoomId, assignedRoomType,
        inDate, outDate, nights, guestCount,
        total, paid, initialStatus, cleanSpecialRequests, cleanBookingSource
      ]
    );

    // ── 7. Update room status ONLY if confirmed or checked-in ───────────────
    if (initialStatus === 'confirmed') {
      await query("UPDATE rooms SET status = 'reserved' WHERE id = $1", [assignedRoomId]);
    } else if (initialStatus === 'checked_in') {
      await query("UPDATE rooms SET status = 'occupied' WHERE id = $1", [assignedRoomId]);
    }

    // ── 8. Insert payment record ONLY if explicit paid amount > 0 ───────────
    if (paid > 0) {
      await query(
        `INSERT INTO payments (id, reservation_id, booking_code, amount, payment_method, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`pay-${Date.now()}`, reservationId, bookingCode, paid, 'Credit Card', paid >= total ? 'Paid' : 'Pending']
      );
    }

    // ── 9. Log activity ────────────────────────────────────────────────────
    await logActivity(
      rawName, isStaff ? req.user.name : 'Customer',
      'New Reservation Created', 'Bookings',
      `Booking ${bookingCode} created for ${rawName} (${inDate} to ${outDate}). Total: $${total}`
    );

    return res.status(201).json({
      status: 200,
      success: true,
      bookingReference: bookingCode,
      bookingCode,
      reservationId,
      message: `Reservation ${bookingCode} successfully created.`,
      erpPayload: { bookingReference: bookingCode, guestName: rawName, checkIn: inDate, checkOut: outDate, totalPrice: total }
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

    if (roomId !== undefined && roomId !== null && typeof roomId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid roomId parameter. Must be a string.'
      });
    }

    // Fetch current reservation
    const resResult = await query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (resResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const reservation = resResult.rows[0];
    const lowerStatus = status.trim().toLowerCase().replace(/-/g, '_');
    const targetRoomId = (typeof roomId === 'string' && roomId.trim() !== '') ? roomId.trim() : reservation.room_id;

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
      if (lowerStatus === 'checked_in') {
        newRoomStatus = 'occupied';
      } else if (lowerStatus === 'confirmed') {
        newRoomStatus = 'reserved';
      } else if (lowerStatus === 'checked_out' || lowerStatus === 'cancelled' || lowerStatus === 'pending') {
        newRoomStatus = 'available';
      }

      if (newRoomStatus) {
        await query('UPDATE rooms SET status = $2 WHERE id = $1', [targetRoomId, newRoomStatus]);
      }
    }

    // ── Activity log ───────────────────────────────────────────────────────
    const userName = req.user ? req.user.name : 'Front Desk';
    const userRole = req.user ? req.user.role : 'Receptionist';
    let logMsg;
    if (lowerStatus === 'checked_out') {
      logMsg = `Guest checked out. Room released to Available.`;
    } else if (lowerStatus === 'checked_in') {
      logMsg = `Guest checked in. Room set to Occupied.`;
    } else if (lowerStatus === 'confirmed') {
      logMsg = `Reservation ${reservation.booking_code} confirmed. Room set to Reserved.`;
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

export async function cleanupFakeBookings(req, res) {
  try {
    // 1. Also clean up any expired pending bookings (> 1 hour old)
    await autoCleanExpiredPendingBookings();

    const resList = await query(`
      SELECT r.*, c.email AS cust_email, c.name AS cust_name, rm.price AS room_price, rm.room_number
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN rooms rm ON rm.id = r.room_id
      ORDER BY r.created_at DESC
    `);

    const customerMap = new Map();
    for (const row of resList.rows) {
      const emailKey = (row.cust_email || row.customer_id || 'unknown').toLowerCase();
      if (!customerMap.has(emailKey)) {
        customerMap.set(emailKey, []);
      }
      customerMap.get(emailKey).push(row);
    }

    let deletedCount = 0;
    let updatedCount = 0;

    for (const [email, bookings] of customerMap.entries()) {
      const keepBooking = bookings[0];
      const deleteBookings = bookings.slice(1);

      for (const toDelete of deleteBookings) {
        await query('DELETE FROM payments WHERE reservation_id = $1 OR booking_code = $2', [toDelete.id, toDelete.booking_code]);
        await query('DELETE FROM invoices WHERE booking_id = $1', [toDelete.id]);
        await query('DELETE FROM reservations WHERE id = $1', [toDelete.id]);
        deletedCount++;
      }

      let officialRoomPrice = parseFloat(keepBooking.room_price) || 0;
      if (officialRoomPrice <= 0 && keepBooking.room_id) {
        const rm = await query('SELECT price FROM rooms WHERE id = $1', [keepBooking.room_id]);
        if (rm.rows.length > 0) {
          officialRoomPrice = parseFloat(rm.rows[0].price) || 0;
        }
      }
      if (officialRoomPrice <= 0) {
        officialRoomPrice = 198;
      }

      const nights = Math.max(1, parseInt(keepBooking.nights, 10) || 1);
      const originalTotalPrice = officialRoomPrice * nights;

      await query(
        `UPDATE reservations
         SET total_amount = $1, paid_amount = 0, booking_status = 'pending'
         WHERE id = $2`,
        [originalTotalPrice, keepBooking.id]
      );
      await query('DELETE FROM payments WHERE reservation_id = $1 OR booking_code = $2', [keepBooking.id, keepBooking.booking_code]);

      const cleanCustName = sanitizeInput(keepBooking.cust_name) || 'Guest User';
      const warningMsg = 'Security Warning: You have attempted spam, manipulated room rates, or duplicate bookings. Fake and unauthorized bookings are strictly prohibited and will be automatically cancelled. Repeated violations may result in permanent account suspension.';

      await query(
        `UPDATE customers
         SET name = $1, warning_message = $2
         WHERE id = $3 OR LOWER(email) = LOWER($4)`,
        [cleanCustName, warningMsg, keepBooking.customer_id, email]
      );

      await query(
        `UPDATE users
         SET warning_message = $1
         WHERE LOWER(email) = LOWER($2)`,
        [warningMsg, email]
      );
      updatedCount++;
    }

    return res.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} extra fake bookings. Restored original room prices to Unpaid for ${updatedCount} profiles.`,
      deletedCount,
      updatedCount
    });
  } catch (error) {
    console.error('cleanupFakeBookings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cleanup fake bookings.' });
  }
}


