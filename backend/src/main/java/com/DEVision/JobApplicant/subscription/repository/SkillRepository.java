package com.DEVision.JobApplicant.subscription.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.subscription.entity.Skill;

public interface SkillRepository extends MongoRepository<Skill, String> {
    boolean existsByNameIgnoreCase(String name);
}

