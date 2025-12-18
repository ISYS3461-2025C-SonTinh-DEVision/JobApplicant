// commonValidators.js

export const hasUppercase = (value = "") => /[A-Z]/.test(value);

export const hasLowercase = (value = "") => /[a-z]/.test(value);

export const hasNumber = (value = "") => /\d/.test(value);

export const hasSpecialChar = (value = "") =>
  /[^A-Za-z0-9]/.test(value);

export const isEmpty = (value) =>
  value === undefined || value === null || String(value).trim() === "";

export const minLength = (value = "", min) =>
  String(value).length >= min;

export const maxLength = (value = "", max) =>
  String(value).length <= max;

export const hasWhitespace = (value = "") => /\s/.test(value);

export const isDigitsOnly = (value = "") => /^\d+$/.test(value);

export const containsForbiddenChars = (
  value = "",
  forbiddenPattern
) => forbiddenPattern.test(value);

export const isFileSizeValid = (file, maxBytes) =>
  file && file.size <= maxBytes;

export const isFileTypeAllowed = (file, allowedTypes = []) =>
  file && allowedTypes.includes(file.type);

