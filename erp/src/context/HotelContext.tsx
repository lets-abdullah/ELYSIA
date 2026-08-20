import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Room, Guest, Booking, Staff, HousekeepingTask, Invoice, ActivityLog,
  ToastNotification, BookingStatus, RoomStatus, HousekeepingTaskStatus, Role,
  PortalType, MenuItem, RestaurantOrder, MaintenanceRequest, Expense, PayrollRecord,
  InventoryItem, OrderStatus, MaintenanceStatus, HotelSettings
} from '../types';
import {
  INITIAL_USERS, INITIAL_ROOMS, INITIAL_GUESTS, INITIAL_BOOKINGS,
  INITIAL_STAFF, INITIAL_HOUSEKEEPING, INITIAL_INVOICES, INITIAL_ACTIVITY_LOGS,
  INITIAL_MENU, INITIAL_RESTAURANT_ORDERS, INITIAL_MAINTENANCE, INITIAL_EXPENSES,
  INITIAL_PAYROLL, INITIAL_INVENTORY
} from '../data/initialData';
import { apiFetch, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface HotelContextType {
  // State
  activePortal: PortalType;
  users: User[];
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  staff: Staff[];
  housekeepingTasks: HousekeepingTask[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  currentUser: User;
  toasts: ToastNotification[];
  hotelSettings: HotelSettings;

  menuItems: MenuItem[];
  restaurantOrders: RestaurantOrder[];
  maintenanceRequests: MaintenanceRequest[];
  expenses: Expense[];
  payrollRecords: PayrollRecord[];
  payroll: PayrollRecord[];
  inventoryItems: InventoryItem[];

  // Portal Navigation
  setActivePortal: (portal: PortalType) => void;

  // Settings
  updateHotelSettings: (settings: Partial<HotelSettings>) => void;

  // User Auth & Switch
  setCurrentUser: (user: User) => void;

  // Toast Helpers
  showToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;

  // User CRUD
  addUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateUser: (id: string, user: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Room CRUD
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  setRoomStatus: (id: string, status: RoomStatus) => void;

  // Guest CRUD
  addGuest: (guest: Omit<Guest, 'id' | 'totalSpent'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  updateGuestPaymentStatus: (guestId: string, paymentStatus: 'Paid' | 'Pending') => void;
  deleteGuest: (id: string) => void;

  // Booking CRUD
  addBooking: (booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  assignRoomToBooking: (bookingId: string, roomId: string) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;
  deleteBooking: (id: string) => void;

  // Staff CRUD
  addStaff: (staffMember: Omit<Staff, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateStaff: (id: string, staffMember: Partial<Staff>) => Promise<{ success: boolean; message?: string }>;
  deleteStaff: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Housekeeping CRUD
  addHousekeepingTask: (task: Omit<HousekeepingTask, 'id'>) => void;
  updateHousekeepingTask: (id: string, task: Partial<HousekeepingTask>) => void;
  updateHousekeepingTaskStatus: (id: string, status: HousekeepingTaskStatus) => void;
  deleteHousekeepingTask: (id: string) => void;

  // F&B Menu & Orders CRUD
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addRestaurantOrder: (order: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateRestaurantOrderStatus: (id: string, status: OrderStatus) => void;
  deleteRestaurantOrder: (id: string) => void;

  // Maintenance Requests CRUD
  addMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'reportedAt'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus, notes?: string) => void;

  // Expense CRUD
  addExpense: (exp: Omit<Expense, 'id' | 'expenseCode'>) => void;
  updateExpense: (id: string, exp: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Payroll CRUD
  updatePayrollStatus: (id: string, status: 'Paid' | 'Pending') => void;

  // Inventory CRUD
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'code' | 'status'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Invoice CRUD
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  recordPayment: (id: string, amount: number, method: Invoice['paymentMethod']) => void;
  deleteInvoice: (id: string) => void;

  // Utilities
  resetDemoData: () => void;
  logActivity: (action: string, module: string, details: string) => void;
  refreshDataFromBackend: () => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePortal, setActivePortal] = useState<PortalType>('login');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>(INITIAL_RESTAURANT_ORDERS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent Hotel Settings across entire ERP (Tax Rate, Policies, Identity)
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>(() => {
    try {
      const saved = localStorage.getItem('elysia_hotel_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse hotel settings', e);
    }
    return {
      hotelName: 'Grand Luxe Resort & Spa',
      currency: 'USD ($)',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      taxRate: 10.0,
      serviceCharge: 5.0,
      autoHousekeepingDispatch: true,
      emailAlerts: true
    };
  });

  const updateHotelSettings = (newSettings: Partial<HotelSettings>) => {
    setHotelSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('elysia_hotel_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist hotel settings', e);
      }
      return updated;
    });
  };

  // Function to load real data from backend API
  const refreshDataFromBackend = async () => {
    try {
      // 1. Fetch Rooms
      const roomsRes = await apiFetch('/rooms');
      if (roomsRes.success && roomsRes.rooms) {
        setRooms(roomsRes.rooms);
      }

      // 2. Fetch Reservations
      const bookingsRes = await apiFetch('/reservations');
      if (bookingsRes.success && bookingsRes.bookings) {
        setBookings(bookingsRes.bookings);
      }

      // 3. Fetch Customers
      const customersRes = await apiFetch('/customers');
      if (customersRes.success && customersRes.customers) {
        setGuests(customersRes.customers);
      }

      // 4. Fetch Invoices for Finance Section (Auto-generated from user reservations)
      try {
        const invoicesRes = await apiFetch('/invoices');
        if (invoicesRes.success && invoicesRes.invoices) {
          setInvoices(invoicesRes.invoices);
        }
      } catch {
        // Fallback to derive invoices from active bookings
        if (bookingsRes.success && bookingsRes.bookings) {
          const autoInvoices: Invoice[] = bookingsRes.bookings.map((b: any) => ({
            id: `inv-${b.id}`,
            invoiceNumber: `INV-${b.bookingCode || b.id.slice(-6).toUpperCase()}`,
            bookingId: b.id,
            guestName: b.guestName,
            guestEmail: b.guestEmail,
            guestPhone: b.guestPhone,
            roomNumber: b.roomNumber,
            issueDate: b.checkInDate || new Date().toISOString().split('T')[0],
            dueDate: b.checkOutDate || new Date().toISOString().split('T')[0],
            items: [
              {
                id: `item-${b.id}`,
                description: `Room Stay Charges (Room #${b.roomNumber})`,
                category: 'Room Charge',
                amount: b.totalAmount,
                quantity: 1
              }
            ],
            subtotalAmount: b.totalAmount,
            discountAmount: 0,
            taxAmount: 0,
            totalAmount: b.totalAmount,
            paidAmount: b.paymentStatus === 'Paid' ? b.totalAmount : (b.paidAmount || 0),
            dueAmount: b.paymentStatus === 'Paid' ? 0 : Math.max(0, b.totalAmount - (b.paidAmount || 0)),
            status: b.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
            paymentMethod: 'Credit Card',
            createdAt: b.createdAt || new Date().toISOString()
          }));
          setInvoices(autoInvoices);
        }
      }

      // 5. Fetch Users & Activity Logs ONLY if logged in as Admin or Manager
      const token = getAuthToken();
      const storedRole = (localStorage.getItem('elysia_user_role') || currentUser?.role || '').toLowerCase();
      const isAdminOrManagerRole = storedRole === 'admin' || storedRole === 'manager';

      if (token && isAdminOrManagerRole) {
        try {
          const usersRes = await apiFetch('/users');
          if (usersRes.success && usersRes.users) {
            setUsers(usersRes.users);
            setStaff(usersRes.users);
          }
        } catch {
          // Ignore
        }

        try {
          const logsRes = await apiFetch('/reports/logs');
          if (logsRes.success && logsRes.activityLogs) {
            setActivityLogs(logsRes.activityLogs);
          }
        } catch {
          // Ignore
        }
      }
    } catch (error) {
      console.error('Failed to sync with backend API:', error);
    }
  };

  // Sync with backend on component mount and set timer
  useEffect(() => {
    refreshDataFromBackend();
    const interval = setInterval(refreshDataFromBackend, 3000); // Fast 3-second real-time sync across all ERP modules!
    return () => clearInterval(interval);
  }, []);

  // Toast System
  const showToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger
  const logActivity = (action: string, moduleName: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser.name,
      userRole: currentUser.role,
      action,
      module: moduleName,
      details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    refreshDataFromBackend();
    showToast('Refreshed Data', 'All ERP views synchronized with backend SQL database.', 'info');
  };

  // --- USER CRUD ---
  const addUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (res && res.success) {
        showToast('User Created', `User account for ${userData.name} created successfully.`, 'success');
        refreshDataFromBackend();
        return { success: true, message: res.message || 'User created successfully.' };
      } else {
        const msg = res?.message || 'Failed to create user.';
        showToast('User Error', msg, 'error');
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to create user in database.';
      showToast('User Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      if (res && res.success) {
        const msg = res.message || 'User profile updated successfully.';
        showToast('User Updated', msg, 'success');
        refreshDataFromBackend();
        return { success: true, message: msg };
      } else {
        const msg = res?.message || 'Failed to update user.';
        showToast('User Update Failed', msg, 'error');
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to update user in database.';
      showToast('User Update Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        showToast('User Removed', 'User account deleted.', 'warning');
        refreshDataFromBackend();
        return { success: true, message: res.message || 'User deleted.' };
      } else {
        const msg = res?.message || 'Failed to delete user.';
        showToast('User Delete Failed', msg, 'error');
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to delete user from database.';
      showToast('User Delete Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // --- ROOM CRUD ---
  const addRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      const res = await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData)
      });
      if (res.success) {
        showToast('Room Added', `Room #${roomData.roomNumber} created.`, 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Add Room Failed', err.message, 'error');
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    try {
      const res = await apiFetch(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roomData)
      });
      if (res.success) {
        showToast('Room Updated', 'Room information updated.', 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Update Room Failed', err.message, 'error');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const res = await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Room Removed', 'Room deleted.', 'warning');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Delete Room Failed', err.message, 'error');
    }
  };

  const setRoomStatus = async (id: string, status: RoomStatus) => {
    try {
      const lowerStatus = status.toLowerCase();
      const res = await apiFetch(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: lowerStatus })
      });
      if (res.success) {
        showToast('Room Status Changed', `Room status set to ${status}.`, 'info');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Status Update Failed', err.message, 'error');
    }
  };

  // --- GUEST CRUD ---
  const addGuest = async (guestData: Omit<Guest, 'id' | 'totalSpent'>) => {
    try {
      const res = await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify(guestData)
      });
      if (res.success) {
        showToast('Guest Added', `Guest ${guestData.fullName} registered.`, 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Add Guest Failed', err.message, 'error');
    }
  };

  const updateGuest = async (id: string, guestData: Partial<Guest>) => {
    try {
      const res = await apiFetch(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guestData)
      });
      if (res.success) {
        showToast('Guest Updated', 'Guest details updated.', 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Update Guest Failed', err.message, 'error');
    }
  };

  const updateGuestPaymentStatus = async (guestId: string, paymentStatus: 'Paid' | 'Pending') => {
    try {
      const res = await apiFetch(`/customers/${guestId}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus })
      });
      if (res.success) {
        showToast('Payment Status Updated', `Guest payment marked as ${paymentStatus.toUpperCase()}.`, 'success');
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, paymentStatus } : g))
        );
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Payment Update Failed', err.message || 'Error updating payment status.', 'error');
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      const res = await apiFetch(`/customers/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Guest Deleted', 'Guest record deleted from database.', 'warning');
        setGuests((prev) => prev.filter((g) => g.id !== id));
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Delete Guest Failed', err.message || 'Could not delete guest.', 'error');
    }
  };

  // --- BOOKING CRUD ---
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => {
    try {
      const res = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          guestName: bookingData.guestName,
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone,
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          roomId: bookingData.roomId,
          roomType: bookingData.roomType,
          totalPrice: bookingData.totalAmount,
          paidAmount: bookingData.paidAmount,
          specialRequests: bookingData.specialRequests,
          bookingSource: bookingData.bookingSource || 'Front Desk'
        })
      });
      if (res.success) {
        showToast('Reservation Created', `Reservation ${res.bookingCode || ''} created!`, 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Booking Failed', err.message, 'error');
    }
  };

  const assignRoomToBooking = async (bookingId: string, roomId: string) => {
    try {
      const res = await apiFetch(`/reservations/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed', roomId })
      });
      if (res.success) {
        showToast('Room Assigned', 'Room assigned and reservation confirmed.', 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Assign Room Failed', err.message, 'error');
    }
  };

  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    try {
      const res = await apiFetch(`/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bookingData)
      });
      if (res.success) {
        showToast('Booking Updated', 'Reservation details modified.', 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Update Booking Failed', err.message, 'error');
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const bk = bookings.find((b) => b.id === id);
      const isCheckOut = status === 'Checked-out';
      const res = await apiFetch(`/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          roomId: bk?.roomId,
          // Tells backend to auto-settle payment and create payment record
          settlePayment: isCheckOut
        })
      });
      if (res.success) {
        showToast('Status Updated', `Booking status changed to ${status}.`, 'success');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Status Update Failed', err.message, 'error');
    }
  };

  const cancelBooking = (id: string) => {
    updateBookingStatus(id, 'Cancelled');
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await apiFetch(`/reservations/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Booking Deleted', 'Reservation removed.', 'warning');
        refreshDataFromBackend();
      }
    } catch (err: any) {
      showToast('Delete Booking Failed', err.message, 'error');
    }
  };

  // --- STAFF CRUD ---
  const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<{ success: boolean; message?: string }> => {
    return await addUser({
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      username: staffData.email.split('@')[0],
      role: staffData.role || 'Receptionist',
      status: 'Active',
      password: staffData.password
    });
  };

  const updateStaff = async (id: string, staffData: Partial<Staff>): Promise<{ success: boolean; message?: string }> => {
    return await updateUser(id, {
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role,
      status: staffData.status === 'Active' ? 'Active' : 'Inactive',
      password: staffData.password
    });
  };

  const deleteStaff = async (id: string): Promise<{ success: boolean; message?: string }> => {
    return await deleteUser(id);
  };

  // --- HOUSEKEEPING CRUD ---
  const addHousekeepingTask = (task: Omit<HousekeepingTask, 'id'>) => {
    const newTask: HousekeepingTask = { ...task, id: `hk-${Date.now()}` };
    setHousekeepingTasks((prev) => [newTask, ...prev]);
    showToast('Task Created', `Housekeeping assigned to Room #${task.roomNumber}.`, 'success');
  };

  const updateHousekeepingTask = (id: string, task: Partial<HousekeepingTask>) => {
    setHousekeepingTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
  };

  const updateHousekeepingTaskStatus = (id: string, status: HousekeepingTaskStatus) => {
    setHousekeepingTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    showToast('Housekeeping Updated', `Task status set to ${status}.`, 'info');
  };

  const deleteHousekeepingTask = (id: string) => {
    setHousekeepingTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // --- F&B Menu & Orders CRUD ---
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `menu-${Date.now()}` };
    setMenuItems((prev) => [...prev, newItem]);
  };
  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...item } : i)));
  };
  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };
  const addRestaurantOrder = (order: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>) => {
    const newOrder: RestaurantOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRestaurantOrders((prev) => [newOrder, ...prev]);
  };
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setRestaurantOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };
  const updateRestaurantOrderStatus = (id: string, status: OrderStatus) => updateOrderStatus(id, status);
  const deleteRestaurantOrder = (id: string) => {
    setRestaurantOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // --- MAINTENANCE CRUD ---
  const addMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id' | 'reportedAt'>) => {
    const newReq: MaintenanceRequest = {
      ...req,
      id: `maint-${Date.now()}`,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setMaintenanceRequests((prev) => [newReq, ...prev]);
  };
  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus, notes?: string) => {
    setMaintenanceRequests((prev) => prev.map((m) => (m.id === id ? { ...m, status, resolutionNotes: notes || m.resolutionNotes } : m)));
  };

  // --- EXPENSE CRUD ---
  const addExpense = (exp: Omit<Expense, 'id' | 'expenseCode'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
      expenseCode: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    setExpenses((prev) => [newExp, ...prev]);
  };
  const updateExpense = (id: string, exp: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...exp } : e)));
  };
  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // --- PAYROLL CRUD ---
  const updatePayrollStatus = (id: string, status: 'Paid' | 'Pending') => {
    setPayrollRecords((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  // --- INVENTORY CRUD ---
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'code' | 'status'>) => {
    const status = item.quantity <= 0 ? 'Out of Stock' : item.quantity <= item.minThreshold ? 'Low Stock' : 'In Stock';
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      code: `INV-${Date.now().toString().slice(-4)}`,
      status
    };
    setInventoryItems((prev) => [...prev, newItem]);
  };
  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventoryItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...item } : i)));
  };
  const deleteInventoryItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  // --- INVOICE CRUD ---
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };
  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...invoice } : i)));
  };
  const recordPayment = (id: string, amount: number, method: Invoice['paymentMethod']) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newPaid = (i.paidAmount || 0) + amount;
          const status = newPaid >= i.totalAmount ? 'Paid' : 'Partial';
          return { ...i, paidAmount: newPaid, status, paymentMethod: method };
        }
        return i;
      })
    );
  };
  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <HotelContext.Provider
      value={{
        activePortal,
        users,
        rooms,
        guests,
        bookings,
        staff,
        housekeepingTasks,
        invoices,
        activityLogs,
        currentUser,
        toasts,
        hotelSettings,
        updateHotelSettings,
        menuItems,
        restaurantOrders,
        maintenanceRequests,
        expenses,
        payrollRecords,
        payroll: payrollRecords,
        inventoryItems,
        setActivePortal,
        setCurrentUser,
        showToast,
        removeToast,
        addUser,
        updateUser,
        deleteUser,
        addRoom,
        updateRoom,
        deleteRoom,
        setRoomStatus,
        addGuest,
        updateGuest,
        updateGuestPaymentStatus,
        deleteGuest,
        addBooking,
        updateBooking,
        assignRoomToBooking,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
        addStaff,
        updateStaff,
        deleteStaff,
        addHousekeepingTask,
        updateHousekeepingTask,
        updateHousekeepingTaskStatus,
        deleteHousekeepingTask,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addRestaurantOrder,
        updateOrderStatus,
        updateRestaurantOrderStatus,
        deleteRestaurantOrder,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        addExpense,
        updateExpense,
        deleteExpense,
        updatePayrollStatus,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addInvoice,
        updateInvoice,
        recordPayment,
        deleteInvoice,
        resetDemoData,
        logActivity,
        refreshDataFromBackend
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
