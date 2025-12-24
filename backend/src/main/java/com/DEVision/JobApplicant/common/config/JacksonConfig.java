package com.DEVision.JobApplicant.common.config;

import com.DEVision.JobApplicant.common.model.Country;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Jackson configuration for custom JSON deserialization
 * Handles Country enum conversion from ISO codes
 */
@Configuration
public class JacksonConfig {

    @Bean
    public SimpleModule countryModule() {
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Country.class, new CountryDeserializer());
        return module;
    }

    /**
     * Custom deserializer for Country enum
     * Accepts both ISO codes (e.g., "VN", "JP") and enum names (e.g., "VIETNAM", "JAPAN")
     */
    public static class CountryDeserializer extends JsonDeserializer<Country> {
        @Override
        public Country deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = p.getValueAsString();
            if (value == null || value.isEmpty()) {
                return null;
            }
            
            Country country = Country.fromCode(value);
            if (country == null) {
                throw new IOException("Invalid country code or name: " + value);
            }
            return country;
        }
    }
}
