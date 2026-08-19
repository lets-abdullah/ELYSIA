import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type?: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  register,
  error,
  placeholder,
  required,
  disabled,
  icon
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-[11px] uppercase tracking-[0.1em] text-[#1A1A1A] font-semibold flex items-center justify-between">
        <span>
          {label} {required && <span className="text-[#C5B358]">*</span>}
        </span>
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#5F5E5E] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register}
          className={`w-full bg-[#FAF9F6] border rounded-none text-sm text-[#1A1A1A] placeholder:text-[#838480] py-3 transition-all duration-200 outline-none ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
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
