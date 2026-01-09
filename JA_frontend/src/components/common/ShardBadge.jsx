/**
 * ShardBadge Component
 * Displays the user's current shard region based on their country
 * 
 * Per Ultimo requirements:
 * - 1.3.3: Country as shard key
 * - A.3.4: Sharding visualization for user awareness
 * 
 * Uses 19 geographic shard regions matching backend ShardingConfig.java
 * and frontend countries.js REGIONS
 */

import React from 'react';
import { Database, Cloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { REGIONS } from '../../data/countries';

// Shard region configurations matching backend ShardingConfig.java
const SHARD_REGIONS = {
    // Asia
    sea: { id: 'sea', code: 'SEA', displayName: 'Southeast Asia', emoji: '🌏', color: 'emerald' },
    east_asia: { id: 'east_asia', code: 'EA', displayName: 'East Asia', emoji: '🌏', color: 'blue' },
    south_asia: { id: 'south_asia', code: 'SA-R', displayName: 'South Asia', emoji: '🌏', color: 'orange' },
    central_asia: { id: 'central_asia', code: 'CA', displayName: 'Central Asia', emoji: '🌏', color: 'yellow' },
    western_asia: { id: 'western_asia', code: 'WA', displayName: 'Middle East', emoji: '🌍', color: 'amber' },

    // Oceania
    oceania: { id: 'oceania', code: 'OC', displayName: 'Oceania', emoji: '🌏', color: 'cyan' },

    // Americas
    north_america: { id: 'north_america', code: 'NA', displayName: 'North America', emoji: '🌎', color: 'indigo' },
    central_america: { id: 'central_america', code: 'CAM', displayName: 'Central America', emoji: '🌎', color: 'purple' },
    caribbean: { id: 'caribbean', code: 'CAR', displayName: 'Caribbean', emoji: '🌎', color: 'pink' },
    south_america: { id: 'south_america', code: 'SAM', displayName: 'South America', emoji: '🌎', color: 'lime' },

    // Europe
    western_europe: { id: 'western_europe', code: 'WE', displayName: 'Western Europe', emoji: '🌍', color: 'sky' },
    northern_europe: { id: 'northern_europe', code: 'NE', displayName: 'Northern Europe', emoji: '🌍', color: 'teal' },
    southern_europe: { id: 'southern_europe', code: 'SE', displayName: 'Southern Europe', emoji: '🌍', color: 'rose' },
    eastern_europe: { id: 'eastern_europe', code: 'EE', displayName: 'Eastern Europe', emoji: '🌍', color: 'fuchsia' },

    // Africa
    northern_africa: { id: 'northern_africa', code: 'NAF', displayName: 'Northern Africa', emoji: '🌍', color: 'amber' },
    western_africa: { id: 'western_africa', code: 'WAF', displayName: 'Western Africa', emoji: '🌍', color: 'orange' },
    eastern_africa: { id: 'eastern_africa', code: 'EAF', displayName: 'Eastern Africa', emoji: '🌍', color: 'yellow' },
    central_africa: { id: 'central_africa', code: 'CAF', displayName: 'Central Africa', emoji: '🌍', color: 'lime' },
    southern_africa: { id: 'southern_africa', code: 'SAF', displayName: 'Southern Africa', emoji: '🌍', color: 'green' },
};

// Map frontend REGIONS to shard IDs
const REGION_TO_SHARD = {
    [REGIONS.SOUTHEAST_ASIA]: 'sea',
    [REGIONS.EAST_ASIA]: 'east_asia',
    [REGIONS.SOUTH_ASIA]: 'south_asia',
    [REGIONS.CENTRAL_ASIA]: 'central_asia',
    [REGIONS.WESTERN_ASIA]: 'western_asia',
    [REGIONS.OCEANIA]: 'oceania',
    [REGIONS.NORTH_AMERICA]: 'north_america',
    [REGIONS.CENTRAL_AMERICA]: 'central_america',
    [REGIONS.CARIBBEAN]: 'caribbean',
    [REGIONS.SOUTH_AMERICA]: 'south_america',
    [REGIONS.WESTERN_EUROPE]: 'western_europe',
    [REGIONS.NORTHERN_EUROPE]: 'northern_europe',
    [REGIONS.SOUTHERN_EUROPE]: 'southern_europe',
    [REGIONS.EASTERN_EUROPE]: 'eastern_europe',
    [REGIONS.NORTHERN_AFRICA]: 'northern_africa',
    [REGIONS.WESTERN_AFRICA]: 'western_africa',
    [REGIONS.EASTERN_AFRICA]: 'eastern_africa',
    [REGIONS.CENTRAL_AFRICA]: 'central_africa',
    [REGIONS.SOUTHERN_AFRICA]: 'southern_africa',
};

/**
 * Get shard region for a frontend region string
 */
export function getShardForRegion(region) {
    const shardId = REGION_TO_SHARD[region] || 'sea';
    return SHARD_REGIONS[shardId] || SHARD_REGIONS.sea;
}

/**
 * Get shard by shardId (from backend)
 */
export function getShardById(shardId) {
    return SHARD_REGIONS[shardId] || SHARD_REGIONS.sea;
}

// Country code to shard mapping (matching backend ShardingConfig.java)
const COUNTRY_TO_SHARD = {
    // Southeast Asia
    VN: 'sea', SG: 'sea', TH: 'sea', MY: 'sea', ID: 'sea', PH: 'sea', MM: 'sea', KH: 'sea', LA: 'sea', BN: 'sea', TL: 'sea',
    // East Asia
    CN: 'east_asia', JP: 'east_asia', KR: 'east_asia', KP: 'east_asia', TW: 'east_asia', HK: 'east_asia', MO: 'east_asia', MN: 'east_asia',
    // South Asia
    IN: 'south_asia', PK: 'south_asia', BD: 'south_asia', LK: 'south_asia', NP: 'south_asia', BT: 'south_asia', MV: 'south_asia', AF: 'south_asia',
    // Central Asia
    KZ: 'central_asia', UZ: 'central_asia', TM: 'central_asia', TJ: 'central_asia', KG: 'central_asia',
    // Western Asia / Middle East
    AE: 'western_asia', SA: 'western_asia', QA: 'western_asia', KW: 'western_asia', BH: 'western_asia', OM: 'western_asia', YE: 'western_asia', IL: 'western_asia', JO: 'western_asia', LB: 'western_asia', SY: 'western_asia', IQ: 'western_asia', IR: 'western_asia', TR: 'western_asia', CY: 'western_asia', GE: 'western_asia', AM: 'western_asia', AZ: 'western_asia',
    // Oceania
    AU: 'oceania', NZ: 'oceania', FJ: 'oceania', PG: 'oceania', SB: 'oceania', VU: 'oceania', NC: 'oceania', PF: 'oceania', WS: 'oceania', TO: 'oceania', GU: 'oceania', KI: 'oceania', FM: 'oceania', MH: 'oceania', PW: 'oceania', NR: 'oceania', TV: 'oceania',
    // North America
    US: 'north_america', CA: 'north_america', MX: 'north_america',
    // Central America
    GT: 'central_america', BZ: 'central_america', HN: 'central_america', SV: 'central_america', NI: 'central_america', CR: 'central_america', PA: 'central_america',
    // Caribbean
    CU: 'caribbean', JM: 'caribbean', HT: 'caribbean', DO: 'caribbean', PR: 'caribbean', TT: 'caribbean', BB: 'caribbean', BS: 'caribbean',
    // South America
    BR: 'south_america', AR: 'south_america', CL: 'south_america', CO: 'south_america', PE: 'south_america', VE: 'south_america', EC: 'south_america', BO: 'south_america', PY: 'south_america', UY: 'south_america', GY: 'south_america', SR: 'south_america', GF: 'south_america',
    // Western Europe
    GB: 'western_europe', DE: 'western_europe', FR: 'western_europe', NL: 'western_europe', BE: 'western_europe', LU: 'western_europe', CH: 'western_europe', AT: 'western_europe', LI: 'western_europe', MC: 'western_europe', IE: 'western_europe',
    // Northern Europe
    SE: 'northern_europe', NO: 'northern_europe', DK: 'northern_europe', FI: 'northern_europe', IS: 'northern_europe', EE: 'northern_europe', LV: 'northern_europe', LT: 'northern_europe',
    // Southern Europe
    IT: 'southern_europe', ES: 'southern_europe', PT: 'southern_europe', GR: 'southern_europe', HR: 'southern_europe', SI: 'southern_europe', MT: 'southern_europe', AL: 'southern_europe', MK: 'southern_europe', RS: 'southern_europe', ME: 'southern_europe', BA: 'southern_europe', XK: 'southern_europe', AD: 'southern_europe', SM: 'southern_europe', VA: 'southern_europe',
    // Eastern Europe
    PL: 'eastern_europe', CZ: 'eastern_europe', SK: 'eastern_europe', HU: 'eastern_europe', RO: 'eastern_europe', BG: 'eastern_europe', UA: 'eastern_europe', BY: 'eastern_europe', MD: 'eastern_europe', RU: 'eastern_europe',
    // Northern Africa
    EG: 'northern_africa', LY: 'northern_africa', TN: 'northern_africa', DZ: 'northern_africa', MA: 'northern_africa', SD: 'northern_africa',
    // Western Africa
    NG: 'western_africa', GH: 'western_africa', CI: 'western_africa', SN: 'western_africa', ML: 'western_africa', BF: 'western_africa', NE: 'western_africa', GN: 'western_africa', BJ: 'western_africa', TG: 'western_africa', SL: 'western_africa', LR: 'western_africa', MR: 'western_africa', GM: 'western_africa', GW: 'western_africa', CV: 'western_africa',
    // Eastern Africa
    KE: 'eastern_africa', TZ: 'eastern_africa', UG: 'eastern_africa', RW: 'eastern_africa', BI: 'eastern_africa', ET: 'eastern_africa', ER: 'eastern_africa', DJ: 'eastern_africa', SO: 'eastern_africa', MG: 'eastern_africa', MU: 'eastern_africa', SC: 'eastern_africa', KM: 'eastern_africa', SS: 'eastern_africa',
    // Central Africa
    CD: 'central_africa', CG: 'central_africa', CM: 'central_africa', CF: 'central_africa', TD: 'central_africa', GA: 'central_africa', GQ: 'central_africa', ST: 'central_africa', AO: 'central_africa',
    // Southern Africa
    ZA: 'southern_africa', ZW: 'southern_africa', ZM: 'southern_africa', BW: 'southern_africa', NA: 'southern_africa', MW: 'southern_africa', MZ: 'southern_africa', SZ: 'southern_africa', LS: 'southern_africa',
};

/**
 * Get shard for a country code
 */
export function getShardForCountryCode(countryCode) {
    if (!countryCode) return SHARD_REGIONS.sea;
    const shardId = COUNTRY_TO_SHARD[countryCode.toUpperCase()] || 'sea';
    return SHARD_REGIONS[shardId];
}

/**
 * ShardBadge - Visual indicator of the user's data shard region
 * 
 * @param {object} props
 * @param {string} props.shardId - Shard ID from backend (sea, east_asia, etc.)
 * @param {string} props.region - Region from frontend countries.js
 * @param {string} props.countryCode - ISO country code (VN, US, etc.)
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} props.showLabel - Whether to show the label text
 */
export default function ShardBadge({
    shardId,
    region,
    countryCode,
    size = 'md',
    showLabel = true,
}) {
    const { isDark } = useTheme();

    // Determine shard from shardId, countryCode, or region (in priority order)
    let shard;
    if (shardId) {
        shard = getShardById(shardId);
    } else if (countryCode) {
        shard = getShardForCountryCode(countryCode);
    } else if (region) {
        shard = getShardForRegion(region);
    } else {
        shard = SHARD_REGIONS.sea;
    }

    // Size classes
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-2.5 py-1 gap-1.5',
        lg: 'text-base px-3 py-1.5 gap-2',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    // Color mapping with fallback
    const getColorClasses = (color) => {
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
            blue: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200',
            violet: isDark ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-100 text-violet-700 border-violet-200',
            orange: isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200',
            yellow: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200',
            amber: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200',
            cyan: isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border-cyan-200',
            indigo: isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
            purple: isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200',
            pink: isDark ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-pink-100 text-pink-700 border-pink-200',
            lime: isDark ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' : 'bg-lime-100 text-lime-700 border-lime-200',
            sky: isDark ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-sky-100 text-sky-700 border-sky-200',
            teal: isDark ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-teal-100 text-teal-700 border-teal-200',
            rose: isDark ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200',
            fuchsia: isDark ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' : 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
            green: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[color] || colors.emerald;
    };

    const tooltipText = `Your data is stored in the ${shard.displayName} shard region`;

    return (
        <div
            className={`
        inline-flex items-center rounded-full border font-medium
        transition-all duration-200 cursor-help
        ${sizeClasses[size]}
        ${getColorClasses(shard.color)}
      `}
            title={tooltipText}
        >
            <Database className={iconSizes[size]} />
            {showLabel && (
                <>
                    <span className="mr-0.5">{shard.emoji}</span>
                    <span>{shard.displayName}</span>
                </>
            )}
        </div>
    );
}

/**
 * ShardMigrationWarning - Warning when country change causes shard migration
 */
export function ShardMigrationWarning({ currentShardId, newShardId }) {
    const { isDark } = useTheme();

    const currentShard = getShardById(currentShardId);
    const newShard = getShardById(newShardId);

    // No warning if same shard
    if (currentShard.id === newShard.id) return null;

    return (
        <div className={`
      rounded-xl p-4 border mt-4
      ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}
    `}>
            <div className="flex items-start gap-3">
                <Cloud className={`w-5 h-5 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div>
                    <h4 className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        Shard Migration Required
                    </h4>
                    <p className={`text-sm mt-1 ${isDark ? 'text-amber-300/80' : 'text-amber-600'}`}>
                        Your data will migrate to a different region
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <ShardBadge shardId={currentShard.id} size="sm" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>→</span>
                        <ShardBadge shardId={newShard.id} size="sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ShardInfoCard - Detailed card showing shard information
 */
export function ShardInfoCard({ shardId }) {
    const { isDark } = useTheme();
    const shard = getShardById(shardId);

    return (
        <div className={`
      rounded-2xl p-4 border
      ${isDark
                ? 'bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-white/10'
                : 'bg-gradient-to-br from-violet-50 to-pink-50 border-gray-200'}
    `}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                    <Database className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{shard.emoji}</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {shard.displayName} Shard
                        </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        Your data is stored in this region
                    </p>
                </div>
            </div>
        </div>
    );
}
