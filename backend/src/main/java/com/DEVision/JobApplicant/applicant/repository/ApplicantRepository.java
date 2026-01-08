package com.DEVision.JobApplicant.applicant.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.common.country.model.Country;

@Repository
public interface ApplicantRepository extends MongoRepository<Applicant, String> {
    Applicant findByUserId(String userId);
    
    // Find by country
    Page<Applicant> findByCountry(Country country, Pageable pageable);
    
    // Find by skill (case-insensitive)
    @Query("{ 'skills': { $regex: ?0, $options: 'i' } }")
    Page<Applicant> findBySkillsContainingIgnoreCase(String skill, Pageable pageable);
    
    // Find by country and skill
    @Query("{ 'country': ?0, 'skills': { $regex: ?1, $options: 'i' } }")
    Page<Applicant> findByCountryAndSkillsContainingIgnoreCase(Country country, String skill, Pageable pageable);
    
    // Search by name or city (case-insensitive)
    @Query("{ $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeyword(String keyword, Pageable pageable);
    
    // Search with country filter
    @Query("{ 'country': ?1, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndCountry(String keyword, Country country, Pageable pageable);
    
    // Search with skill filter
    @Query("{ 'skills': { $regex: ?1, $options: 'i' }, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndSkill(String keyword, String skill, Pageable pageable);
    
    // Search with both country and skill filter
    @Query("{ 'country': ?1, 'skills': { $regex: ?2, $options: 'i' }, $or: [ " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'city': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Applicant> searchByKeywordAndCountryAndSkill(String keyword, Country country, String skill, Pageable pageable);
}

