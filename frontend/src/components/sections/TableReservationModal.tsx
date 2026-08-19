import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { InputField } from '../forms/InputField';
import { SelectField } from '../forms/SelectField';
import { DatePicker } from '../forms/DatePicker';
import { SubmitButton } from '../forms/SubmitButton';
import { tableReservationSchema } from '../../utils/validationSchemas';
import { TableReservationData } from '../../types';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { CheckCircle2, Utensils } from 'lucide-react';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableReservationModal: React.FC<TableReservationModalProps> = ({ isOpen, onClose }) => {
  const { submit, isLoading, response, reset: resetSubmit } = useFormSubmit('/api/erp/restaurant-reservations');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors }
  } = useForm<TableReservationData>({
    resolver: zodResolver(tableReservationSchema),
    defaultValues: {
      partySize: 2,
      seatingPreference: 'Terrace Sea View',
      date: defaultDate,
      time: '19:30'
    }
  });

  const onSubmit = async (data: TableReservationData) => {
    await submit(data as unknown as Record<string, unknown>);
  };

  const handleDone = () => {
    resetSubmit();
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDone}
      subtitle="L’Étoile Fine Dining"
      title="Reserve Your Culinary Table"
      maxWidth="xl"
    >
      {response ? (
        <div className="py-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#C5B358]/10 text-[#C5B358] flex items-center justify-center mx-auto border border-[#C5B358]/40 rounded-none">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5B358] font-semibold">
              Reservation Confirmed
            </span>
            <h3 className="font-serif text-3xl font-light text-[#1A1A1A]">
              We Look Forward To Welcoming You
            </h3>
            <p className="text-xs text-[#5F5E5E] font-mono pt-1">
              ERP Reference Code: <span className="text-[#C5B358] font-semibold">{response.bookingReference}</span>
            </p>
          </div>
          <p className="text-sm text-[#5F5E5E] max-w-md mx-auto leading-relaxed">
            A confirmation message has been dispatched. Our Maître d’Hôtel will hold your table for up to 20 minutes past reservation time.
          </p>
          <button
            onClick={handleDone}
            className="px-6 py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.12em] font-medium hover:bg-[#C5B358] transition-colors cursor-pointer rounded-none border border-[#1A1A1A]"
          >
            Close Confirmation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="guestName"
              placeholder="e.g. Lord Sterling"
              register={register('guestName')}
              error={errors.guestName}
              required
            />
            <InputField
              label="Email Address"
              type="email"
              name="email"
              placeholder="sterling@example.com"
              register={register('email')}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DatePicker
              label="Reservation Date"
              name="date"
              register={register('date')}
              error={errors.date}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <SelectField
              label="Preferred Time"
              name="time"
              register={register('time')}
              error={errors.time}
              required
              options={[
                { value: '18:30', label: '18:30 PM (Sunset Service)' },
                { value: '19:00', label: '19:00 PM' },
                { value: '19:30', label: '19:30 PM (Prime Dinner)' },
                { value: '20:00', label: '20:00 PM' },
                { value: '20:30', label: '20:30 PM' },
                { value: '21:00', label: '21:00 PM (Late Seating)' }
              ]}
            />
            <SelectField
              label="Party Size"
              name="partySize"
              register={register('partySize', { valueAsNumber: true })}
              error={errors.partySize}
              required
              options={[
                { value: 1, label: '1 Person' },
                { value: 2, label: '2 Guests' },
                { value: 3, label: '3 Guests' },
                { value: 4, label: '4 Guests' },
                { value: 6, label: '6 Guests' },
                { value: 8, label: '8 Guests' },
                { value: 12, label: '12 Guests' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="+33 4 92 90 00 00"
              register={register('phone')}
              error={errors.phone}
              required
            />
            <SelectField
              label="Seating Atmosphere"
              name="seatingPreference"
              register={register('seatingPreference')}
              error={errors.seatingPreference}
              required
              options={[
                { value: 'Terrace Sea View', label: 'Cliffside Terrace (Sea View)' },
                { value: 'Indoor Main Dining', label: 'Main Dining Hall (Candlelight)' },
                { value: 'Chef Private Table', label: 'Chef Kitchen Sanctuary' }
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-[0.1em] text-[#1A1A1A] font-semibold">
              Dietary Restrictions & Special Occasions
            </label>
            <textarea
              {...register('dietaryNotes')}
              rows={2}
              placeholder="Anniversary celebration, seafood allergy, vegan tasting request..."
              className="w-full bg-[#FAF9F6] border border-[#E5E5E5] text-sm text-[#1A1A1A] p-3 outline-none focus:border-[#C5B358] focus:border-b-2 rounded-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <SubmitButton label="Confirm Table Reservation" isLoading={isLoading} />
          </div>
        </form>
      )}
    </Modal>
  );
};
