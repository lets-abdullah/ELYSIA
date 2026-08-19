export interface Room {
  id: string;
  name: string;
  tagline: string;
  category: 'Suite' | 'Penthouse' | 'Villa' | 'Deluxe' | 'Presidential' | string;
  type?: string;
  pricePerNight: number;
  sizeSqFt: number;
  maxGuests: number;
  bedType: string;
  view: string;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  featured?: boolean;
  status?: string;
  isReserved?: boolean;
}

export interface Service {
  id: string;
  title: string;
  category: 'Spa' | 'Dining' | 'Concierge' | 'Transport' | 'Experiences';
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  hours?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'All' | 'Suites' | 'Dining' | 'Spa' | 'Grounds';
  image: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  guestName: string;
  title: string;
  location: string;
  rating: number;
  avatar: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Starters' | 'Main Courses' | 'Desserts' | 'Wines & Spirits';
  dietary?: string[];
  isChefSpecial?: boolean;
}

export interface BookingFormData {
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  roomType?: string;
  specialRequests?: string;
  airportTransfer?: boolean;
  spaPackage?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  arrivalDate?: string;
  subject: string;
  message: string;
}

export interface TableReservationData {
  guestName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  seatingPreference: 'Indoor Main Dining' | 'Terrace Sea View' | 'Chef Private Table';
  dietaryNotes?: string;
}

export interface ERPResponse {
  status: number;
  success: boolean;
  bookingReference: string;
  timestamp: string;
  message: string;
  erpPayload: Record<string, unknown>;
}
