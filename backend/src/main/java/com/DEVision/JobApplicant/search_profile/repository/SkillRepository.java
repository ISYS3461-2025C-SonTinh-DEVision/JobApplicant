package com.DEVision.JobApplicant.search_profile.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.search_profile.entity.Skill;

public interface SkillRepository extends MongoRepository<Skill, String> {
    boolean existsByNameIgnoreCase(String name);
}

