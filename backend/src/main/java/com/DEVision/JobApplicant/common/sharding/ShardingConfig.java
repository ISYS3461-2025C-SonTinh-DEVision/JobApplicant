package com.DEVision.JobApplicant.common.sharding;

import com.DEVision.JobApplicant.common.country.model.Country;
import java.util.Map;
import java.util.HashMap;

/**
 * Sharding Configuration for Job Applicant Subsystem
 * Implements logical sharding using geographic regions as shard keys.
 * 
 * Ultimo Requirements:
 * - 1.3.3: Country as shard key (grouped by region)
 * - 3.3.2: Migrate data when country changes to different region
 * - 4.3.1: Route search to relevant shard (default: Southeast Asia)
 * - A.3.4: Apply sharding techniques for scalability
 * 
 * Uses 19 geographic shard regions matching frontend REGIONS in countries.js
 */
public class ShardingConfig {

    /**
     * Shard Region Enum
     * Represents 19 logical database shards based on geographic regions
     */
    public enum ShardRegion {
        // Asia
        SOUTHEAST_ASIA("sea", "SEA", "Southeast Asia", "🌏"),
        EAST_ASIA("east_asia", "EA", "East Asia", "🌏"),
        SOUTH_ASIA("south_asia", "SA-R", "South Asia", "🌏"),
        CENTRAL_ASIA("central_asia", "CA", "Central Asia", "🌏"),
        WESTERN_ASIA("western_asia", "WA", "Middle East", "🌍"),
        
        // Oceania
        OCEANIA("oceania", "OC", "Oceania", "🌏"),
        
        // Americas
        NORTH_AMERICA("north_america", "NA", "North America", "🌎"),
        CENTRAL_AMERICA("central_america", "CAM", "Central America", "🌎"),
        CARIBBEAN("caribbean", "CAR", "Caribbean", "🌎"),
        SOUTH_AMERICA("south_america", "SAM", "South America", "🌎"),
        
        // Europe
        WESTERN_EUROPE("western_europe", "WE", "Western Europe", "🌍"),
        NORTHERN_EUROPE("northern_europe", "NE", "Northern Europe", "🌍"),
        SOUTHERN_EUROPE("southern_europe", "SE", "Southern Europe", "🌍"),
        EASTERN_EUROPE("eastern_europe", "EE", "Eastern Europe", "🌍"),
        
        // Africa
        NORTHERN_AFRICA("northern_africa", "NAF", "Northern Africa", "🌍"),
        WESTERN_AFRICA("western_africa", "WAF", "Western Africa", "🌍"),
        EASTERN_AFRICA("eastern_africa", "EAF", "Eastern Africa", "🌍"),
        CENTRAL_AFRICA("central_africa", "CAF", "Central Africa", "🌍"),
        SOUTHERN_AFRICA("southern_africa", "SAF", "Southern Africa", "🌍");

        private final String shardId;
        private final String code;
        private final String displayName;
        private final String emoji;

        ShardRegion(String shardId, String code, String displayName, String emoji) {
            this.shardId = shardId;
            this.code = code;
            this.displayName = displayName;
            this.emoji = emoji;
        }

        public String getShardId() { return shardId; }
        public String getCode() { return code; }
        public String getDisplayName() { return displayName; }
        public String getEmoji() { return emoji; }
    }

    // Country code to region mapping (matches frontend countries.js regions)
    private static final Map<String, ShardRegion> COUNTRY_TO_SHARD = new HashMap<>();
    
