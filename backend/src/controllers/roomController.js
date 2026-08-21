import { query } from '../db/pool.js';

/** Shape a raw DB row into the format the Frontend/ERP expect */
function formatRoom(r) {
  return {
    id: r.id,
    name: r.name || `${r.type} ${r.room_number}`,
    roomNumber: r.room_number,
    tagline: r.notes || `Experience luxury in ${r.name || r.room_number}`,
    category: r.type || 'Deluxe',
    pricePerNight: parseFloat(r.price),
    price: parseFloat(r.price),
    sizeSqFt: 450 + (r.floor || 1) * 50,
    maxGuests: r.capacity || 2,
    capacity: r.capacity || 2,
    bedType: r.bed_type || 'King Bed',
    bed_type: r.bed_type || 'King Bed',
    floor: r.floor || 1,
    view: (r.floor || 1) > 3 ? 'Ocean Sky View' : 'Garden & Pool View',
    image: r.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80',
    gallery: r.gallery || [r.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80'],
    description: r.notes || `Spacious and elegantly furnished ${r.type} room.`,
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    status: r.status || 'available',
    isReserved: r.status === 'reserved' || r.status === 'occupied',
    notes: r.notes || ''
  };
}

export async function getAllRooms(req, res) {
  try {
    const result = await query('SELECT * FROM rooms ORDER BY room_number ASC');
    const rooms = result.rows.map(formatRoom);
    return res.json({ success: true, rooms });
  } catch (error) {
    console.error('getAllRooms error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch rooms.' });
  }
}

export async function getAvailableRooms(req, res) {
  try {
    const { checkIn, checkOut, guests } = req.query;
    const guestNum = parseInt(guests, 10) || 1;

    let sql;
    let params;

    if (checkIn && checkOut) {
      // Exclude rooms with conflicting active reservations
      sql = `
        SELECT r.*
        FROM rooms r
        WHERE r.status != 'maintenance'
          AND r.capacity >= $1
          AND r.id NOT IN (
            SELECT DISTINCT res.room_id
            FROM reservations res
            WHERE res.room_id IS NOT NULL
              AND res.booking_status IN ('confirmed', 'checked_in', 'checked-in')
              AND $2::date < res.check_out_date
              AND $3::date > res.check_in_date
          )
        ORDER BY r.room_number ASC
      `;
      params = [guestNum, checkIn, checkOut];
    } else {
      sql = `
        SELECT * FROM rooms
        WHERE status = 'available'
          AND capacity >= $1
        ORDER BY room_number ASC
      `;
      params = [guestNum];
    }

    const result = await query(sql, params);
    const rooms = result.rows.map(formatRoom);
    return res.json({ success: true, rooms });
  } catch (error) {
    console.error('getAvailableRooms error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch available rooms.' });
  }
}

export async function addRoom(req, res) {
  try {
    const { roomNumber, floor, type, bedType, price, capacity, amenities, status, notes, image, name } = req.body;
    if (!roomNumber || !type || !price) {
      return res.status(400).json({ success: false, message: 'Room number, type, and price are required.' });
    }

    const id = `rm-${Date.now()}`;
    const result = await query(
      `INSERT INTO rooms (id, room_number, floor, type, name, bed_type, price, capacity, amenities, status, notes, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id,
        roomNumber,
        floor || 1,
        type,
        name || `${type} ${roomNumber}`,
        bedType || 'King Bed',
        parseFloat(price),
        parseInt(capacity, 10) || 2,
        JSON.stringify(Array.isArray(amenities) ? amenities : []),
        status || 'available',
        notes || '',
        image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80'
      ]
    );

    return res.status(201).json({ success: true, message: 'Room created successfully.', room: formatRoom(result.rows[0]) });
  } catch (error) {
    console.error('addRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add room.' });
  }
}

export async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const r = existing.rows[0];
    const result = await query(
      `UPDATE rooms SET
        room_number = $2,
        floor       = $3,
        type        = $4,
        name        = $5,
        bed_type    = $6,
        price       = $7,
        capacity    = $8,
        amenities   = $9,
        status      = $10,
        notes       = $11,
        image       = $12
       WHERE id = $1
       RETURNING *`,
      [
        id,
        body.roomNumber || body.room_number || r.room_number,
        body.floor !== undefined ? body.floor : r.floor,
        body.type || r.type,
        body.name || r.name,
        body.bedType || body.bed_type || r.bed_type,
        body.price !== undefined ? parseFloat(body.price) : parseFloat(r.price),
        body.capacity !== undefined ? parseInt(body.capacity, 10) : r.capacity,
        body.amenities !== undefined
          ? JSON.stringify(Array.isArray(body.amenities) ? body.amenities : [])
          : (typeof r.amenities === 'string' ? r.amenities : JSON.stringify(r.amenities || [])),
        body.status || r.status,
        body.notes !== undefined ? body.notes : r.notes,
        body.image || r.image
      ]
    );

    return res.json({ success: true, message: 'Room updated successfully.', room: formatRoom(result.rows[0]) });
  } catch (error) {
    console.error('updateRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update room.' });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const existing = await query('SELECT id FROM rooms WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
    await query('DELETE FROM rooms WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('deleteRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete room.' });
  }
}
