import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  register,
  error,
  required,
  min,
  max,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-[11px] uppercase tracking-[0.1em] text-[#1A1A1A] font-semibold">
        {label} {required && <span className="text-[#C5B358]">*</span>}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[#5F5E5E] pointer-events-none">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          id={name}
          type="date"
          min={min}
          max={max}
          disabled={disabled}
          {...register}
          className={`w-full bg-[#FAF9F6] border rounded-none text-sm text-[#1A1A1A] py-3 pl-10 pr-3.5 transition-all duration-200 outline-none ${
            error
              ? 'border-red-600 focus:border-red-600'
              : 'border-[#E5E5E5] focus:border-[#C5B358] focus:border-b-2'
          } ${disabled ? 'bg-stone-100 cursor-not-allowed opacity-60' : ''}`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-600 font-light mt-0.5">{error.message}</span>
      )}
    </div>
  );
};
