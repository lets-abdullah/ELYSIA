/**
 * seed.js — Run once to populate PostgreSQL with initial data.
 * Idempotent: skips existing records.
 *
 * Usage: node src/db/seed.js
 */

import bcrypt from 'bcryptjs';
import { query } from './pool.js';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ─── 1. Users ────────────────────────────────────────────────────────────
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@GrandLuxe2026!';
  const managerPass = process.env.SEED_MANAGER_PASSWORD || 'Manager@GrandLuxe2026!';
  const receptionPass = process.env.SEED_RECEPTIONIST_PASSWORD || 'Reception@GrandLuxe2026!';

  const salt = bcrypt.genSaltSync(10);
  const usersToSeed = [
    {
      id: 'usr-1',
      name: 'Alexander Wright',
      email: 'a.wright@grandluxe.com',
      password: bcrypt.hashSync(adminPass, salt),
      role: 'admin',
      phone: '+1 (555) 019-2831',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      email: 'e.rostova@grandluxe.com',
      password: bcrypt.hashSync(managerPass, salt),
      role: 'manager',
      phone: '+1 (555) 012-9844',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-3',
      name: 'Marcus Sterling',
      email: 'm.sterling@grandluxe.com',
      password: bcrypt.hashSync(receptionPass, salt),
      role: 'receptionist',
      phone: '+1 (555) 014-3321',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const u of usersToSeed) {
    const exists = await query('SELECT id FROM users WHERE id = $1', [u.id]);
    if (exists.rows.length === 0) {
      await query(
        `INSERT INTO users (id, name, email, password_hash, role, phone, status, avatar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.id, u.name, u.email, u.password, u.role, u.phone, u.status, u.avatar]
      );
      console.log(`  ✅ User created: ${u.name} (${u.role})`);
    } else {
      console.log(`  ⏭️  User already exists: ${u.name}`);
    }
  }

  // ─── 2. Rooms ────────────────────────────────────────────────────────────
  const rooms = [
    {
      id: 'ocean-bedroom', room_number: '101', floor: 1, type: 'Deluxe',
      name: 'Ocean View Deluxe Bedroom', bed_type: 'California King Bed',
      price: 240, capacity: 2,
      amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Marble Bath', 'Coffee Maker', 'Mini Bar', 'Air Conditioning'],
      status: 'available',
      notes: 'Floor-to-ceiling glass paneling framing ocean views.',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'sanctuary-bedroom', room_number: '102', floor: 1, type: 'Standard',
      name: 'Sanctuary Garden Bedroom', bed_type: 'Super King Bed with Silk Linens',
      price: 195, capacity: 2,
      amenities: ['Private Garden Terrace', 'Deep Soaking Tub', 'Artisanal Coffee Lab', 'Wi-Fi'],
      status: 'available',
      notes: 'A private peaceful bedroom overlooking courtyard gardens.',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'ritual-bedroom', room_number: '201', floor: 2, type: 'Deluxe',
      name: 'Wellness Ritual Bedroom', bed_type: 'Emperor Plush Custom Mattress',
      price: 210, capacity: 2,
      amenities: ['Black Marble Soaking Tub', 'Aromatherapy Shower', 'Acoustic Soundproofing', 'Wi-Fi'],
      status: 'available',
      notes: 'Designed around personal care and relaxation.',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'skyward-bedroom', room_number: '202', floor: 2, type: 'Executive',
      name: 'Executive Skyward Bedroom', bed_type: 'Master King Bed',
      price: 320, capacity: 2,
      amenities: ['Executive Workstation', 'High-Speed Wi-Fi', 'Smart TV', 'Rain Shower', 'Espresso Bar'],
      status: 'available',
      notes: 'High-floor executive bedroom with city skyline view.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'imperial-bedroom', room_number: '301', floor: 3, type: 'Presidential Suite',
      name: 'Imperial Master Bedroom', bed_type: 'Grand Emperor King Bed',
      price: 450, capacity: 4,
      amenities: ['Private Jacuzzi', 'Walk-In Closet', '24/7 Room Service', 'Smart TV', 'Wi-Fi'],
      status: 'available',
      notes: 'Grand master bedroom with private balcony and jacuzzi.',
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'horizon-bedroom', room_number: '302', floor: 3, type: 'Deluxe',
      name: 'Horizon Oceanfront Bedroom', bed_type: 'Dual King Beds',
      price: 280, capacity: 4,
      amenities: ['Beach Access', 'Outdoor Rain Shower', 'Private Sun Deck', 'Wi-Fi'],
      status: 'available',
      notes: 'Direct beach views with private sun terrace.',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'celestial-bedroom', room_number: '401', floor: 4, type: 'Executive',
      name: 'Celestial Sky Bedroom', bed_type: 'Custom Stargazer King Bed',
      price: 210, capacity: 2,
      amenities: ['Skylight Glass Window', 'Ambient Lighting', 'Smart TV', 'Wi-Fi'],
      status: 'available',
      notes: 'Bedroom with skylight starry ceiling.',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'aurelia-bedroom', room_number: '501', floor: 5, type: 'Standard',
      name: 'Aurelia Royal Bedroom', bed_type: 'California King Bed',
      price: 180, capacity: 2,
      amenities: ['Marble Bath', 'Private Balcony', 'Nespresso Coffee', 'Wi-Fi'],
      status: 'available',
      notes: 'Italian design with marble bath.',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'terrace-bedroom', room_number: '502', floor: 5, type: 'Standard',
      name: 'Rooftop Terrace Bedroom', bed_type: 'Queen Bed',
      price: 165, capacity: 2,
      amenities: ['Rooftop Terrace Access', 'City View', 'Wi-Fi', 'Smart TV'],
      status: 'available',
      notes: 'Access to private rooftop lounge.',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'penthouse-bedroom', room_number: '601', floor: 6, type: 'Presidential Suite',
      name: 'Grand Penthouse Suite', bed_type: 'California Super King Bed',
      price: 650, capacity: 4,
      amenities: ['Private Pool', 'Panoramic View', 'Butler Service', '24/7 Room Service', 'Smart TV', 'Wi-Fi'],
      status: 'available',
      notes: 'The ultimate luxury experience atop the hotel.',
      image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  for (const r of rooms) {
    const exists = await query('SELECT id FROM rooms WHERE id = $1', [r.id]);
    if (exists.rows.length === 0) {
      await query(
        `INSERT INTO rooms (id, room_number, floor, type, name, bed_type, price, capacity, amenities, status, notes, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [r.id, r.room_number, r.floor, r.type, r.name, r.bed_type, r.price, r.capacity, JSON.stringify(r.amenities), r.status, r.notes, r.image]
      );
      console.log(`  ✅ Room created: #${r.room_number} ${r.name}`);
    } else {
      console.log(`  ⏭️  Room already exists: #${r.room_number}`);
    }
  }

  // ─── 3. Initial Activity Log ──────────────────────────────────────────────
  const logExists = await query("SELECT id FROM activity_logs WHERE id = 'log-init'");
  if (logExists.rows.length === 0) {
    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['log-init', 'System', 'Admin', 'System Initialized', 'Database', 'Hotel Management System PostgreSQL database initialized.']
    );
    console.log('  ✅ Initial activity log created');
  }

  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
