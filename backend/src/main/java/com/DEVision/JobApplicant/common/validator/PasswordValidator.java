package com.DEVision.JobApplicant.common.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {
    
    @Override
    public void initialize(ValidPassword constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        
        // Check minimum length (8 characters)
        if (password.length() < 8) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must be at least 8 characters long")
                   .addConstraintViolation();
            return false;
        }
        
        // Check for at least one digit
        if (!password.matches(".*\\d.*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must contain at least 1 number")
                   .addConstraintViolation();
            return false;
        }
        
        // Check for at least one special character ($#@!)
        if (!password.matches(".*[$#@!].*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must contain at least 1 special character ($#@!)")
                   .addConstraintViolation();
            return false;
        }
        
        // Check for at least one capitalized letter
        if (!password.matches(".*[A-Z].*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must contain at least 1 capitalized letter")
                   .addConstraintViolation();
            return false;
        }
        
        return true;
    }
}

