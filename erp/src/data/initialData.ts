import { Room, Guest, Booking, InventoryItem, User, Staff, HousekeepingTask, Invoice, ActivityLog, MenuItem, RestaurantOrder, MaintenanceRequest, Expense, PayrollRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Alexander Wright',
    username: 'a.wright',
    email: 'a.wright@grandluxe.com',
    role: 'Admin',
    phone: '+1 (555) 019-2831',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastActive: new Date().toISOString()
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    username: 'e.rostova',
    email: 'e.rostova@grandluxe.com',
    role: 'Manager',
    phone: '+1 (555) 012-9844',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastActive: new Date().toISOString()
  },
  {
    id: 'usr-3',
    name: 'Marcus Sterling',
    username: 'm.sterling',
    email: 'm.sterling@grandluxe.com',
    role: 'Receptionist',
    phone: '+1 (555) 014-3321',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastActive: new Date().toISOString()
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'ocean-bedroom',
    roomNumber: '101',
    floor: 1,
    type: 'Deluxe',
    bedType: 'King',
    price: 240,
    capacity: 2,
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Marble Bath', 'Coffee Maker', 'Mini Bar'],
    status: 'Occupied',
    notes: 'Ocean View Deluxe Bedroom - Ocean Horizon View'
  },
  {
    id: 'sanctuary-bedroom',
    roomNumber: '102',
    floor: 1,
    type: 'Standard',
    bedType: 'King',
    price: 195,
    capacity: 2,
    amenities: ['Private Garden Terrace', 'Deep Soaking Tub', 'Artisanal Coffee Lab'],
    status: 'Available',
    notes: 'Sanctuary Garden Bedroom - Courtyard View'
  },
  {
    id: 'ritual-bedroom',
    roomNumber: '201',
    floor: 2,
    type: 'Deluxe',
    bedType: 'Double',
    price: 210,
    capacity: 2,
    amenities: ['Black Marble Tub', 'Aromatherapy Shower', 'Soundproofing'],
    status: 'Occupied',
    notes: 'Wellness Ritual Bedroom - Zen Bamboo Garden'
  },
  {
    id: 'skyward-bedroom',
    roomNumber: '202',
    floor: 2,
    type: 'Executive',
    bedType: 'King',
    price: 320,
    capacity: 2,
    amenities: ['Executive Workstation', 'High-Speed Wi-Fi', 'Smart TV', 'Espresso Bar'],
    status: 'Reserved',
    notes: 'Executive Skyward Bedroom - City Skyline View'
  },
  {
    id: 'imperial-bedroom',
    roomNumber: '301',
    floor: 3,
    type: 'Presidential Suite',
    bedType: 'King',
    price: 450,
    capacity: 4,
    amenities: ['Private Jacuzzi', 'Walk-In Closet', '24/7 Room Service'],
    status: 'Occupied',
    notes: 'Imperial Master Bedroom - 360° Vista'
  },
  {
    id: 'horizon-bedroom',
    roomNumber: '302',
    floor: 3,
    type: 'Deluxe',
    bedType: 'King',
    price: 280,
    capacity: 4,
    amenities: ['Direct Beach Access', 'Outdoor Rain Shower', 'Private Sun Deck'],
    status: 'Cleaning',
    notes: 'Horizon Oceanfront Bedroom'
  },
  {
    id: 'celestial-bedroom',
    roomNumber: '401',
    floor: 4,
    type: 'Executive',
    bedType: 'King',
    price: 210,
    capacity: 2,
    amenities: ['Skylight Glass Window', 'Ambient Lighting', 'Smart TV'],
    status: 'Available',
    notes: 'Celestial Sky Bedroom'
  },
  {
    id: 'aurelia-bedroom',
    roomNumber: '501',
    floor: 5,
    type: 'Standard',
    bedType: 'King',
    price: 180,
    capacity: 2,
    amenities: ['Marble Bath', 'Private Balcony', 'Nespresso Coffee'],
    status: 'Maintenance',
    notes: 'Aurelia Royal Bedroom'
  }
];

export const INITIAL_GUESTS: Guest[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'emp-1',
    name: 'Alexander Wright',
    role: 'Admin',
    position: 'General Manager',
    email: 'a.wright@grandluxe.com',
    phone: '+1 (555) 019-2831',
    department: 'Reception',
    salary: 8500,
    joiningDate: '2021-03-15',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-2',
    name: 'Elena Rostova',
    role: 'Manager',
    position: 'Operations Manager',
    email: 'e.rostova@grandluxe.com',
    phone: '+1 (555) 012-9844',
    department: 'Reception',
    salary: 6200,
    joiningDate: '2022-01-10',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-3',
    name: 'Marcus Sterling',
    role: 'Receptionist',
    position: 'Lead Receptionist',
    email: 'm.sterling@grandluxe.com',
    phone: '+1 (555) 014-3321',
    department: 'Reception',
    salary: 3800,
    joiningDate: '2023-06-01',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_HOUSEKEEPING: HousekeepingTask[] = [
  {
    id: 'hk-1',
    roomId: 'horizon-bedroom',
    roomNumber: '302',
    taskType: 'Deep Clean',
    assignedStaffId: 'emp-3',
    assignedStaffName: 'Maria Santos',
    scheduledTime: '10:00 AM',
    status: 'Pending',
    priority: 'High',
    notes: 'Guest check-out clean'
  }
];

export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
export const INITIAL_MENU: MenuItem[] = [];
export const INITIAL_RESTAURANT_ORDERS: RestaurantOrder[] = [];
export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_PAYROLL: PayrollRecord[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    code: 'INV-101',
    name: 'Egyptian Cotton Bed Sheet (King)',
    category: 'Linen & Bedding',
    quantity: 140,
    unit: 'Pieces',
    minThreshold: 30,
    unitCost: 25,
    supplier: 'Luxe Linens Ltd',
    status: 'In Stock'
  }
];
