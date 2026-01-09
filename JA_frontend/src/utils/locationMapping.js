/**
 * Smart Location Mapping Utility with Global Coverage
 * Uses country-state-city package for comprehensive worldwide location data
 * 
 * Coverage: 250+ countries, 5000+ states, 150,000+ cities
 * 
 * This utility enables:
 * 1. Filtering by country to include jobs in that country's cities/states
 * 2. Intelligent location recognition for any location worldwide
 * 3. Mapping cities back to their countries
 */

import { Country, State, City } from 'country-state-city';

// Cache for performance - maps normalized country names to their location terms
const locationCache = new Map();

// Common country name aliases (for cases where user input differs from package data)
const COUNTRY_ALIASES = {
    // Vietnam variations
    'vietnam': 'VN',
    'vn': 'VN',
    'việt nam': 'VN',
    'viet nam': 'VN',

    // USA variations
    'united states': 'US',
    'usa': 'US',
    'us': 'US',
    'america': 'US',
    'u.s.': 'US',
    'u.s.a.': 'US',
    'united states of america': 'US',

    // UK variations
    'united kingdom': 'GB',
    'uk': 'GB',
    'britain': 'GB',
    'great britain': 'GB',
    'england': 'GB',
    'gb': 'GB',

    // Other common aliases
    'singapore': 'SG',
    'sg': 'SG',
    'japan': 'JP',
    'jp': 'JP',
    'australia': 'AU',
    'au': 'AU',
    'germany': 'DE',
    'de': 'DE',
    'canada': 'CA',
    'ca': 'CA',
    'india': 'IN',
    'in': 'IN',
    'china': 'CN',
    'cn': 'CN',
    'south korea': 'KR',
    'korea': 'KR',
    'kr': 'KR',
    'netherlands': 'NL',
    'holland': 'NL',
    'nl': 'NL',
    'france': 'FR',
    'fr': 'FR',
    'thailand': 'TH',
    'th': 'TH',
    'malaysia': 'MY',
    'my': 'MY',
    'indonesia': 'ID',
    'id': 'ID',
    'philippines': 'PH',
    'ph': 'PH',
    'brunei': 'BN',
    'bn': 'BN',
    'taiwan': 'TW',
    'tw': 'TW',
    'hong kong': 'HK',
    'hk': 'HK',
    'new zealand': 'NZ',
    'nz': 'NZ',
    'switzerland': 'CH',
    'ch': 'CH',
    'sweden': 'SE',
    'se': 'SE',
    'norway': 'NO',
    'no': 'NO',
    'denmark': 'DK',
    'dk': 'DK',
    'finland': 'FI',
    'fi': 'FI',
    'ireland': 'IE',
    'ie': 'IE',
    'spain': 'ES',
    'es': 'ES',
    'italy': 'IT',
    'it': 'IT',
    'brazil': 'BR',
    'br': 'BR',
    'mexico': 'MX',
    'mx': 'MX',
    'russia': 'RU',
    'ru': 'RU',
    'uae': 'AE',
    'united arab emirates': 'AE',
    'ae': 'AE',
    'saudi arabia': 'SA',
    'sa': 'SA',
    'israel': 'IL',
    'il': 'IL',
    'poland': 'PL',
    'pl': 'PL',
    'czech republic': 'CZ',
    'czechia': 'CZ',
    'cz': 'CZ',
    'austria': 'AT',
    'at': 'AT',
    'belgium': 'BE',
    'be': 'BE',
    'portugal': 'PT',
    'pt': 'PT',
    'greece': 'GR',
    'gr': 'GR',
    'turkey': 'TR',
    'tr': 'TR',
    'egypt': 'EG',
    'eg': 'EG',
    'south africa': 'ZA',
    'za': 'ZA',
    'nigeria': 'NG',
    'ng': 'NG',
    'pakistan': 'PK',
    'pk': 'PK',
    'bangladesh': 'BD',
    'bd': 'BD',
    'argentina': 'AR',
    'ar': 'AR',
    'chile': 'CL',
    'cl': 'CL',
    'colombia': 'CO',
    'co': 'CO',
    'peru': 'PE',
    'pe': 'PE',
};

