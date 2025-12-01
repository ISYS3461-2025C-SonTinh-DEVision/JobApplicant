package com.DEVision.JobApplicant.common.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EmailValidator implements ConstraintValidator<ValidEmail, String> {
    
    @Override
    public void initialize(ValidEmail constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        // Check total length (must be less than 255 characters)
        if (email.length() >= 255) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email address must be less than 255 characters")
                   .addConstraintViolation();
            return false;
        }
        
        // Check for exactly one '@' symbol
        long atCount = email.chars().filter(ch -> ch == '@').count();
        if (atCount != 1) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email must contain exactly one '@' symbol")
                   .addConstraintViolation();
            return false;
        }
        
        // Split email into local and domain parts
        String[] parts = email.split("@");
        if (parts.length != 2) {
            return false;
        }
        
        String domain = parts[1];
        
        // Check for at least one '.' after '@'
        if (!domain.contains(".")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email must contain at least one '.' after the '@' symbol")
                   .addConstraintViolation();
            return false;
        }
        
        // Check for spaces or prohibited characters
        String prohibitedChars = "()[];: ";
        for (char c : prohibitedChars.toCharArray()) {
            if (email.indexOf(c) != -1) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Email contains prohibited characters (spaces, parentheses, brackets, semicolons, or colons)")
                       .addConstraintViolation();
                return false;
            }
        }
        
        // Basic format validation
        if (!email.matches("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email format is invalid")
                   .addConstraintViolation();
            return false;
        }
        
        return true;
    }
}

