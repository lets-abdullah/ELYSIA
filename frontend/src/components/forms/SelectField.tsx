import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  register,
  error,
  options,
  required,
  disabled,
  icon
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-[11px] uppercase tracking-[0.1em] text-[#1A1A1A] font-semibold">
        {label} {required && <span className="text-[#C5B358]">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#5F5E5E] pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={name}
          disabled={disabled}
          {...register}
          className={`w-full bg-[#FAF9F6] border rounded-none text-sm text-[#1A1A1A] py-3 appearance-none transition-all duration-200 outline-none cursor-pointer ${
            icon ? 'pl-10 pr-10' : 'px-3.5 pr-10'
          } ${
            error
              ? 'border-red-600 focus:border-red-600'
              : 'border-[#E5E5E5] focus:border-[#C5B358] focus:border-b-2'
          } ${disabled ? 'bg-stone-100 cursor-not-allowed opacity-60' : ''}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Arrow */}
        <div className="absolute right-3.5 pointer-events-none text-[#5F5E5E]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-600 font-light mt-0.5">{error.message}</span>
      )}
    </div>
  );
};
