package com.DEVision.JobApplicant.searchProfile.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.searchProfile.entity.Skill;

public interface SkillRepository extends MongoRepository<Skill, String> {
    boolean existsByNameIgnoreCase(String name);
}

