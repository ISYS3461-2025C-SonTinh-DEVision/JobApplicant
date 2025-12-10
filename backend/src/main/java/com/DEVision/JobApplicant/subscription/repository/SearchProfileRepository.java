package com.DEVision.JobApplicant.subscription.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.subscription.entity.SearchProfile;

public interface SearchProfileRepository extends MongoRepository<SearchProfile, String> {

    List<SearchProfile> findByUserId(String userId);

    Optional<SearchProfile> findByIdAndUserId(String id, String userId);
}

