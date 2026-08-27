export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value = '') {
  return /^[+]?[\d\s-]{7,15}$/.test(value.trim());
}

export function validateLeadForm(form) {
  const errors = {};

  if (!form.name?.trim()) errors.name = 'Full name is required';
  if (!form.company?.trim()) errors.company = 'Company name is required';

  if (!form.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!form.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(form.phone)) {
    errors.phone = 'Please provide a valid phone number (7-15 digits)';
  }

  return errors;
}
