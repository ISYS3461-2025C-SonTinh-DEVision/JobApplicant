package com.DEVision.JobApplicant.common.model;

/**
 * Country enum for Job Applicant subsystem
 * Contains major countries where applicants may reside or seek employment
 */
public enum Country {
    // Southeast Asia
    VIETNAM("Vietnam", "VN"),
    SINGAPORE("Singapore", "SG"),
    THAILAND("Thailand", "TH"),
    MALAYSIA("Malaysia", "MY"),
    INDONESIA("Indonesia", "ID"),
    PHILIPPINES("Philippines", "PH"),
    MYANMAR("Myanmar", "MM"),
    CAMBODIA("Cambodia", "KH"),
    LAOS("Laos", "LA"),
    BRUNEI("Brunei", "BN"),
    
    // East Asia
    CHINA("China", "CN"),
    JAPAN("Japan", "JP"),
    SOUTH_KOREA("South Korea", "KR"),
    TAIWAN("Taiwan", "TW"),
    HONG_KONG("Hong Kong", "HK"),
    
    // South Asia
    INDIA("India", "IN"),
    BANGLADESH("Bangladesh", "BD"),
    PAKISTAN("Pakistan", "PK"),
    SRI_LANKA("Sri Lanka", "LK"),
    NEPAL("Nepal", "NP"),
    
    // Oceania
    AUSTRALIA("Australia", "AU"),
    NEW_ZEALAND("New Zealand", "NZ"),
    
    // North America
    UNITED_STATES("United States", "US"),
    CANADA("Canada", "CA"),
    MEXICO("Mexico", "MX"),
    
    // Europe
    UNITED_KINGDOM("United Kingdom", "GB"),
    GERMANY("Germany", "DE"),
    FRANCE("France", "FR"),
    NETHERLANDS("Netherlands", "NL"),
    SWITZERLAND("Switzerland", "CH"),
    SWEDEN("Sweden", "SE"),
    NORWAY("Norway", "NO"),
    DENMARK("Denmark", "DK"),
    FINLAND("Finland", "FI"),
    IRELAND("Ireland", "IE"),
    BELGIUM("Belgium", "BE"),
    AUSTRIA("Austria", "AT"),
    POLAND("Poland", "PL"),
    ITALY("Italy", "IT"),
    SPAIN("Spain", "ES"),
    PORTUGAL("Portugal", "PT"),
    CZECH_REPUBLIC("Czech Republic", "CZ"),
    
    // Middle East
    UNITED_ARAB_EMIRATES("United Arab Emirates", "AE"),
    SAUDI_ARABIA("Saudi Arabia", "SA"),
    ISRAEL("Israel", "IL"),
    QATAR("Qatar", "QA"),
    
    // Africa
    SOUTH_AFRICA("South Africa", "ZA"),
    EGYPT("Egypt", "EG"),
    NIGERIA("Nigeria", "NG"),
    KENYA("Kenya", "KE"),
    
    // South America
    BRAZIL("Brazil", "BR"),
    ARGENTINA("Argentina", "AR"),
    CHILE("Chile", "CL"),
    COLOMBIA("Colombia", "CO");

    private final String displayName;
    private final String code;

    Country(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }

    @Override
    public String toString() {
        return displayName;
    }

    /**
     * Find Country enum by ISO code (e.g., "VN" -> VIETNAM)
     * Also accepts enum name directly (e.g., "VIETNAM")
     */
    public static Country fromCode(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }
        
        // First try to find by ISO code
        for (Country country : Country.values()) {
            if (country.code.equalsIgnoreCase(code)) {
                return country;
            }
        }
        
        // Fall back to enum name
        try {
            return Country.valueOf(code.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
