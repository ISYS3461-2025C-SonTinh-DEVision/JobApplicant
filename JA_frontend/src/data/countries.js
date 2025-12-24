/**
 * Comprehensive Country Data
 * Contains all countries with:
 * - ISO 3166-1 alpha-2 code
 * - Display name
 * - Flag emoji
 * - Dial code
 * - Region for grouping
 */

export const REGIONS = {
    SOUTHEAST_ASIA: 'Southeast Asia',
    EAST_ASIA: 'East Asia',
    SOUTH_ASIA: 'South Asia',
    CENTRAL_ASIA: 'Central Asia',
    WESTERN_ASIA: 'Western Asia / Middle East',
    OCEANIA: 'Oceania',
    NORTH_AMERICA: 'North America',
    CENTRAL_AMERICA: 'Central America',
    CARIBBEAN: 'Caribbean',
    SOUTH_AMERICA: 'South America',
    WESTERN_EUROPE: 'Western Europe',
    NORTHERN_EUROPE: 'Northern Europe',
    SOUTHERN_EUROPE: 'Southern Europe',
    EASTERN_EUROPE: 'Eastern Europe',
    NORTHERN_AFRICA: 'Northern Africa',
    WESTERN_AFRICA: 'Western Africa',
    EASTERN_AFRICA: 'Eastern Africa',
    CENTRAL_AFRICA: 'Central Africa',
    SOUTHERN_AFRICA: 'Southern Africa',
};

/**
 * Complete list of countries
 * Each country has: value (ISO code), label (name), flag (emoji), dialCode, region
 */
