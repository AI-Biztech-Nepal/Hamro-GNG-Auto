/** 7 to 15 digits, optional leading +, spaces and dashes allowed (the same rule the admin backend applies). */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^\+?[\d\s-]{7,20}$/.test(phone.trim()) && digits.length >= 7 && digits.length <= 15;
}
