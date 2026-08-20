/**
 * Password Policy Validator for ERP & Hotel Platform
 * Requirements:
 * 1. Minimum 12 characters
 * 2. At least 1 uppercase letter (A-Z)
 * 3. At least 1 lowercase letter (a-z)
 * 4. At least 1 number (0-9)
 * 5. At least 1 special symbol (e.g., @, #, $, %, !, &, *, ?)
 */

export function validatePassword(password) {
  if (typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password must be a valid string.',
      missingRequirements: ['Password is required']
    };
  }

  const trimmed = password.trim();
  const missingRequirements = [];

  if (trimmed.length < 12) {
    missingRequirements.push('at least 12 characters');
  }
  if (!/[A-Z]/.test(trimmed)) {
    missingRequirements.push('at least 1 uppercase letter (A–Z)');
  }
  if (!/[a-z]/.test(trimmed)) {
    missingRequirements.push('at least 1 lowercase letter (a–z)');
  }
  if (!/[0-9]/.test(trimmed)) {
    missingRequirements.push('at least 1 number (0–9)');
  }
  if (!/[^A-Za-z0-9]/.test(trimmed)) {
    missingRequirements.push('at least 1 special symbol (e.g., @, #, $, %, !)');
  }

  const isValid = missingRequirements.length === 0;
  const message = isValid
    ? 'Password meets all requirements.'
    : `Password must satisfy all policy requirements. Missing: ${missingRequirements.join(', ')}.`;

  return {
    isValid,
    message,
    missingRequirements
  };
}
