/**
 * ERP Password Policy Utilities
 * Enforces:
 * 1. Minimum 12 characters
 * 2. At least 1 uppercase letter (A-Z)
 * 3. At least 1 lowercase letter (a-z)
 * 4. At least 1 number (0-9)
 * 5. At least 1 special symbol (e.g., @, #, $, %, !)
 */

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  requirements: PasswordRequirement[];
  missingRequirements: string[];
  message: string;
}

export function validateErpPassword(password: string): PasswordValidationResult {
  const trimmed = (password || '').trim();

  const hasMinLength = trimmed.length >= 12;
  const hasUpperCase = /[A-Z]/.test(trimmed);
  const hasLowerCase = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(trimmed);

  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'Minimum 12 characters long', met: hasMinLength },
    { id: 'uppercase', label: 'At least 1 uppercase letter (A–Z)', met: hasUpperCase },
    { id: 'lowercase', label: 'At least 1 lowercase letter (a–z)', met: hasLowerCase },
    { id: 'number', label: 'At least 1 number (0–9)', met: hasNumber },
    { id: 'special', label: 'At least 1 special symbol (@, #, $, %, !, etc.)', met: hasSpecialChar }
  ];

  const missingRequirements: string[] = [];
  if (!hasMinLength) missingRequirements.push('12+ characters');
  if (!hasUpperCase) missingRequirements.push('1 uppercase letter (A–Z)');
  if (!hasLowerCase) missingRequirements.push('1 lowercase letter (a–z)');
  if (!hasNumber) missingRequirements.push('1 number (0–9)');
  if (!hasSpecialChar) missingRequirements.push('1 special symbol');

  const isValid = requirements.every((r) => r.met);
  const message = isValid
    ? 'Password satisfies all policy requirements.'
    : `Password does not meet requirements: ${missingRequirements.join(', ')}.`;

  return {
    isValid,
    requirements,
    missingRequirements,
    message
  };
}

/**
 * Generates a guaranteed compliant 16-character secure random password
 */
export function generateCompliantPassword(): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+~|}{[]:;?><,./-=';
  const all = uppers + lowers + numbers + symbols;

  // Guarantee at least 2 of each category
  const guaranteed = [
    uppers.charAt(Math.floor(Math.random() * uppers.length)),
    uppers.charAt(Math.floor(Math.random() * uppers.length)),
    lowers.charAt(Math.floor(Math.random() * lowers.length)),
    lowers.charAt(Math.floor(Math.random() * lowers.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length))
  ];

  const remainingLength = 16 - guaranteed.length;
  for (let i = 0; i < remainingLength; i++) {
    guaranteed.push(all.charAt(Math.floor(Math.random() * all.length)));
  }

  // Fisher-Yates Shuffle
  for (let i = guaranteed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guaranteed[i], guaranteed[j]] = [guaranteed[j], guaranteed[i]];
  }

  return guaranteed.join('');
}
