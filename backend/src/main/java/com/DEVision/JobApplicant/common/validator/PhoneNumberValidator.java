package com.DEVision.JobApplicant.common.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    
    private boolean optional;
    
    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.optional = constraintAnnotation.optional();
    }
    
    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        // If phone number is optional and null/empty, it's valid
        if (optional && (phoneNumber == null || phoneNumber.trim().isEmpty())) {
            return true;
        }
        
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }
        
        // Must start with '+'
        if (!phoneNumber.startsWith("+")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must start with a valid international dial code (e.g., +84, +49)")
                   .addConstraintViolation();
            return false;
        }
        
        // Remove the '+' for further validation
        String numberWithoutPlus = phoneNumber.substring(1);
        
        // Check if it contains only digits
        if (!numberWithoutPlus.matches("\\d+")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must contain only digits after the '+' symbol")
                   .addConstraintViolation();
            return false;
        }
        
        // Extract dial code (1-4 digits) and the rest
        // Common dial codes are 1-4 digits long
        String dialCode = "";
        String restOfNumber = "";
        
        // Try to identify the dial code (1-4 digits)
        for (int i = 1; i <= Math.min(4, numberWithoutPlus.length()); i++) {
            dialCode = numberWithoutPlus.substring(0, i);
            restOfNumber = numberWithoutPlus.substring(i);
            
            // Validate against common dial codes
            if (isValidDialCode(dialCode)) {
                break;
            }
        }
        
        // Check if dial code is valid
        if (!isValidDialCode(dialCode)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Invalid international dial code")
                   .addConstraintViolation();
            return false;
        }
        
        // Check the length of digits following the dial code (must be less than 13)
        if (restOfNumber.length() >= 13) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("The number of digits following the dial code must be less than 13")
                   .addConstraintViolation();
            return false;
        }
        
        // Ensure there are some digits after the dial code
        if (restOfNumber.isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must have digits after the dial code")
                   .addConstraintViolation();
            return false;
        }
        
        return true;
    }
    
    private boolean isValidDialCode(String code) {
        // Common international dial codes
        String[] validDialCodes = {
            "1", "7", "20", "27", "30", "31", "32", "33", "34", "36", "39", "40", "41", "43", "44", "45", "46", "47", "48", "49",
            "51", "52", "53", "54", "55", "56", "57", "58", "60", "61", "62", "63", "64", "65", "66", "81", "82", "84", "86", "90", "91",
            "92", "93", "94", "95", "98", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "226", "227", "228",
            "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245",
            "246", "248", "249", "250", "251", "252", "253", "254", "255", "256", "257", "258", "260", "261", "262", "263", "264",
            "265", "266", "267", "268", "269", "290", "291", "297", "298", "299", "350", "351", "352", "353", "354", "355", "356",
            "357", "358", "359", "370", "371", "372", "373", "374", "375", "376", "377", "378", "380", "381", "382", "385", "386",
            "387", "389", "420", "421", "423", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "590", "591",
            "592", "593", "594", "595", "596", "597", "598", "599", "670", "672", "673", "674", "675", "676", "677", "678", "679",
            "680", "681", "682", "683", "685", "686", "687", "688", "689", "690", "691", "692", "850", "852", "853", "855", "856",
            "880", "886", "960", "961", "962", "963", "964", "965", "966", "967", "968", "970", "971", "972", "973", "974", "975",
            "976", "977", "992", "993", "994", "995", "996", "998"
        };
        
        for (String validCode : validDialCodes) {
            if (code.equals(validCode)) {
                return true;
            }
        }
        return false;
    }
}

