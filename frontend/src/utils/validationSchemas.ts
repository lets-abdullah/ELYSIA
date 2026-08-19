import { z } from 'zod';

export const bookingSchema = z.object({
  guestName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
}).refine((data) => {
  if (!data.checkIn || !data.checkOut) return true;
  return new Date(data.checkOut) > new Date(data.checkIn);
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut']
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  arrivalDate: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export const tableReservationSchema = z.object({
  guestName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Contact phone number is required'),
  date: z.string().min(1, 'Reservation date is required'),
  time: z.string().min(1, 'Preferred time is required'),
  partySize: z.number().min(1).max(12, 'For parties larger than 12, please contact concierge directly'),
  seatingPreference: z.enum(['Indoor Main Dining', 'Terrace Sea View', 'Chef Private Table']),
  dietaryNotes: z.string().optional(),
});
