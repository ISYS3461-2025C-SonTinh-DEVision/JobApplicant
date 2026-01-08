package com.DEVision.JobApplicant.applicant.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.applicant.entity.Applicant;

import java.util.List;

@Repository
public interface ApplicantRepository extends MongoRepository<Applicant, String> {
    Applicant findByUserId(String userId);
    
    @Query("{ 'userId': { $in: ?0 } }")
    Page<Applicant> findByUserIdIn(List<String> userIds, Pageable pageable);
    
    @Query("{ 'skills': { $regex: ?0, $options: 'i' } }")
    Page<Applicant> findBySkillsContainingIgnoreCase(String skill, Pageable pageable);
    
    @Query("{ 'userId': { $in: ?0 }, 'skills': { $regex: ?1, $options: 'i' } }")
    Page<Applicant> findByUserIdInAndSkillsContainingIgnoreCase(List<String> userIds, String skill, Pageable pageable);
    
    @Query("{ $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeyword(String keyword, Pageable pageable);
    
    @Query("{ 'userId': { $in: ?1 }, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndUserIdIn(String keyword, List<String> userIds, Pageable pageable);
    
    @Query("{ 'skills': { $regex: ?1, $options: 'i' }, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndSkill(String keyword, String skill, Pageable pageable);
    
    @Query("{ 'userId': { $in: ?1 }, 'skills': { $regex: ?2, $options: 'i' }, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndUserIdInAndSkill(String keyword, List<String> userIds, String skill, Pageable pageable);
}

