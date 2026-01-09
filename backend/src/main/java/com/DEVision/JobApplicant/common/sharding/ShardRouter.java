package com.DEVision.JobApplicant.common.sharding;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.sharding.ShardingConfig.ShardRegion;

/**
 * Shard Router Service
 * Handles routing decisions and shard migrations for 19-region sharding architecture.
 * 
 * Responsibilities:
 * - Determine correct shard for user based on country
 * - Detect when shard migration is needed
 * - Log shard operations for monitoring
 * - Provide shard info for API responses
 */
@Service
public class ShardRouter {

    private static final Logger logger = LoggerFactory.getLogger(ShardRouter.class);

    /**
     * Get shard for a Country enum
     */
    public ShardRegion routeToShard(Country country) {
        ShardRegion shard = ShardingConfig.getShardForCountry(country);
        logger.debug("Routing country {} to shard {}", country, shard.getShardId());
        return shard;
    }

    /**
     * Get shard for a country code string
     */
    public ShardRegion routeToShard(String countryCode) {
        ShardRegion shard = ShardingConfig.getShardForCountryCode(countryCode);
        logger.debug("Routing country code {} to shard {}", countryCode, shard.getShardId());
        return shard;
    }

    /**
     * Get shard ID string from Country enum
     */
    public String getShardId(Country country) {
        return ShardingConfig.getShardId(country);
    }

    /**
     * Get shard ID string from country code
     */
    public String getShardId(String countryCode) {
        return ShardingConfig.getShardId(countryCode);
    }

    /**
     * Check if country change requires shard migration
     */
    public boolean requiresMigration(String oldCountryCode, String newCountryCode) {
        boolean needsMigration = ShardingConfig.needsMigration(oldCountryCode, newCountryCode);
        
        if (needsMigration) {
            ShardRegion oldShard = ShardingConfig.getShardForCountryCode(oldCountryCode);
            ShardRegion newShard = ShardingConfig.getShardForCountryCode(newCountryCode);
            
            logger.info("SHARD_MIGRATION_REQUIRED: {} ({}) -> {} ({})",
                oldCountryCode, oldShard.getShardId(),
                newCountryCode, newShard.getShardId()
            );
        }
        
        return needsMigration;
    }

    /**
     * Perform shard migration for a user
     * In logical sharding, this updates the shardId field
     * 
     * @param userId User's ID
     * @param oldCountryCode Previous country code
     * @param newCountryCode New country code
     * @return New shard ID
     */
    public String migrateUser(String userId, String oldCountryCode, String newCountryCode) {
        ShardRegion oldShard = ShardingConfig.getShardForCountryCode(oldCountryCode);
        ShardRegion newShard = ShardingConfig.getShardForCountryCode(newCountryCode);
        
        logger.info("SHARD_MIGRATION: User {} migrating from {} ({}) to {} ({})",
            userId,
            oldShard.getDisplayName(), oldShard.getShardId(),
            newShard.getDisplayName(), newShard.getShardId()
        );
        
        return newShard.getShardId();
    }

    /**
     * Get default search shard (Southeast Asia per 4.3.1)
     */
    public ShardRegion getDefaultSearchShard() {
        return ShardingConfig.getDefaultSearchShard();
    }

    /**
     * Route a search query to appropriate shard
     */
    public ShardRegion routeSearchQuery(String countryCode) {
        if (countryCode == null || countryCode.isEmpty()) {
            ShardRegion defaultShard = getDefaultSearchShard();
            logger.debug("No country specified, routing to default shard: {}", defaultShard.getShardId());
            return defaultShard;
        }
        return routeToShard(countryCode);
    }

    /**
     * Get shard info DTO for API response
     */
    public ShardInfo getShardInfo(String countryCode) {
        ShardRegion shard = ShardingConfig.getShardForCountryCode(countryCode);
        return new ShardInfo(
            shard.getShardId(),
            shard.getCode(),
            shard.getDisplayName(),
            shard.getEmoji()
        );
    }

    /**
     * DTO for shard information in API responses
     */
    public static class ShardInfo {
        private String shardId;
        private String code;
        private String displayName;
        private String emoji;

        public ShardInfo(String shardId, String code, String displayName, String emoji) {
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
}
