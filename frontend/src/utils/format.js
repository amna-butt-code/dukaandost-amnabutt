export const pkr = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`;

// Pulls a readable message out of an axios error
export const getError = (err) =>
  err.response?.data?.message || 'Something went wrong. Please try again.';

export const PHONE_REGEX = /^03\d{9}$/;
