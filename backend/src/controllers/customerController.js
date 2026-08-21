import { query } from '../db/pool.js';
import { sanitizeInput } from '../utils/sanitize.js';

export async function getAllCustomers(req, res) {
  try {
    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.cnic_passport,
        c.created_at,
        u.created_at                                              AS registration_date,
        COALESCE(u.status, 'active')                              AS account_status,
        COUNT(r.id)                                               AS visit_count,
        COALESCE(SUM(r.paid_amount), 0)                           AS total_spent,
        MAX(r.created_at)                                         AS last_stay_at,
        (SELECT r2.check_in_date  FROM reservations r2 WHERE r2.customer_id = c.id ORDER BY r2.created_at DESC LIMIT 1) AS check_in_date,
        (SELECT r2.check_out_date FROM reservations r2 WHERE r2.customer_id = c.id ORDER BY r2.created_at DESC LIMIT 1) AS check_out_date,
        (SELECT r2.room_id        FROM reservations r2 WHERE r2.customer_id = c.id ORDER BY r2.created_at DESC LIMIT 1) AS assigned_room_id,
        (SELECT r2.total_amount   FROM reservations r2 WHERE r2.customer_id = c.id ORDER BY r2.created_at DESC LIMIT 1) AS last_total,
        (SELECT r2.paid_amount    FROM reservations r2 WHERE r2.customer_id = c.id ORDER BY r2.created_at DESC LIMIT 1) AS last_paid
      FROM customers c
      LEFT JOIN users u ON LOWER(u.email) = LOWER(c.email)
      LEFT JOIN reservations r ON r.customer_id = c.id
      GROUP BY c.id, u.created_at, u.status
      ORDER BY c.created_at DESC
    `);

    const customers = await Promise.all(result.rows.map(async (c) => {
      let roomNumber = '';
      if (c.assigned_room_id) {
        const rmResult = await query('SELECT room_number FROM rooms WHERE id = $1', [c.assigned_room_id]);
        if (rmResult.rows.length > 0) roomNumber = rmResult.rows[0].room_number;
      }

      // Fetch booking history list for this customer
      const resList = await query(
        `SELECT id, booking_code, room_type, check_in_date, check_out_date, nights, guests, total_amount, paid_amount, booking_status
         FROM reservations
         WHERE customer_id = $1 OR LOWER(customer_id) IN (SELECT id FROM customers WHERE LOWER(email) = LOWER($2))
         ORDER BY created_at DESC`,
        [c.id, c.email]
      );

      const bookingHistory = resList.rows.map((r) => {
        let bStatus = r.booking_status || 'pending';
        if (bStatus.toLowerCase() === 'confirmed') bStatus = 'Confirmed';
        else if (bStatus.toLowerCase() === 'checked_in' || bStatus.toLowerCase() === 'checked-in') bStatus = 'Checked-in';
        else if (bStatus.toLowerCase() === 'checked_out' || bStatus.toLowerCase() === 'checked-out') bStatus = 'Checked-out';
        else if (bStatus.toLowerCase() === 'cancelled') bStatus = 'Cancelled';
        else if (bStatus.toLowerCase() === 'pending') bStatus = 'Pending';

        return {
          id: r.id,
          bookingCode: r.booking_code,
          roomType: r.room_type,
          checkInDate: r.check_in_date,
          checkOutDate: r.check_out_date,
          nights: r.nights,
          guests: r.guests,
          totalAmount: parseFloat(r.total_amount) || 0,
          paidAmount: parseFloat(r.paid_amount) || 0,
          status: bStatus
        };
      });

      const lastTotal = parseFloat(c.last_total) || 0;
      const lastPaid = parseFloat(c.last_paid) || 0;
      const totalSpent = parseFloat(c.total_spent) || 0;
      const isPaid = lastTotal > 0 && lastPaid >= lastTotal;

      return {
        id: c.id,
        fullName: c.name,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address || '',
        totalSpent,
        visits: parseInt(c.visit_count, 10) || 0,
        vipStatus: totalSpent > 1000,
        checkInDate: c.check_in_date || '',
        checkOutDate: c.check_out_date || '',
        assignedRoomId: c.assigned_room_id || '',
        assignedRoomNumber: roomNumber,
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        paidAmount: lastPaid,
        totalAmount: lastTotal,
        registrationDate: c.registration_date || c.created_at,
        accountStatus: (c.account_status || 'active') === 'active' ? 'Active' : 'Inactive',
        bookingHistory
      };
    }));

    return res.json({ success: true, customers, guests: customers });
  } catch (error) {
    console.error('getAllCustomers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, fullName, email, phone, address } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Name must be a valid string.' });
    }
    if (fullName !== undefined && typeof fullName !== 'string') {
      return res.status(400).json({ success: false, message: 'Full name must be a valid string.' });
    }
    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email must be a valid string.' });
    }
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (address !== undefined && address !== null && typeof address !== 'string') {
      return res.status(400).json({ success: false, message: 'Address must be a valid string.' });
    }

    const cName = sanitizeInput(name || fullName || '');
    const cleanEmail = email ? sanitizeInput(email).toLowerCase() : '';
    const cleanPhone = phone ? sanitizeInput(phone) : '';
    const cleanAddress = address ? sanitizeInput(address) : '';

    if (!cName || !cleanEmail) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await query('SELECT id FROM customers WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Customer with this email already exists.' });
    }

    const id = `gst-${Date.now()}`;
    await query(
      'INSERT INTO customers (id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5)',
      [id, cName, cleanEmail, cleanPhone, cleanAddress]
    );

    return res.status(201).json({ success: true, message: 'Customer created successfully.', customer: { id, name: cName, email: cleanEmail } });
  } catch (error) {
    console.error('createCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create customer.' });
  }
}

export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, fullName, email, phone, address } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Name must be a valid string.' });
    }
    if (fullName !== undefined && typeof fullName !== 'string') {
      return res.status(400).json({ success: false, message: 'Full name must be a valid string.' });
    }
    if (email !== undefined && typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email must be a valid string.' });
    }
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (address !== undefined && address !== null && typeof address !== 'string') {
      return res.status(400).json({ success: false, message: 'Address must be a valid string.' });
    }

    const existing = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const c = existing.rows[0];
    const rawName = (name || fullName !== undefined ? (name || fullName) : c.name);
    const newName = sanitizeInput(rawName);
    const newEmail = email !== undefined ? sanitizeInput(email).toLowerCase() : c.email;
    const newPhone = phone !== undefined && phone !== null ? sanitizeInput(phone) : c.phone;
    const newAddress = address !== undefined && address !== null ? sanitizeInput(address) : c.address;

    await query(
      'UPDATE customers SET name=$2, email=$3, phone=$4, address=$5 WHERE id=$1',
      [id, newName || c.name, newEmail, newPhone, newAddress]
    );

    return res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    console.error('updateCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
}

export async function updateCustomerPayment(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (typeof paymentStatus !== 'string') {
      return res.status(400).json({ success: false, message: 'Payment status must be a valid string.' });
    }

    const isPaid = paymentStatus.trim().toLowerCase() === 'paid';
    const customerResult = await query('SELECT * FROM customers WHERE id = $1', [id]);

    let targetReservations = [];

    if (customerResult.rows.length > 0) {
      const cust = customerResult.rows[0];
      const resQuery = await query(
        `SELECT id, booking_code, room_id, total_amount, booking_status
         FROM reservations
         WHERE customer_id = $1 AND booking_status NOT IN ('cancelled', 'checked_out')`,
        [id]
      );
      targetReservations = resQuery.rows;

      if (isPaid) {
        await query(
          `UPDATE reservations
           SET paid_amount = total_amount,
               booking_status = CASE WHEN booking_status = 'pending' THEN 'confirmed' ELSE booking_status END
           WHERE customer_id = $1 AND booking_status NOT IN ('cancelled', 'checked_out')`,
          [id]
        );

        // Auto-reserve rooms associated with these reservations
        for (const r of targetReservations) {
          if (r.room_id) {
            await query(
              `UPDATE rooms
               SET status = 'reserved'
               WHERE id = $1 AND status NOT IN ('occupied', 'maintenance')`,
              [r.room_id]
            );
          }

          // Insert or update payment record
          const existingPay = await query('SELECT id FROM payments WHERE reservation_id = $1 OR booking_code = $2', [r.id, r.booking_code]);
          if (existingPay.rows.length === 0) {
            await query(
              `INSERT INTO payments (id, reservation_id, booking_code, amount, payment_method, payment_status)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [`pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, r.id, r.booking_code, r.total_amount, 'Credit Card', 'Paid']
            );
          } else {
            await query('UPDATE payments SET payment_status = $1, amount = $2 WHERE reservation_id = $3', ['Paid', r.total_amount, r.id]);
          }
        }
      } else {
        await query(
          `UPDATE reservations
           SET paid_amount = 0,
               booking_status = CASE WHEN booking_status = 'confirmed' THEN 'pending' ELSE booking_status END
           WHERE customer_id = $1 AND booking_status NOT IN ('cancelled', 'checked_out')`,
          [id]
        );

        for (const r of targetReservations) {
          if (r.room_id) {
            await query(
              `UPDATE rooms
               SET status = 'available'
               WHERE id = $1 AND status = 'reserved'`,
              [r.room_id]
            );
          }
          await query('UPDATE payments SET payment_status = $1, amount = 0 WHERE reservation_id = $2', ['Pending', r.id]);
        }
      }
    } else {
      // Check if id is a reservation id or booking code
      const resResult = await query(
        'SELECT id, customer_id, booking_code, room_id, total_amount, booking_status FROM reservations WHERE id = $1 OR booking_code = $1',
        [id]
      );
      if (resResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer or reservation not found.' });
      }
      const resRow = resResult.rows[0];

      if (isPaid) {
        await query(
          `UPDATE reservations
           SET paid_amount = total_amount,
               booking_status = CASE WHEN booking_status = 'pending' THEN 'confirmed' ELSE booking_status END
           WHERE id = $1`,
          [resRow.id]
        );

        if (resRow.room_id) {
          await query(
            `UPDATE rooms
             SET status = 'reserved'
             WHERE id = $1 AND status NOT IN ('occupied', 'maintenance')`,
            [resRow.room_id]
          );
        }

        const existingPay = await query('SELECT id FROM payments WHERE reservation_id = $1 OR booking_code = $2', [resRow.id, resRow.booking_code]);
        if (existingPay.rows.length === 0) {
          await query(
            `INSERT INTO payments (id, reservation_id, booking_code, amount, payment_method, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [`pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, resRow.id, resRow.booking_code, resRow.total_amount, 'Credit Card', 'Paid']
          );
        } else {
          await query('UPDATE payments SET payment_status = $1, amount = $2 WHERE reservation_id = $3', ['Paid', resRow.total_amount, resRow.id]);
        }
      } else {
        await query(
          `UPDATE reservations
           SET paid_amount = 0,
               booking_status = CASE WHEN booking_status = 'confirmed' THEN 'pending' ELSE booking_status END
           WHERE id = $1`,
          [resRow.id]
        );

        if (resRow.room_id) {
          await query(
            `UPDATE rooms
             SET status = 'available'
             WHERE id = $1 AND status = 'reserved'`,
            [resRow.room_id]
          );
        }
        await query('UPDATE payments SET payment_status = $1, amount = 0 WHERE reservation_id = $2', ['Pending', resRow.id]);
      }
    }

    return res.json({
      success: true,
      message: `Payment status updated to ${isPaid ? 'PAID' : 'PENDING'}. Room status auto-updated and revenue synchronized in database.`
    });
  } catch (error) {
    console.error('updateCustomerPayment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payment status.' });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Cascade: delete customer's reservations first (FK constraint)
    await query('DELETE FROM reservations WHERE customer_id = $1', [id]);
    await query('DELETE FROM customers WHERE id = $1', [id]);

    return res.json({ success: true, message: 'Customer deleted successfully from database.' });
  } catch (error) {
    console.error('deleteCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete customer.' });
  }
}

