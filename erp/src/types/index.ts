export type Role = 'Admin' | 'Manager' | 'Receptionist';

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  role: Role;
  status: UserStatus;
  password?: string;
  avatar?: string;
  lastActive?: string;
}

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Presidential Suite' | 'Executive';
export type BedType = 'Single' | 'Double' | 'King' | 'Twin' | 'Queen';
export type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  bedType: BedType;
  price: number;
  capacity: number;
  amenities: string[];
  status: RoomStatus;
  notes?: string;
}

export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idCardNumber?: string; // CNIC / Passport / Driver License
  address?: string;
  checkInDate?: string;
  checkOutDate?: string;
  assignedRoomId?: string;
  assignedRoomNumber?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Partial';
  totalSpent?: number;
  visits?: number;
  lastStay?: string | null;
  vipStatus?: boolean;
  notes?: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';

export interface Booking {
  id: string;
  bookingCode: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomId?: string;
  roomNumber?: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  paidAmount: number;
  pricePerNight?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Partial';
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  bookingSource?: 'Website' | 'Front Desk' | 'OTA' | 'Agent';
  adults?: number;
  children?: number;
}

export type Department = 'Reception' | 'Security' | 'Maintenance' | 'Accounts' | 'Housekeeping' | 'Restaurant';
export type StaffStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  department: Department;
  position: string;
  joiningDate: string;
  status: StaffStatus;
  salary: number;
  shift?: 'Morning' | 'Evening' | 'Night';
  password?: string;
  role?: Role;
  enablePortalAccess?: boolean;
  avatar?: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type HousekeepingTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Inspection';

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: 'Routine Cleaning' | 'Deep Clean' | 'Linen Change' | 'Inspection' | 'Maintenance Check';
  priority: TaskPriority;
  status: HousekeepingTaskStatus;
  assignedStaffId: string;
  assignedStaffName: string;
  scheduledTime: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Room Charge' | 'Restaurant' | 'Spa' | 'Laundry' | 'Minibar' | 'Airport Transfer' | 'Other';
  amount: number;
  quantity: number;
}

export type PaymentMethod = 'Credit Card' | 'Cash' | 'Bank Transfer' | 'POS' | 'Mobile Pay';
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Partial';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: Role;
  action: string;
  module: string;
  details: string;
}

export type PortalType = 'website' | 'login' | 'admin' | 'manager' | 'receptionist';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// F&B / Restaurant Types
export type MenuCategory = 'Breakfast' | 'Starters' | 'Main Course' | 'Beverages' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  available: boolean;
  prepTimeMins: number;
  image?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'Pending' | 'Cooking' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  orderType: 'Dining Table' | 'Room Service' | 'Takeaway';
  tableOrRoom: string;
  guestName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

// Housekeeping Maintenance Request
export type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved';

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  issue: string;
  category: 'Plumbing' | 'HVAC' | 'Electrical' | 'Carpentry' | 'Appliance' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: MaintenanceStatus;
  reportedBy: string;
  assignedTo: string;
  reportedAt: string;
  resolutionNotes?: string;
}

// Finance & Expenses Types
export interface Expense {
  id: string;
  expenseCode: string;
  title: string;
  category: 'Food Supplies' | 'Utilities' | 'Maintenance' | 'Marketing' | 'Laundry' | 'IT Services' | 'Other';
  amount: number;
  date: string;
  vendor: string;
  status: 'Paid' | 'Pending';
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  position: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
  paymentDate?: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Linen & Bedding' | 'Toiletries' | 'F&B Ingredients' | 'Cleaning Supplies' | 'Minibar Supplies' | 'Maintenance Parts';
  quantity: number;
  unit: string;
  minThreshold: number;
  unitCost: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface HotelSettings {
  hotelName: string;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  taxRate: number;
  serviceCharge: number;
  autoHousekeepingDispatch: boolean;
  emailAlerts: boolean;
}