// Custom city variations not in the package (common abbreviations)
const CUSTOM_CITY_ALIASES = {
    // Vietnam
    'hcm': 'Ho Chi Minh City',
    'hcm city': 'Ho Chi Minh City',
    'saigon': 'Ho Chi Minh City',
    'sài gòn': 'Ho Chi Minh City',
    'hà nội': 'Hanoi',
    'đà nẵng': 'Da Nang',
    'hải phòng': 'Hai Phong',
    'cần thơ': 'Can Tho',
    'nha trang': 'Nha Trang',
    'huế': 'Hue',
    'đà lạt': 'Da Lat',
    'vũng tàu': 'Vung Tau',
    'biên hòa': 'Bien Hoa',

    // USA
    'nyc': 'New York',
    'la': 'Los Angeles',
    'sf': 'San Francisco',
    'dc': 'Washington',
    'philly': 'Philadelphia',
    'chi-town': 'Chicago',
    'silicon valley': 'San Jose',

    // UK
    'london': 'London',

    // Others
    'bkk': 'Bangkok',
    'kl': 'Kuala Lumpur',
    'bgc': 'Taguig', // Bonifacio Global City is in Taguig, Philippines
};

/**
 * Get country ISO code from country name or alias
 * @param {string} input - Country name or alias
 * @returns {string|null} ISO code or null
 */
const getCountryCode = (input) => {
    if (!input) return null;

    const normalized = input.toLowerCase().trim();

    // Check aliases first
    if (COUNTRY_ALIASES[normalized]) {
        return COUNTRY_ALIASES[normalized];
    }

    // Try to find by name in package data
    const countries = Country.getAllCountries();
    const found = countries.find(c =>
        c.name.toLowerCase() === normalized ||
        c.isoCode.toLowerCase() === normalized
    );

    return found?.isoCode || null;
};

/**
 * Get all location terms for a country (cities, states, and variations)
 * Uses caching for performance
 * @param {string} countryInput - Country name or code
 * @returns {string[]} Array of all location terms (lowercase)
 */
export const getLocationTermsForCountry = (countryInput) => {
    if (!countryInput) return [];

    const normalized = countryInput.toLowerCase().trim();

    // Check cache first
    if (locationCache.has(normalized)) {
        return locationCache.get(normalized);
    }

    const countryCode = getCountryCode(countryInput);
    if (!countryCode) {
        // If not a known country, return the input itself
        return [normalized];
    }

    const country = Country.getCountryByCode(countryCode);
    if (!country) {
        return [normalized];
    }

    const terms = new Set();

    // Add country name and code
    terms.add(country.name.toLowerCase());
    terms.add(country.isoCode.toLowerCase());

    // Add all aliases for this country
    Object.entries(COUNTRY_ALIASES).forEach(([alias, code]) => {
        if (code === countryCode) {
            terms.add(alias);
        }
    });

    // Add all states
    const states = State.getStatesOfCountry(countryCode);
    states.forEach(state => {
        terms.add(state.name.toLowerCase());
        if (state.isoCode) {
            terms.add(state.isoCode.toLowerCase());
        }
    });

    // Add all cities
    const cities = City.getCitiesOfCountry(countryCode);
    if (cities) {
        cities.forEach(city => {
            terms.add(city.name.toLowerCase());
        });
    }

    // Add custom city aliases for this country
    Object.entries(CUSTOM_CITY_ALIASES).forEach(([alias, cityName]) => {
        // Check if this city belongs to the country
        if (cities?.some(c => c.name.toLowerCase() === cityName.toLowerCase())) {
            terms.add(alias);
        }
    });

    const termsArray = Array.from(terms);

    // Cache the result
    locationCache.set(normalized, termsArray);

    console.log(`[LocationMapping] Loaded ${termsArray.length} location terms for ${country.name}`);

    return termsArray;
};

/**
 * Get the country for a given location (city, state, or country name)
 * @param {string} location - Location to look up
 * @returns {string|null} Country name or null if not found
 */
export const getCountryForLocation = (location) => {
    if (!location) return null;

    const normalized = location.toLowerCase().trim();

    // Check if it's a known country alias
    const countryCode = getCountryCode(normalized);
    if (countryCode) {
        const country = Country.getCountryByCode(countryCode);
        return country?.name || null;
    }

    // Check custom aliases
    if (CUSTOM_CITY_ALIASES[normalized]) {
        // This is a city alias, we need to find which country
        const cityName = CUSTOM_CITY_ALIASES[normalized];
        // Search through all countries (expensive but rare operation)
        const countries = Country.getAllCountries();
        for (const country of countries) {
            const cities = City.getCitiesOfCountry(country.isoCode);
            if (cities?.some(c => c.name.toLowerCase() === cityName.toLowerCase())) {
                return country.name;
            }
        }
    }

    // Search through cities (this is expensive, so we limit searches)
    // For a production system, you'd want a proper reverse lookup database
    return null;
};