    static {
        // ============ SOUTHEAST ASIA ============
        COUNTRY_TO_SHARD.put("VN", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("SG", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("TH", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("MY", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("ID", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("PH", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("MM", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("KH", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("LA", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("BN", ShardRegion.SOUTHEAST_ASIA);
        COUNTRY_TO_SHARD.put("TL", ShardRegion.SOUTHEAST_ASIA);
        
        // ============ EAST ASIA ============
        COUNTRY_TO_SHARD.put("CN", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("JP", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("KR", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("KP", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("TW", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("HK", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("MO", ShardRegion.EAST_ASIA);
        COUNTRY_TO_SHARD.put("MN", ShardRegion.EAST_ASIA);
        
        // ============ SOUTH ASIA ============
        COUNTRY_TO_SHARD.put("IN", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("PK", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("BD", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("LK", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("NP", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("BT", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("MV", ShardRegion.SOUTH_ASIA);
        COUNTRY_TO_SHARD.put("AF", ShardRegion.SOUTH_ASIA);
        
        // ============ CENTRAL ASIA ============
        COUNTRY_TO_SHARD.put("KZ", ShardRegion.CENTRAL_ASIA);
        COUNTRY_TO_SHARD.put("UZ", ShardRegion.CENTRAL_ASIA);
        COUNTRY_TO_SHARD.put("TM", ShardRegion.CENTRAL_ASIA);
        COUNTRY_TO_SHARD.put("TJ", ShardRegion.CENTRAL_ASIA);
        COUNTRY_TO_SHARD.put("KG", ShardRegion.CENTRAL_ASIA);
        
        // ============ WESTERN ASIA / MIDDLE EAST ============
        COUNTRY_TO_SHARD.put("AE", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("SA", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("QA", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("KW", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("BH", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("OM", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("YE", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("IL", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("JO", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("LB", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("SY", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("IQ", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("IR", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("TR", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("CY", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("GE", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("AM", ShardRegion.WESTERN_ASIA);
        COUNTRY_TO_SHARD.put("AZ", ShardRegion.WESTERN_ASIA);
        
        // ============ OCEANIA ============
        COUNTRY_TO_SHARD.put("AU", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("NZ", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("FJ", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("PG", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("SB", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("VU", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("NC", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("PF", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("WS", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("TO", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("GU", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("KI", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("FM", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("MH", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("PW", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("NR", ShardRegion.OCEANIA);
        COUNTRY_TO_SHARD.put("TV", ShardRegion.OCEANIA);
        
        // ============ NORTH AMERICA ============
        COUNTRY_TO_SHARD.put("US", ShardRegion.NORTH_AMERICA);
        COUNTRY_TO_SHARD.put("CA", ShardRegion.NORTH_AMERICA);
        COUNTRY_TO_SHARD.put("MX", ShardRegion.NORTH_AMERICA);
        
        // ============ CENTRAL AMERICA ============
        COUNTRY_TO_SHARD.put("GT", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("BZ", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("HN", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("SV", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("NI", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("CR", ShardRegion.CENTRAL_AMERICA);
        COUNTRY_TO_SHARD.put("PA", ShardRegion.CENTRAL_AMERICA);
        
        // ============ CARIBBEAN ============
        COUNTRY_TO_SHARD.put("CU", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("JM", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("HT", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("DO", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("PR", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("TT", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("BB", ShardRegion.CARIBBEAN);
        COUNTRY_TO_SHARD.put("BS", ShardRegion.CARIBBEAN);
        
        // ============ SOUTH AMERICA ============
        COUNTRY_TO_SHARD.put("BR", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("AR", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("CL", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("CO", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("PE", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("VE", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("EC", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("BO", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("PY", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("UY", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("GY", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("SR", ShardRegion.SOUTH_AMERICA);
        COUNTRY_TO_SHARD.put("GF", ShardRegion.SOUTH_AMERICA);
        
        // ============ WESTERN EUROPE ============
        COUNTRY_TO_SHARD.put("GB", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("DE", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("FR", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("NL", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("BE", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("LU", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("CH", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("AT", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("LI", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("MC", ShardRegion.WESTERN_EUROPE);
        COUNTRY_TO_SHARD.put("IE", ShardRegion.WESTERN_EUROPE);
        
        // ============ NORTHERN EUROPE ============
        COUNTRY_TO_SHARD.put("SE", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("NO", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("DK", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("FI", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("IS", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("EE", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("LV", ShardRegion.NORTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("LT", ShardRegion.NORTHERN_EUROPE);
        
        // ============ SOUTHERN EUROPE ============
        COUNTRY_TO_SHARD.put("IT", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("ES", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("PT", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("GR", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("HR", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("SI", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("MT", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("AL", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("MK", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("RS", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("ME", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("BA", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("XK", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("AD", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("SM", ShardRegion.SOUTHERN_EUROPE);
        COUNTRY_TO_SHARD.put("VA", ShardRegion.SOUTHERN_EUROPE);
        
        // ============ EASTERN EUROPE ============
        COUNTRY_TO_SHARD.put("PL", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("CZ", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("SK", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("HU", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("RO", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("BG", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("UA", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("BY", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("MD", ShardRegion.EASTERN_EUROPE);
        COUNTRY_TO_SHARD.put("RU", ShardRegion.EASTERN_EUROPE);
        
        // ============ NORTHERN AFRICA ============
        COUNTRY_TO_SHARD.put("EG", ShardRegion.NORTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("LY", ShardRegion.NORTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("TN", ShardRegion.NORTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("DZ", ShardRegion.NORTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("MA", ShardRegion.NORTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("SD", ShardRegion.NORTHERN_AFRICA);
        
        // ============ WESTERN AFRICA ============
        COUNTRY_TO_SHARD.put("NG", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("GH", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("CI", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("SN", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("ML", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("BF", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("NE", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("GN", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("BJ", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("TG", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("SL", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("LR", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("MR", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("GM", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("GW", ShardRegion.WESTERN_AFRICA);
        COUNTRY_TO_SHARD.put("CV", ShardRegion.WESTERN_AFRICA);
        
        // ============ EASTERN AFRICA ============
        COUNTRY_TO_SHARD.put("KE", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("TZ", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("UG", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("RW", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("BI", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("ET", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("ER", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("DJ", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("SO", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("MG", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("MU", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("SC", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("KM", ShardRegion.EASTERN_AFRICA);
        COUNTRY_TO_SHARD.put("SS", ShardRegion.EASTERN_AFRICA);
        
        // ============ CENTRAL AFRICA ============
        COUNTRY_TO_SHARD.put("CD", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("CG", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("CM", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("CF", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("TD", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("GA", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("GQ", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("ST", ShardRegion.CENTRAL_AFRICA);
        COUNTRY_TO_SHARD.put("AO", ShardRegion.CENTRAL_AFRICA);
        
        // ============ SOUTHERN AFRICA ============
        COUNTRY_TO_SHARD.put("ZA", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("ZW", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("ZM", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("BW", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("NA", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("MW", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("MZ", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("SZ", ShardRegion.SOUTHERN_AFRICA);
        COUNTRY_TO_SHARD.put("LS", ShardRegion.SOUTHERN_AFRICA);
    }

    /**
     * Get shard region for a Country enum
     */
    public static ShardRegion getShardForCountry(Country country) {
        if (country == null) {
            return ShardRegion.SOUTHEAST_ASIA; // Default to SEA
        }
        return getShardForCountryCode(country.getCode());
    }

    /**
     * Get shard region for a country code (e.g., "VN", "US")
     */
    public static ShardRegion getShardForCountryCode(String countryCode) {
        if (countryCode == null || countryCode.isEmpty()) {
            return ShardRegion.SOUTHEAST_ASIA; // Default to SEA per 4.3.1
        }
        ShardRegion shard = COUNTRY_TO_SHARD.get(countryCode.toUpperCase());
        return shard != null ? shard : ShardRegion.SOUTHEAST_ASIA;
    }

    /**
     * Get shard ID string for a country code
     */
    public static String getShardId(String countryCode) {
        return getShardForCountryCode(countryCode).getShardId();
    }

    /**
     * Get shard ID for a Country enum
     */
    public static String getShardId(Country country) {
        return getShardForCountry(country).getShardId();
    }

    /**
     * Check if data migration is needed when country changes
     */
    public static boolean needsMigration(String oldCountryCode, String newCountryCode) {
        ShardRegion oldShard = getShardForCountryCode(oldCountryCode);
        ShardRegion newShard = getShardForCountryCode(newCountryCode);
        return oldShard != newShard;
    }

    /**
     * Get the default shard for job searches
     * Per requirement 4.3.1: Default to Vietnam/Southeast Asia
     */
    public static ShardRegion getDefaultSearchShard() {
        return ShardRegion.SOUTHEAST_ASIA;
    }

    /**
     * Get total number of mapped countries
     */
    public static int getMappedCountryCount() {
        return COUNTRY_TO_SHARD.size();
    }
}
