import { query } from '../db/pool.js';

export async function getAllInvoices(req, res) {
  try {
    // Auto-generate invoices for all reservations (JOIN with customers + rooms)
    const reservationInvoices = await query(`
      SELECT
        r.id              AS res_id,
        r.booking_code,
        r.total_amount,
        r.paid_amount,
        r.booking_status,
        r.check_in_date,
        r.check_out_date,
        r.created_at,
        c.name            AS guest_name,
        c.email           AS guest_email,
        c.phone           AS guest_phone,
        rm.room_number
      FROM reservations r
      LEFT JOIN customers c  ON c.id  = r.customer_id
      LEFT JOIN rooms     rm ON rm.id = r.room_id
      ORDER BY r.created_at DESC
    `);

    const autoInvoices = reservationInvoices.rows.map((r) => {
      const total = parseFloat(r.total_amount) || 0;
      const statusLower = (r.booking_status || '').toLowerCase();
      const isPaid = (statusLower === 'checked_out' || statusLower === 'checked-out' || (parseFloat(r.paid_amount) >= total && total > 0)) && statusLower !== 'pending' && statusLower !== 'cancelled';
      const paidAmt = isPaid ? total : (parseFloat(r.paid_amount) || 0);

      return {
        id: `inv-${r.res_id}`,
        invoiceNumber: `INV-${r.booking_code || r.res_id.slice(-6).toUpperCase()}`,
        bookingId: r.res_id,
        guestName: r.guest_name || 'Guest',
        guestEmail: r.guest_email || '',
        guestPhone: r.guest_phone || '',
        roomNumber: r.room_number || 'Unassigned',
        issueDate: r.check_in_date || new Date().toISOString().split('T')[0],
        dueDate: r.check_out_date || new Date().toISOString().split('T')[0],
        items: [{
          id: `item-${r.res_id}`,
          description: `Room Stay Charges (Room #${r.room_number || 'Room'} - ${r.booking_code})`,
          category: 'Room Charge',
          amount: total,
          quantity: 1
        }],
        subtotalAmount: total,
        discountAmount: 0,
        taxAmount: Math.round(total * 0.1),
        totalAmount: total,
        paidAmount: paidAmt,
        dueAmount: Math.max(0, total - paidAmt),
        status: isPaid ? 'Paid' : 'Pending',
        paymentMethod: 'Credit Card',
        createdAt: r.created_at
      };
    });

    // Custom invoices stored directly in invoices table
    const customResult = await query('SELECT * FROM invoices ORDER BY created_at DESC');
    const customInvoices = customResult.rows.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      bookingId: inv.booking_id,
      guestName: inv.guest_name || 'Guest',
      guestEmail: inv.guest_email || '',
      guestPhone: inv.guest_phone || '',
      roomNumber: inv.room_number || '101',
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      items: inv.items || [],
      subtotalAmount: parseFloat(inv.subtotal_amount),
      discountAmount: parseFloat(inv.discount_amount),
      taxAmount: parseFloat(inv.tax_amount),
      totalAmount: parseFloat(inv.total_amount),
      paidAmount: parseFloat(inv.paid_amount),
      dueAmount: parseFloat(inv.due_amount),
      status: inv.status,
      paymentMethod: inv.payment_method,
      createdAt: inv.created_at
    }));

    // Merge: custom invoices override auto-generated ones with same bookingId
    const invoiceMap = new Map();
    autoInvoices.forEach((inv) => invoiceMap.set(inv.id, inv));
    customInvoices.forEach((inv) => invoiceMap.set(inv.id, inv));

    const allInvoices = Array.from(invoiceMap.values());

    return res.json({ success: true, invoices: allInvoices });
  } catch (error) {
    console.error('getAllInvoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch invoices.' });
  }
}

export async function createInvoice(req, res) {
  try {
    const body = req.body;
    const id = `inv-${Date.now()}`;
    const invoiceNumber = (typeof body.invoiceNumber === 'string' && body.invoiceNumber.trim())
      ? body.invoiceNumber.trim()
      : `INV-${Date.now()}`;

    const total = parseFloat(body.totalAmount) || 0;
    const paid = parseFloat(body.paidAmount) || 0;

    if (total < 0 || total > 1000000) {
      return res.status(400).json({ success: false, message: 'Invalid total amount.' });
    }

    await query(
      `INSERT INTO invoices
         (id, invoice_number, booking_id, guest_name, guest_email, guest_phone,
          room_number, items, subtotal_amount, discount_amount, tax_amount,
          total_amount, paid_amount, due_amount, status, payment_method,
          issue_date, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        id,
        invoiceNumber,
        typeof body.bookingId === 'string' ? body.bookingId.trim() : '',
        typeof body.guestName === 'string' ? body.guestName.trim() : 'Guest',
        typeof body.guestEmail === 'string' ? body.guestEmail.trim().toLowerCase() : '',
        typeof body.guestPhone === 'string' ? body.guestPhone.trim() : '',
        typeof body.roomNumber === 'string' ? body.roomNumber.trim() : '101',
        JSON.stringify(Array.isArray(body.items) ? body.items : []),
        parseFloat(body.subtotalAmount) || total,
        parseFloat(body.discountAmount) || 0,
        parseFloat(body.taxAmount) || 0,
        total,
        paid,
        body.dueAmount !== undefined ? parseFloat(body.dueAmount) : Math.max(0, total - paid),
        typeof body.status === 'string' ? body.status.trim() : 'Pending',
        typeof body.paymentMethod === 'string' ? body.paymentMethod.trim() : 'Credit Card',
        typeof body.issueDate === 'string' ? body.issueDate.trim() : new Date().toISOString().split('T')[0],
        typeof body.dueDate === 'string' ? body.dueDate.trim() : new Date().toISOString().split('T')[0]
      ]
    );

    return res.status(201).json({ success: true, message: 'Invoice created successfully.', invoice: { id, invoiceNumber } });
  } catch (error) {
    console.error('createInvoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create invoice.' });
  }
}