/**
 * Check if a job location matches a country filter
 * @param {string} jobLocation - The job's location from JM
 * @param {string} countryFilter - The country filter selected by user
 * @returns {boolean} True if the job location is in the country
 */
export const locationMatchesCountry = (jobLocation, countryFilter) => {
    if (!jobLocation || !countryFilter) return false;

    const normalizedJobLocation = jobLocation.toLowerCase().trim();
    const normalizedCountryFilter = countryFilter.toLowerCase().trim();

    // Direct match first
    if (normalizedJobLocation.includes(normalizedCountryFilter) ||
        normalizedCountryFilter.includes(normalizedJobLocation)) {
        return true;
    }

    // Get all terms for the country filter
    const countryTerms = getLocationTermsForCountry(countryFilter);

    // Check if job location contains any term OR any term contains job location
    return countryTerms.some(term => {
        const t = term.toLowerCase();
        return normalizedJobLocation.includes(t) || t.includes(normalizedJobLocation);
    });
};

/**
 * Build location search query for API
 * For known countries, we fetch all jobs and filter client-side to match cities
 * 
 * @param {string} selectedLocation - User's selected location filter
 * @returns {Object} { useApiFilter: boolean, apiLocation: string, localFilter: function }
 */
export const buildLocationSearchStrategy = (selectedLocation) => {
    if (!selectedLocation) {
        return {
            useApiFilter: false,
            apiLocation: null,
            localFilter: null
        };
    }

    const countryCode = getCountryCode(selectedLocation);

    if (countryCode) {
        // For countries, don't use API filter - we'll filter client-side
        // This allows us to match all cities within that country
        return {
            useApiFilter: false,
            apiLocation: null,
            localFilter: (jobLocation) => locationMatchesCountry(jobLocation, selectedLocation)
        };
    }

    // For specific cities or unknown locations, use API filter
    return {
        useApiFilter: true,
        apiLocation: selectedLocation,
        localFilter: null
    };
};

/**
 * Get list of countries for dropdown (all 250+ countries)
 * @returns {Array<{value: string, label: string, isoCode: string}>}
 */
export const getCountryOptions = () => {
    const countries = Country.getAllCountries();

    // Popular countries first
    const popularCodes = ['VN', 'US', 'GB', 'SG', 'JP', 'AU', 'DE', 'CA', 'IN', 'CN', 'KR', 'NL', 'FR', 'TH', 'MY', 'ID', 'PH'];

    const popular = popularCodes
        .map(code => countries.find(c => c.isoCode === code))
        .filter(Boolean)
        .map(c => ({
            value: c.name,
            label: c.name,
            isoCode: c.isoCode
        }));

    const others = countries
        .filter(c => !popularCodes.includes(c.isoCode))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => ({
            value: c.name,
            label: c.name,
            isoCode: c.isoCode
        }));

    return [
        { value: '', label: 'All Locations', isoCode: '' },
        { value: 'Remote', label: '🌍 Remote / Worldwide', isoCode: 'REMOTE' },
        { value: 'divider-popular', label: '── Popular ──', isoCode: '', disabled: true },
        ...popular,
        { value: 'divider-all', label: '── All Countries ──', isoCode: '', disabled: true },
        ...others
    ];
};

/**
 * Get stats about the location database
 * @returns {Object} Statistics
 */
export const getLocationDatabaseStats = () => {
    const countries = Country.getAllCountries();
    let totalStates = 0;
    let totalCities = 0;

    countries.forEach(country => {
        const states = State.getStatesOfCountry(country.isoCode);
        totalStates += states.length;

        const cities = City.getCitiesOfCountry(country.isoCode);
        totalCities += cities?.length || 0;
    });

    return {
        countries: countries.length,
        states: totalStates,
        cities: totalCities
    };
};

export default {
    getLocationTermsForCountry,
    getCountryForLocation,
    locationMatchesCountry,
    buildLocationSearchStrategy,
    getCountryOptions,
    getLocationDatabaseStats,
    getCountryCode
};
