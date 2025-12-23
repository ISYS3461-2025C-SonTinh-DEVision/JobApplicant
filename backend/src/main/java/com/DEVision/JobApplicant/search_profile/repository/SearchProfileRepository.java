package com.DEVision.JobApplicant.search_profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.search_profile.entity.SearchProfile;

public interface SearchProfileRepository extends MongoRepository<SearchProfile, String> {

    List<SearchProfile> findByUserId(String userId);

    Optional<SearchProfile> findByIdAndUserId(String id, String userId);
}