export const COUNTRIES = [
    // ============ SOUTHEAST ASIA ============
    { value: 'VN', label: 'Vietnam', flag: '🇻🇳', dialCode: '+84', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'SG', label: 'Singapore', flag: '🇸🇬', dialCode: '+65', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'TH', label: 'Thailand', flag: '🇹🇭', dialCode: '+66', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'MY', label: 'Malaysia', flag: '🇲🇾', dialCode: '+60', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'ID', label: 'Indonesia', flag: '🇮🇩', dialCode: '+62', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'PH', label: 'Philippines', flag: '🇵🇭', dialCode: '+63', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'MM', label: 'Myanmar', flag: '🇲🇲', dialCode: '+95', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'KH', label: 'Cambodia', flag: '🇰🇭', dialCode: '+855', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'LA', label: 'Laos', flag: '🇱🇦', dialCode: '+856', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'BN', label: 'Brunei', flag: '🇧🇳', dialCode: '+673', region: REGIONS.SOUTHEAST_ASIA },
    { value: 'TL', label: 'Timor-Leste', flag: '🇹🇱', dialCode: '+670', region: REGIONS.SOUTHEAST_ASIA },

    // ============ EAST ASIA ============
    { value: 'CN', label: 'China', flag: '🇨🇳', dialCode: '+86', region: REGIONS.EAST_ASIA },
    { value: 'JP', label: 'Japan', flag: '🇯🇵', dialCode: '+81', region: REGIONS.EAST_ASIA },
    { value: 'KR', label: 'South Korea', flag: '🇰🇷', dialCode: '+82', region: REGIONS.EAST_ASIA },
    { value: 'KP', label: 'North Korea', flag: '🇰🇵', dialCode: '+850', region: REGIONS.EAST_ASIA },
    { value: 'TW', label: 'Taiwan', flag: '🇹🇼', dialCode: '+886', region: REGIONS.EAST_ASIA },
    { value: 'HK', label: 'Hong Kong', flag: '🇭🇰', dialCode: '+852', region: REGIONS.EAST_ASIA },
    { value: 'MO', label: 'Macau', flag: '🇲🇴', dialCode: '+853', region: REGIONS.EAST_ASIA },
    { value: 'MN', label: 'Mongolia', flag: '🇲🇳', dialCode: '+976', region: REGIONS.EAST_ASIA },

    // ============ SOUTH ASIA ============
    { value: 'IN', label: 'India', flag: '🇮🇳', dialCode: '+91', region: REGIONS.SOUTH_ASIA },
    { value: 'PK', label: 'Pakistan', flag: '🇵🇰', dialCode: '+92', region: REGIONS.SOUTH_ASIA },
    { value: 'BD', label: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', region: REGIONS.SOUTH_ASIA },
    { value: 'LK', label: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', region: REGIONS.SOUTH_ASIA },
    { value: 'NP', label: 'Nepal', flag: '🇳🇵', dialCode: '+977', region: REGIONS.SOUTH_ASIA },
    { value: 'BT', label: 'Bhutan', flag: '🇧🇹', dialCode: '+975', region: REGIONS.SOUTH_ASIA },
    { value: 'MV', label: 'Maldives', flag: '🇲🇻', dialCode: '+960', region: REGIONS.SOUTH_ASIA },
    { value: 'AF', label: 'Afghanistan', flag: '🇦🇫', dialCode: '+93', region: REGIONS.SOUTH_ASIA },

    // ============ CENTRAL ASIA ============
    { value: 'KZ', label: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7', region: REGIONS.CENTRAL_ASIA },
    { value: 'UZ', label: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998', region: REGIONS.CENTRAL_ASIA },
    { value: 'TM', label: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993', region: REGIONS.CENTRAL_ASIA },
    { value: 'TJ', label: 'Tajikistan', flag: '🇹🇯', dialCode: '+992', region: REGIONS.CENTRAL_ASIA },
    { value: 'KG', label: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996', region: REGIONS.CENTRAL_ASIA },

    // ============ WESTERN ASIA / MIDDLE EAST ============
    { value: 'AE', label: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', region: REGIONS.WESTERN_ASIA },
    { value: 'SA', label: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', region: REGIONS.WESTERN_ASIA },
    { value: 'QA', label: 'Qatar', flag: '🇶🇦', dialCode: '+974', region: REGIONS.WESTERN_ASIA },
    { value: 'KW', label: 'Kuwait', flag: '🇰🇼', dialCode: '+965', region: REGIONS.WESTERN_ASIA },
    { value: 'BH', label: 'Bahrain', flag: '🇧🇭', dialCode: '+973', region: REGIONS.WESTERN_ASIA },
    { value: 'OM', label: 'Oman', flag: '🇴🇲', dialCode: '+968', region: REGIONS.WESTERN_ASIA },
    { value: 'YE', label: 'Yemen', flag: '🇾🇪', dialCode: '+967', region: REGIONS.WESTERN_ASIA },
    { value: 'IL', label: 'Israel', flag: '🇮🇱', dialCode: '+972', region: REGIONS.WESTERN_ASIA },
    { value: 'JO', label: 'Jordan', flag: '🇯🇴', dialCode: '+962', region: REGIONS.WESTERN_ASIA },
    { value: 'LB', label: 'Lebanon', flag: '🇱🇧', dialCode: '+961', region: REGIONS.WESTERN_ASIA },
    { value: 'SY', label: 'Syria', flag: '🇸🇾', dialCode: '+963', region: REGIONS.WESTERN_ASIA },
    { value: 'IQ', label: 'Iraq', flag: '🇮🇶', dialCode: '+964', region: REGIONS.WESTERN_ASIA },
    { value: 'IR', label: 'Iran', flag: '🇮🇷', dialCode: '+98', region: REGIONS.WESTERN_ASIA },
    { value: 'TR', label: 'Turkey', flag: '🇹🇷', dialCode: '+90', region: REGIONS.WESTERN_ASIA },
    { value: 'CY', label: 'Cyprus', flag: '🇨🇾', dialCode: '+357', region: REGIONS.WESTERN_ASIA },
    { value: 'GE', label: 'Georgia', flag: '🇬🇪', dialCode: '+995', region: REGIONS.WESTERN_ASIA },
    { value: 'AM', label: 'Armenia', flag: '🇦🇲', dialCode: '+374', region: REGIONS.WESTERN_ASIA },
    { value: 'AZ', label: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994', region: REGIONS.WESTERN_ASIA },

    // ============ OCEANIA ============
    { value: 'AU', label: 'Australia', flag: '🇦🇺', dialCode: '+61', region: REGIONS.OCEANIA },
    { value: 'NZ', label: 'New Zealand', flag: '🇳🇿', dialCode: '+64', region: REGIONS.OCEANIA },
    { value: 'FJ', label: 'Fiji', flag: '🇫🇯', dialCode: '+679', region: REGIONS.OCEANIA },
    { value: 'PG', label: 'Papua New Guinea', flag: '🇵🇬', dialCode: '+675', region: REGIONS.OCEANIA },
    { value: 'SB', label: 'Solomon Islands', flag: '🇸🇧', dialCode: '+677', region: REGIONS.OCEANIA },
    { value: 'VU', label: 'Vanuatu', flag: '🇻🇺', dialCode: '+678', region: REGIONS.OCEANIA },
    { value: 'NC', label: 'New Caledonia', flag: '🇳🇨', dialCode: '+687', region: REGIONS.OCEANIA },
    { value: 'PF', label: 'French Polynesia', flag: '🇵🇫', dialCode: '+689', region: REGIONS.OCEANIA },
    { value: 'WS', label: 'Samoa', flag: '🇼🇸', dialCode: '+685', region: REGIONS.OCEANIA },
    { value: 'TO', label: 'Tonga', flag: '🇹🇴', dialCode: '+676', region: REGIONS.OCEANIA },
    { value: 'GU', label: 'Guam', flag: '🇬🇺', dialCode: '+1671', region: REGIONS.OCEANIA },
    { value: 'KI', label: 'Kiribati', flag: '🇰🇮', dialCode: '+686', region: REGIONS.OCEANIA },
    { value: 'FM', label: 'Micronesia', flag: '🇫🇲', dialCode: '+691', region: REGIONS.OCEANIA },
    { value: 'MH', label: 'Marshall Islands', flag: '🇲🇭', dialCode: '+692', region: REGIONS.OCEANIA },
    { value: 'PW', label: 'Palau', flag: '🇵🇼', dialCode: '+680', region: REGIONS.OCEANIA },
    { value: 'NR', label: 'Nauru', flag: '🇳🇷', dialCode: '+674', region: REGIONS.OCEANIA },
    { value: 'TV', label: 'Tuvalu', flag: '🇹🇻', dialCode: '+688', region: REGIONS.OCEANIA },

    // ============ NORTH AMERICA ============
    { value: 'US', label: 'United States', flag: '🇺🇸', dialCode: '+1', region: REGIONS.NORTH_AMERICA },
    { value: 'CA', label: 'Canada', flag: '🇨🇦', dialCode: '+1', region: REGIONS.NORTH_AMERICA },
    { value: 'MX', label: 'Mexico', flag: '🇲🇽', dialCode: '+52', region: REGIONS.NORTH_AMERICA },

    // ============ CENTRAL AMERICA ============
    { value: 'GT', label: 'Guatemala', flag: '🇬🇹', dialCode: '+502', region: REGIONS.CENTRAL_AMERICA },
    { value: 'BZ', label: 'Belize', flag: '🇧🇿', dialCode: '+501', region: REGIONS.CENTRAL_AMERICA },
    { value: 'HN', label: 'Honduras', flag: '🇭🇳', dialCode: '+504', region: REGIONS.CENTRAL_AMERICA },
    { value: 'SV', label: 'El Salvador', flag: '🇸🇻', dialCode: '+503', region: REGIONS.CENTRAL_AMERICA },
    { value: 'NI', label: 'Nicaragua', flag: '🇳🇮', dialCode: '+505', region: REGIONS.CENTRAL_AMERICA },
    { value: 'CR', label: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', region: REGIONS.CENTRAL_AMERICA },
    { value: 'PA', label: 'Panama', flag: '🇵🇦', dialCode: '+507', region: REGIONS.CENTRAL_AMERICA },

    // ============ CARIBBEAN ============
    { value: 'CU', label: 'Cuba', flag: '🇨🇺', dialCode: '+53', region: REGIONS.CARIBBEAN },
    { value: 'JM', label: 'Jamaica', flag: '🇯🇲', dialCode: '+1876', region: REGIONS.CARIBBEAN },
    { value: 'HT', label: 'Haiti', flag: '🇭🇹', dialCode: '+509', region: REGIONS.CARIBBEAN },
    { value: 'DO', label: 'Dominican Republic', flag: '🇩🇴', dialCode: '+1809', region: REGIONS.CARIBBEAN },
    { value: 'PR', label: 'Puerto Rico', flag: '🇵🇷', dialCode: '+1787', region: REGIONS.CARIBBEAN },
    { value: 'TT', label: 'Trinidad and Tobago', flag: '🇹🇹', dialCode: '+1868', region: REGIONS.CARIBBEAN },
    { value: 'BB', label: 'Barbados', flag: '🇧🇧', dialCode: '+1246', region: REGIONS.CARIBBEAN },
    { value: 'BS', label: 'Bahamas', flag: '🇧🇸', dialCode: '+1242', region: REGIONS.CARIBBEAN },

    // ============ SOUTH AMERICA ============
    { value: 'BR', label: 'Brazil', flag: '🇧🇷', dialCode: '+55', region: REGIONS.SOUTH_AMERICA },
    { value: 'AR', label: 'Argentina', flag: '🇦🇷', dialCode: '+54', region: REGIONS.SOUTH_AMERICA },
    { value: 'CL', label: 'Chile', flag: '🇨🇱', dialCode: '+56', region: REGIONS.SOUTH_AMERICA },
    { value: 'CO', label: 'Colombia', flag: '🇨🇴', dialCode: '+57', region: REGIONS.SOUTH_AMERICA },
    { value: 'PE', label: 'Peru', flag: '🇵🇪', dialCode: '+51', region: REGIONS.SOUTH_AMERICA },
    { value: 'VE', label: 'Venezuela', flag: '🇻🇪', dialCode: '+58', region: REGIONS.SOUTH_AMERICA },
    { value: 'EC', label: 'Ecuador', flag: '🇪🇨', dialCode: '+593', region: REGIONS.SOUTH_AMERICA },
    { value: 'BO', label: 'Bolivia', flag: '🇧🇴', dialCode: '+591', region: REGIONS.SOUTH_AMERICA },
    { value: 'PY', label: 'Paraguay', flag: '🇵🇾', dialCode: '+595', region: REGIONS.SOUTH_AMERICA },
    { value: 'UY', label: 'Uruguay', flag: '🇺🇾', dialCode: '+598', region: REGIONS.SOUTH_AMERICA },
    { value: 'GY', label: 'Guyana', flag: '🇬🇾', dialCode: '+592', region: REGIONS.SOUTH_AMERICA },
    { value: 'SR', label: 'Suriname', flag: '🇸🇷', dialCode: '+597', region: REGIONS.SOUTH_AMERICA },

    // ============ WESTERN EUROPE ============
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', region: REGIONS.WESTERN_EUROPE },
    { value: 'DE', label: 'Germany', flag: '🇩🇪', dialCode: '+49', region: REGIONS.WESTERN_EUROPE },
    { value: 'FR', label: 'France', flag: '🇫🇷', dialCode: '+33', region: REGIONS.WESTERN_EUROPE },
    { value: 'NL', label: 'Netherlands', flag: '🇳🇱', dialCode: '+31', region: REGIONS.WESTERN_EUROPE },
    { value: 'BE', label: 'Belgium', flag: '🇧🇪', dialCode: '+32', region: REGIONS.WESTERN_EUROPE },
    { value: 'LU', label: 'Luxembourg', flag: '🇱🇺', dialCode: '+352', region: REGIONS.WESTERN_EUROPE },
    { value: 'CH', label: 'Switzerland', flag: '🇨🇭', dialCode: '+41', region: REGIONS.WESTERN_EUROPE },
    { value: 'AT', label: 'Austria', flag: '🇦🇹', dialCode: '+43', region: REGIONS.WESTERN_EUROPE },
    { value: 'IE', label: 'Ireland', flag: '🇮🇪', dialCode: '+353', region: REGIONS.WESTERN_EUROPE },
    { value: 'MC', label: 'Monaco', flag: '🇲🇨', dialCode: '+377', region: REGIONS.WESTERN_EUROPE },
    { value: 'LI', label: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423', region: REGIONS.WESTERN_EUROPE },

    // ============ NORTHERN EUROPE ============
    { value: 'SE', label: 'Sweden', flag: '🇸🇪', dialCode: '+46', region: REGIONS.NORTHERN_EUROPE },
    { value: 'NO', label: 'Norway', flag: '🇳🇴', dialCode: '+47', region: REGIONS.NORTHERN_EUROPE },
    { value: 'DK', label: 'Denmark', flag: '🇩🇰', dialCode: '+45', region: REGIONS.NORTHERN_EUROPE },
    { value: 'FI', label: 'Finland', flag: '🇫🇮', dialCode: '+358', region: REGIONS.NORTHERN_EUROPE },
    { value: 'IS', label: 'Iceland', flag: '🇮🇸', dialCode: '+354', region: REGIONS.NORTHERN_EUROPE },
    { value: 'EE', label: 'Estonia', flag: '🇪🇪', dialCode: '+372', region: REGIONS.NORTHERN_EUROPE },
    { value: 'LV', label: 'Latvia', flag: '🇱🇻', dialCode: '+371', region: REGIONS.NORTHERN_EUROPE },
    { value: 'LT', label: 'Lithuania', flag: '🇱🇹', dialCode: '+370', region: REGIONS.NORTHERN_EUROPE },

    // ============ SOUTHERN EUROPE ============
    { value: 'IT', label: 'Italy', flag: '🇮🇹', dialCode: '+39', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'ES', label: 'Spain', flag: '🇪🇸', dialCode: '+34', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'PT', label: 'Portugal', flag: '🇵🇹', dialCode: '+351', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'GR', label: 'Greece', flag: '🇬🇷', dialCode: '+30', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'MT', label: 'Malta', flag: '🇲🇹', dialCode: '+356', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'HR', label: 'Croatia', flag: '🇭🇷', dialCode: '+385', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'SI', label: 'Slovenia', flag: '🇸🇮', dialCode: '+386', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'BA', label: 'Bosnia and Herzegovina', flag: '🇧🇦', dialCode: '+387', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'RS', label: 'Serbia', flag: '🇷🇸', dialCode: '+381', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'ME', label: 'Montenegro', flag: '🇲🇪', dialCode: '+382', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'MK', label: 'North Macedonia', flag: '🇲🇰', dialCode: '+389', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'AL', label: 'Albania', flag: '🇦🇱', dialCode: '+355', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'XK', label: 'Kosovo', flag: '🇽🇰', dialCode: '+383', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'SM', label: 'San Marino', flag: '🇸🇲', dialCode: '+378', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'VA', label: 'Vatican City', flag: '🇻🇦', dialCode: '+379', region: REGIONS.SOUTHERN_EUROPE },
    { value: 'AD', label: 'Andorra', flag: '🇦🇩', dialCode: '+376', region: REGIONS.SOUTHERN_EUROPE },

    // ============ EASTERN EUROPE ============
    { value: 'RU', label: 'Russia', flag: '🇷🇺', dialCode: '+7', region: REGIONS.EASTERN_EUROPE },
    { value: 'UA', label: 'Ukraine', flag: '🇺🇦', dialCode: '+380', region: REGIONS.EASTERN_EUROPE },
    { value: 'PL', label: 'Poland', flag: '🇵🇱', dialCode: '+48', region: REGIONS.EASTERN_EUROPE },
    { value: 'CZ', label: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', region: REGIONS.EASTERN_EUROPE },
    { value: 'SK', label: 'Slovakia', flag: '🇸🇰', dialCode: '+421', region: REGIONS.EASTERN_EUROPE },
    { value: 'HU', label: 'Hungary', flag: '🇭🇺', dialCode: '+36', region: REGIONS.EASTERN_EUROPE },
    { value: 'RO', label: 'Romania', flag: '🇷🇴', dialCode: '+40', region: REGIONS.EASTERN_EUROPE },
    { value: 'BG', label: 'Bulgaria', flag: '🇧🇬', dialCode: '+359', region: REGIONS.EASTERN_EUROPE },
    { value: 'BY', label: 'Belarus', flag: '🇧🇾', dialCode: '+375', region: REGIONS.EASTERN_EUROPE },
    { value: 'MD', label: 'Moldova', flag: '🇲🇩', dialCode: '+373', region: REGIONS.EASTERN_EUROPE },

    // ============ NORTHERN AFRICA ============
    { value: 'EG', label: 'Egypt', flag: '🇪🇬', dialCode: '+20', region: REGIONS.NORTHERN_AFRICA },
    { value: 'LY', label: 'Libya', flag: '🇱🇾', dialCode: '+218', region: REGIONS.NORTHERN_AFRICA },
    { value: 'TN', label: 'Tunisia', flag: '🇹🇳', dialCode: '+216', region: REGIONS.NORTHERN_AFRICA },
    { value: 'DZ', label: 'Algeria', flag: '🇩🇿', dialCode: '+213', region: REGIONS.NORTHERN_AFRICA },
    { value: 'MA', label: 'Morocco', flag: '🇲🇦', dialCode: '+212', region: REGIONS.NORTHERN_AFRICA },
    { value: 'SD', label: 'Sudan', flag: '🇸🇩', dialCode: '+249', region: REGIONS.NORTHERN_AFRICA },

    // ============ WESTERN AFRICA ============
    { value: 'NG', label: 'Nigeria', flag: '🇳🇬', dialCode: '+234', region: REGIONS.WESTERN_AFRICA },
    { value: 'GH', label: 'Ghana', flag: '🇬🇭', dialCode: '+233', region: REGIONS.WESTERN_AFRICA },
    { value: 'CI', label: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '+225', region: REGIONS.WESTERN_AFRICA },
    { value: 'SN', label: 'Senegal', flag: '🇸🇳', dialCode: '+221', region: REGIONS.WESTERN_AFRICA },
    { value: 'ML', label: 'Mali', flag: '🇲🇱', dialCode: '+223', region: REGIONS.WESTERN_AFRICA },
    { value: 'BF', label: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', region: REGIONS.WESTERN_AFRICA },
    { value: 'NE', label: 'Niger', flag: '🇳🇪', dialCode: '+227', region: REGIONS.WESTERN_AFRICA },
    { value: 'GN', label: 'Guinea', flag: '🇬🇳', dialCode: '+224', region: REGIONS.WESTERN_AFRICA },
    { value: 'BJ', label: 'Benin', flag: '🇧🇯', dialCode: '+229', region: REGIONS.WESTERN_AFRICA },
    { value: 'TG', label: 'Togo', flag: '🇹🇬', dialCode: '+228', region: REGIONS.WESTERN_AFRICA },
    { value: 'SL', label: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232', region: REGIONS.WESTERN_AFRICA },
    { value: 'LR', label: 'Liberia', flag: '🇱🇷', dialCode: '+231', region: REGIONS.WESTERN_AFRICA },
    { value: 'MR', label: 'Mauritania', flag: '🇲🇷', dialCode: '+222', region: REGIONS.WESTERN_AFRICA },
    { value: 'GM', label: 'Gambia', flag: '🇬🇲', dialCode: '+220', region: REGIONS.WESTERN_AFRICA },
    { value: 'GW', label: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245', region: REGIONS.WESTERN_AFRICA },
    { value: 'CV', label: 'Cape Verde', flag: '🇨🇻', dialCode: '+238', region: REGIONS.WESTERN_AFRICA },

    // ============ EASTERN AFRICA ============
    { value: 'KE', label: 'Kenya', flag: '🇰🇪', dialCode: '+254', region: REGIONS.EASTERN_AFRICA },
    { value: 'ET', label: 'Ethiopia', flag: '🇪🇹', dialCode: '+251', region: REGIONS.EASTERN_AFRICA },
    { value: 'TZ', label: 'Tanzania', flag: '🇹🇿', dialCode: '+255', region: REGIONS.EASTERN_AFRICA },
    { value: 'UG', label: 'Uganda', flag: '🇺🇬', dialCode: '+256', region: REGIONS.EASTERN_AFRICA },
    { value: 'RW', label: 'Rwanda', flag: '🇷🇼', dialCode: '+250', region: REGIONS.EASTERN_AFRICA },
    { value: 'BI', label: 'Burundi', flag: '🇧🇮', dialCode: '+257', region: REGIONS.EASTERN_AFRICA },
    { value: 'SO', label: 'Somalia', flag: '🇸🇴', dialCode: '+252', region: REGIONS.EASTERN_AFRICA },
    { value: 'DJ', label: 'Djibouti', flag: '🇩🇯', dialCode: '+253', region: REGIONS.EASTERN_AFRICA },
    { value: 'ER', label: 'Eritrea', flag: '🇪🇷', dialCode: '+291', region: REGIONS.EASTERN_AFRICA },
    { value: 'SS', label: 'South Sudan', flag: '🇸🇸', dialCode: '+211', region: REGIONS.EASTERN_AFRICA },
    { value: 'MG', label: 'Madagascar', flag: '🇲🇬', dialCode: '+261', region: REGIONS.EASTERN_AFRICA },
    { value: 'MU', label: 'Mauritius', flag: '🇲🇺', dialCode: '+230', region: REGIONS.EASTERN_AFRICA },
    { value: 'SC', label: 'Seychelles', flag: '🇸🇨', dialCode: '+248', region: REGIONS.EASTERN_AFRICA },
    { value: 'KM', label: 'Comoros', flag: '🇰🇲', dialCode: '+269', region: REGIONS.EASTERN_AFRICA },
    { value: 'RE', label: 'Réunion', flag: '🇷🇪', dialCode: '+262', region: REGIONS.EASTERN_AFRICA },

    // ============ CENTRAL AFRICA ============
    { value: 'CD', label: 'DR Congo', flag: '🇨🇩', dialCode: '+243', region: REGIONS.CENTRAL_AFRICA },
    { value: 'CG', label: 'Republic of Congo', flag: '🇨🇬', dialCode: '+242', region: REGIONS.CENTRAL_AFRICA },
    { value: 'CM', label: 'Cameroon', flag: '🇨🇲', dialCode: '+237', region: REGIONS.CENTRAL_AFRICA },
    { value: 'CF', label: 'Central African Republic', flag: '🇨🇫', dialCode: '+236', region: REGIONS.CENTRAL_AFRICA },
    { value: 'TD', label: 'Chad', flag: '🇹🇩', dialCode: '+235', region: REGIONS.CENTRAL_AFRICA },
    { value: 'GA', label: 'Gabon', flag: '🇬🇦', dialCode: '+241', region: REGIONS.CENTRAL_AFRICA },
    { value: 'GQ', label: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240', region: REGIONS.CENTRAL_AFRICA },
    { value: 'ST', label: 'São Tomé and Príncipe', flag: '🇸🇹', dialCode: '+239', region: REGIONS.CENTRAL_AFRICA },
    { value: 'AO', label: 'Angola', flag: '🇦🇴', dialCode: '+244', region: REGIONS.CENTRAL_AFRICA },

    // ============ SOUTHERN AFRICA ============
    { value: 'ZA', label: 'South Africa', flag: '🇿🇦', dialCode: '+27', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'ZW', label: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'ZM', label: 'Zambia', flag: '🇿🇲', dialCode: '+260', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'BW', label: 'Botswana', flag: '🇧🇼', dialCode: '+267', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'NA', label: 'Namibia', flag: '🇳🇦', dialCode: '+264', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'MZ', label: 'Mozambique', flag: '🇲🇿', dialCode: '+258', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'MW', label: 'Malawi', flag: '🇲🇼', dialCode: '+265', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'LS', label: 'Lesotho', flag: '🇱🇸', dialCode: '+266', region: REGIONS.SOUTHERN_AFRICA },
    { value: 'SZ', label: 'Eswatini', flag: '🇸🇿', dialCode: '+268', region: REGIONS.SOUTHERN_AFRICA },
];

/**
 * Get countries grouped by region
 */
export function getCountriesByRegion() {
    const grouped = {};

    COUNTRIES.forEach(country => {
        if (!grouped[country.region]) {
            grouped[country.region] = [];
        }
        grouped[country.region].push(country);
    });

    return grouped;
}

/**
 * Get country by ISO code
 */
export function getCountryByCode(code) {
    return COUNTRIES.find(c => c.value === code);
}

/**
 * Get country by dial code
 */
export function getCountryByDialCode(dialCode) {
    return COUNTRIES.find(c => c.dialCode === dialCode);
}

/**
 * Search countries by name or code
 */
export function searchCountries(query) {
    const lowerQuery = query.toLowerCase();
    return COUNTRIES.filter(c =>
        c.label.toLowerCase().includes(lowerQuery) ||
        c.value.toLowerCase().includes(lowerQuery) ||
        c.dialCode.includes(query)
    );
}

export default COUNTRIES;
