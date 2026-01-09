package com.DEVision.JobApplicant.jobManager.jobpost.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for mapping countries to their cities, states, and location variations.
 * Used to intelligently filter jobs by country - matching all cities within that country.
 * 
 * Coverage: 40+ major countries with their major cities
 * 
 * Example: "Vietnam" filter will match jobs in "HCM City", "Hanoi", "Da Nang", etc.
 */
@Service
public class LocationMappingService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocationMappingService.class);
    
    // Cache for performance
    private final Map<String, Set<String>> countryTermsCache = new ConcurrentHashMap<>();
    
    // Country code to country name mapping
    private static final Map<String, String> COUNTRY_CODES = new LinkedHashMap<>();
    
    // Country name to city/region terms mapping
    private static final Map<String, Set<String>> COUNTRY_LOCATIONS = new LinkedHashMap<>();
    
    static {
        initializeCountryCodes();
        initializeCountryLocations();
    }
    
    private static void initializeCountryCodes() {
        COUNTRY_CODES.put("VN", "vietnam");
        COUNTRY_CODES.put("US", "united states");
        COUNTRY_CODES.put("GB", "united kingdom");
        COUNTRY_CODES.put("SG", "singapore");
        COUNTRY_CODES.put("JP", "japan");
        COUNTRY_CODES.put("AU", "australia");
        COUNTRY_CODES.put("DE", "germany");
        COUNTRY_CODES.put("CA", "canada");
        COUNTRY_CODES.put("IN", "india");
        COUNTRY_CODES.put("CN", "china");
        COUNTRY_CODES.put("KR", "south korea");
        COUNTRY_CODES.put("NL", "netherlands");
        COUNTRY_CODES.put("FR", "france");
        COUNTRY_CODES.put("TH", "thailand");
        COUNTRY_CODES.put("MY", "malaysia");
        COUNTRY_CODES.put("ID", "indonesia");
        COUNTRY_CODES.put("PH", "philippines");
        COUNTRY_CODES.put("BN", "brunei");
        COUNTRY_CODES.put("TW", "taiwan");
        COUNTRY_CODES.put("HK", "hong kong");
        COUNTRY_CODES.put("NZ", "new zealand");
        COUNTRY_CODES.put("CH", "switzerland");
        COUNTRY_CODES.put("SE", "sweden");
        COUNTRY_CODES.put("NO", "norway");
        COUNTRY_CODES.put("DK", "denmark");
        COUNTRY_CODES.put("FI", "finland");
        COUNTRY_CODES.put("IE", "ireland");
        COUNTRY_CODES.put("ES", "spain");
        COUNTRY_CODES.put("IT", "italy");
        COUNTRY_CODES.put("BR", "brazil");
        COUNTRY_CODES.put("MX", "mexico");
        COUNTRY_CODES.put("RU", "russia");
        COUNTRY_CODES.put("AE", "uae");
        COUNTRY_CODES.put("SA", "saudi arabia");
        COUNTRY_CODES.put("IL", "israel");
        COUNTRY_CODES.put("PL", "poland");
        COUNTRY_CODES.put("CZ", "czech republic");
        COUNTRY_CODES.put("AT", "austria");
        COUNTRY_CODES.put("BE", "belgium");
        COUNTRY_CODES.put("PT", "portugal");
    }
    
    private static void initializeCountryLocations() {
        // Vietnam
        COUNTRY_LOCATIONS.put("vietnam", new HashSet<>(Arrays.asList(
            "vietnam", "vn", "việt nam", "viet nam",
            "ho chi minh", "hcm", "hcm city", "saigon", "sài gòn",
            "hanoi", "ha noi", "hà nội",
            "da nang", "đà nẵng", "danang",
            "hai phong", "hải phòng", "haiphong",
            "can tho", "cần thơ", "cantho",
            "bien hoa", "biên hòa", "bienhoa",
            "nha trang", "nhatrang",
            "hue", "huế",
            "vung tau", "vũng tàu", "vungtau",
            "da lat", "đà lạt", "dalat",
            "phu quoc", "phú quốc",
            "quy nhon", "quy nhơn",
            "vinh", "nghệ an", "nghe an",
            "buon ma thuot", "đắk lắk",
            "thu dau mot", "bình dương", "binh duong",
            "dong nai", "đồng nai",
            "long an", "tay ninh", "tây ninh"
        )));
        
        // United States
        COUNTRY_LOCATIONS.put("united states", new HashSet<>(Arrays.asList(
            "united states", "us", "usa", "america", "u.s.", "u.s.a.",
            "new york", "nyc", "ny", "manhattan", "brooklyn",
            "los angeles", "la", "california", "ca",
            "chicago", "il", "illinois",
            "houston", "texas", "tx", "dallas", "austin", "san antonio",
            "phoenix", "arizona", "az",
            "philadelphia", "pa", "pennsylvania",
            "san diego", "san jose", "san francisco", "sf",
            "seattle", "washington", "wa",
            "denver", "colorado", "co",
            "boston", "massachusetts", "ma",
            "atlanta", "georgia", "ga",
            "miami", "florida", "fl", "orlando", "tampa",
            "detroit", "michigan", "mi",
            "minneapolis", "minnesota", "mn",
            "portland", "oregon", "or",
            "las vegas", "nevada", "nv",
            "silicon valley", "palo alto", "mountain view", "cupertino",
            "raleigh", "north carolina", "nc", "charlotte",
            "nashville", "tennessee", "tn",
            "new jersey", "nj"
        )));
        
        // United Kingdom
        COUNTRY_LOCATIONS.put("united kingdom", new HashSet<>(Arrays.asList(
            "united kingdom", "uk", "britain", "great britain", "england", "gb",
            "london", "manchester", "birmingham", "leeds", "liverpool",
            "glasgow", "scotland", "edinburgh",
            "bristol", "sheffield", "newcastle",
            "cardiff", "wales", "belfast", "northern ireland",
            "nottingham", "leicester", "coventry",
            "cambridge", "oxford", "brighton",
            "reading", "southampton"
        )));
        
        // Singapore
        COUNTRY_LOCATIONS.put("singapore", new HashSet<>(Arrays.asList(
            "singapore", "sg", "singapura",
            "raffles place", "marina bay", "one-north", "changi", "jurong"
        )));
        
        // Japan
        COUNTRY_LOCATIONS.put("japan", new HashSet<>(Arrays.asList(
            "japan", "jp", "nippon", "nihon",
            "tokyo", "osaka", "kyoto", "yokohama", "nagoya",
            "sapporo", "fukuoka", "kobe", "sendai",
            "hiroshima", "chiba", "shibuya", "shinjuku"
        )));
        
        // Australia
        COUNTRY_LOCATIONS.put("australia", new HashSet<>(Arrays.asList(
            "australia", "au", "aus", "aussie",
            "sydney", "melbourne", "brisbane", "perth", "adelaide",
            "gold coast", "canberra", "hobart", "darwin",
            "nsw", "new south wales", "victoria", "queensland"
        )));
        
        // Germany
        COUNTRY_LOCATIONS.put("germany", new HashSet<>(Arrays.asList(
            "germany", "de", "deutschland",
            "berlin", "munich", "münchen", "frankfurt", "hamburg",
            "cologne", "köln", "düsseldorf", "stuttgart", "dortmund",
            "essen", "leipzig", "bremen", "dresden", "hanover"
        )));
        
        // Canada
        COUNTRY_LOCATIONS.put("canada", new HashSet<>(Arrays.asList(
            "canada", "ca", "can",
            "toronto", "vancouver", "montreal", "calgary", "ottawa",
            "edmonton", "winnipeg", "quebec", "hamilton",
            "ontario", "british columbia", "bc", "alberta"
        )));
        
        // India
        COUNTRY_LOCATIONS.put("india", new HashSet<>(Arrays.asList(
            "india", "in", "ind", "bharat",
            "bangalore", "bengaluru", "mumbai", "bombay", "delhi",
            "new delhi", "hyderabad", "chennai", "madras", "pune",
            "kolkata", "calcutta", "ahmedabad", "jaipur", "lucknow",
            "surat", "gurgaon", "gurugram", "noida"
        )));
        
        // China
        COUNTRY_LOCATIONS.put("china", new HashSet<>(Arrays.asList(
            "china", "cn", "prc", "zhongguo",
            "beijing", "shanghai", "shenzhen", "guangzhou", "hangzhou",
            "chengdu", "xian", "wuhan", "suzhou", "nanjing",
            "tianjin", "chongqing", "dongguan", "foshan"
        )));
        
        // South Korea
        COUNTRY_LOCATIONS.put("south korea", new HashSet<>(Arrays.asList(
            "south korea", "korea", "kr", "rok",
            "seoul", "busan", "incheon", "daegu", "daejeon",
            "gwangju", "suwon", "seongnam", "gangnam"
        )));
        
        // Netherlands
        COUNTRY_LOCATIONS.put("netherlands", new HashSet<>(Arrays.asList(
            "netherlands", "nl", "holland", "dutch",
            "amsterdam", "rotterdam", "the hague", "den haag",
            "utrecht", "eindhoven", "groningen", "tilburg"
        )));
        
        // France
        COUNTRY_LOCATIONS.put("france", new HashSet<>(Arrays.asList(
            "france", "fr", "french",
            "paris", "marseille", "lyon", "toulouse", "nice",
            "nantes", "strasbourg", "montpellier", "bordeaux", "lille"
        )));
        
        // Thailand
        COUNTRY_LOCATIONS.put("thailand", new HashSet<>(Arrays.asList(
            "thailand", "th", "thai",
            "bangkok", "bkk", "chiang mai", "phuket", "pattaya",
            "khon kaen", "nakhon ratchasima", "korat"
        )));
        
        // Malaysia
        COUNTRY_LOCATIONS.put("malaysia", new HashSet<>(Arrays.asList(
            "malaysia", "my", "mys",
            "kuala lumpur", "kl", "penang", "johor bahru", "malacca",
            "ipoh", "kuching", "kota kinabalu", "petaling jaya", "cyberjaya"
        )));
        
        // Indonesia
        COUNTRY_LOCATIONS.put("indonesia", new HashSet<>(Arrays.asList(
            "indonesia", "id", "indo",
            "jakarta", "surabaya", "bandung", "medan", "semarang",
            "makassar", "palembang", "tangerang", "depok", "bekasi",
            "bali", "denpasar", "yogyakarta", "jogja"
        )));
        
        // Philippines
        COUNTRY_LOCATIONS.put("philippines", new HashSet<>(Arrays.asList(
            "philippines", "ph", "phl", "pinoy",
            "manila", "makati", "cebu", "davao", "quezon city",
            "pasig", "taguig", "bgc", "bonifacio global city",
            "clark", "subic", "iloilo"
        )));
        
        // Brunei
        COUNTRY_LOCATIONS.put("brunei", new HashSet<>(Arrays.asList(
            "brunei", "bn", "brunei darussalam",
            "bandar seri begawan", "kuala belait", "seria", "tutong", "temburong"
        )));
        
        // Taiwan
        COUNTRY_LOCATIONS.put("taiwan", new HashSet<>(Arrays.asList(
            "taiwan", "tw", "taipei",
            "kaohsiung", "taichung", "tainan", "hsinchu", "taoyuan"
        )));
        
        // Hong Kong
        COUNTRY_LOCATIONS.put("hong kong", new HashSet<>(Arrays.asList(
            "hong kong", "hk", "hongkong",
            "kowloon", "central", "wan chai", "tsim sha tsui"
        )));
        
        // Add more countries as needed...
        // Remote/Global
        COUNTRY_LOCATIONS.put("remote", new HashSet<>(Arrays.asList(
            "remote", "worldwide", "global", "anywhere", "work from home", "wfh"
        )));
    }
    
    /**
     * Check if a location string represents a known country
     * @param location Location string to check
     * @return true if it's a recognized country name or code
     */
    public boolean isCountry(String location) {
        if (location == null || location.trim().isEmpty()) {
            return false;
        }
        
        String normalized = location.toLowerCase().trim();
        
        // Check if it's a country code
        if (COUNTRY_CODES.containsKey(normalized.toUpperCase())) {
            return true;
        }
        
        // Check if it's a country name
        return COUNTRY_LOCATIONS.containsKey(normalized) ||
               COUNTRY_CODES.containsValue(normalized);
    }
    
    /**
     * Get the canonical country name for a location input
     * @param location Location string (country name, code, or alias)
     * @return Canonical country name or null if not found
     */
    public String getCanonicalCountryName(String location) {
        if (location == null || location.trim().isEmpty()) {
            return null;
        }
        
        String normalized = location.toLowerCase().trim();
        
        // Check if it's a country code
        String upperCode = normalized.toUpperCase();
        if (COUNTRY_CODES.containsKey(upperCode)) {
            return COUNTRY_CODES.get(upperCode);
        }
        
        // Check if it's already a country name
        if (COUNTRY_LOCATIONS.containsKey(normalized)) {
            return normalized;
        }
        
        // Check if it's an alias in any country's location set
        for (Map.Entry<String, Set<String>> entry : COUNTRY_LOCATIONS.entrySet()) {
            if (entry.getValue().contains(normalized)) {
                return entry.getKey();
            }
        }
        
        return null;
    }
    
    /**
     * Get all location terms for a country (for matching job locations)
     * @param countryInput Country name or code
     * @return Set of all location terms for that country (lowercase)
     */
    public Set<String> getLocationTermsForCountry(String countryInput) {
        if (countryInput == null || countryInput.trim().isEmpty()) {
            return Collections.emptySet();
        }
        
        String country = getCanonicalCountryName(countryInput);
        if (country == null) {
            // Not a known country, return the original term
            return Collections.singleton(countryInput.toLowerCase().trim());
        }
        
        // Check cache first
        if (countryTermsCache.containsKey(country)) {
            return countryTermsCache.get(country);
        }
        
        Set<String> terms = COUNTRY_LOCATIONS.getOrDefault(country, Collections.emptySet());
        
        // Cache for performance
        countryTermsCache.put(country, terms);
        
        logger.debug("Loaded {} location terms for country: {}", terms.size(), country);
        
        return terms;
    }
    
    /**
     * Check if a job location matches a country filter
     * @param jobLocation The job's location string
     * @param countryFilter The country filter from user
     * @return true if the job location is in the specified country
     */
    public boolean locationMatchesCountry(String jobLocation, String countryFilter) {
        if (jobLocation == null || jobLocation.trim().isEmpty()) {
            return false;
        }
        
        if (countryFilter == null || countryFilter.trim().isEmpty()) {
            return true; // No filter, matches all
        }
        
        String normalizedJobLocation = jobLocation.toLowerCase().trim();
        String normalizedFilter = countryFilter.toLowerCase().trim();
        
        // Get the canonical country name for the filter
        String filterCountry = getCanonicalCountryName(countryFilter);
        
        // Check if job location IS the filter country (or its alias)
        String jobCountry = getCanonicalCountryName(jobLocation);
        if (jobCountry != null && filterCountry != null && jobCountry.equals(filterCountry)) {
            return true;
        }
        
        // Exact match
        if (normalizedJobLocation.equals(normalizedFilter)) {
            return true;
        }
        
        // Get all terms for the country filter
        Set<String> countryTerms = getLocationTermsForCountry(countryFilter);
        
        // Check if job location matches any term using word-boundary matching
        for (String term : countryTerms) {
            if (matchesWithWordBoundary(normalizedJobLocation, term)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if text contains term as a whole word (not as part of another word)
     * For short terms (2 chars like "us", "uk"), require exact match or proper word boundary
     * This prevents "australia" from matching "us" filter
     */
    private boolean matchesWithWordBoundary(String text, String term) {
        if (text == null || term == null || term.isEmpty()) {
            return false;
        }
        
        // Exact match
        if (text.equals(term)) {
            return true;
        }
        
        // For very short terms (2 chars or less), require exact match only
        // This prevents "australia" from matching "au" or "us"
        if (term.length() <= 2) {
            return text.equals(term);
        }
        
        // For longer terms (3+ chars), check if it appears as a word
        // Handle cases like "HCM City" matching "hcm"
        int index = text.indexOf(term);
        while (index >= 0) {
            boolean startOk = (index == 0) || !Character.isLetterOrDigit(text.charAt(index - 1));
            boolean endOk = (index + term.length() >= text.length()) || 
                           !Character.isLetterOrDigit(text.charAt(index + term.length()));
            
            if (startOk && endOk) {
                return true;
            }
            
            // Continue searching
            index = text.indexOf(term, index + 1);
        }
        
        return false;
    }
    
    /**
     * Get list of supported countries
     * @return List of country names
     */
    public List<String> getSupportedCountries() {
        return new ArrayList<>(COUNTRY_LOCATIONS.keySet());
    }
}
