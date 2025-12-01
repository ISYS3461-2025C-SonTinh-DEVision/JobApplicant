package com.DEVision.JobApplicant.common.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {
    String message() default "Password must be at least 8 characters long, contain at least 1 number, 1 special character ($#@!), and 1 capitalized letter";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

