import React from 'react';
import { Button } from '../common/Button';

interface SubmitButtonProps {
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  isLoading = false,
  disabled = false,
  className = ''
}) => {
  return (
    <Button
      type="submit"
      variant="gold"
      size="lg"
      isLoading={isLoading}
      disabled={disabled}
      className={`w-full ${className}`}
    >
      {label}
    </Button>
  );
};
