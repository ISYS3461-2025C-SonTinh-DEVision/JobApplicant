// authValidators.js

import {
  isEmpty,
  minLength,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar,
  hasWhitespace,
  isDigitsOnly,
} from "./commonValidators";


const EMAIL_FORBIDDEN = /[()\[\];:]/;

export function validateEmail(email) {
  const errors = [];

  if (isEmpty(email)) {
    errors.push({ field: "email", message: "Email is required." });
    return errors;
  }

  if (hasWhitespace(email)) {
    errors.push({ field: "email", message: "Email must not contain spaces." });
  }

  if (email.length >= 255) {
    errors.push({
      field: "email",
      message: "Email must be shorter than 255 characters.",
    });
  }

  if (EMAIL_FORBIDDEN.test(email)) {
    errors.push({
      field: "email",
      message: "Email contains invalid characters.",
    });
  }

  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    errors.push({
      field: "email",
      message: "Email must contain exactly one '@' symbol.",
    });
  }

  const [, domain] = email.split("@");
  if (!domain || !domain.includes(".")) {
    errors.push({
      field: "email",
      message: "Email domain must contain a dot ('.').",
    });
  }

  return errors;
}


export function validatePassword(password) {
  const errors = [];

  if (isEmpty(password)) {
    errors.push({ field: "password", message: "Password is required." });
    return errors;
  }

  if (!minLength(password, 8)) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long.",
    });
  }

  if (!hasUppercase(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one uppercase letter.",
    });
  }

  if (!hasLowercase(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one lowercase letter.",
    });
  }

  if (!hasNumber(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one number.",
    });
  }

  if (!hasSpecialChar(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one special character.",
    });
  }

  return errors;
}


export function validatePhone(phone) {
  const errors = [];

  if (isEmpty(phone)) return errors; // optional field

  if (!phone.startsWith("+")) {
    errors.push({
      field: "phone",
      message: "Phone number must start with '+' and country code.",
    });
    return errors;
  }

  const digits = phone.slice(1);

  if (!isDigitsOnly(digits)) {
    errors.push({
      field: "phone",
      message: "Phone number must contain digits only.",
    });
  }

  if (digits.length >= 13) {
    errors.push({
      field: "phone",
      message: "Phone number is too long.",
    });
  }

  return errors;
}


// LOGIN / REGISTER AGGREGATORS
export function validateLogin({ email, password }) {
  return [
    ...validateEmail(email),
    ...validatePassword(password),
  ];
}

export function validateRegister({ email, password, phone, country }) {
  const errors = [
    ...validateEmail(email),
    ...validatePassword(password),
    ...validatePhone(phone),
  ];

  if (isEmpty(country)) {
    errors.push({
      field: "country",
      message: "Country is required.",
    });
  }

  return errors;
}

