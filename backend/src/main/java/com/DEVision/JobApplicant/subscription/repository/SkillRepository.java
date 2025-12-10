package com.DEVision.JobApplicant.subscription.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.DEVision.JobApplicant.subscription.entity.Skill;

public interface SkillRepository extends MongoRepository<Skill, String> {

    @Query(value = "{ 'name' : { $regex: ?0, $options: 'i' } }", exists = true)
    boolean existsByName(String name);
}

