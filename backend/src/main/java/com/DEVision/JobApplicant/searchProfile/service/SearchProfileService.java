package com.DEVision.JobApplicant.searchProfile.service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.DEVision.JobApplicant.searchProfile.dto.SearchProfileDto;
import com.DEVision.JobApplicant.searchProfile.dto.SearchProfileRequest;
import com.DEVision.JobApplicant.searchProfile.entity.SearchProfile;
import com.DEVision.JobApplicant.searchProfile.exception.ResourceNotFoundException;
import com.DEVision.JobApplicant.searchProfile.exception.ValidationException;
import com.DEVision.JobApplicant.searchProfile.repository.SearchProfileRepository;
import com.DEVision.JobApplicant.searchProfile.repository.SkillRepository;

@Service
@RequiredArgsConstructor
public class SearchProfileService {

    private final SearchProfileRepository searchProfileRepository;
    private final SkillRepository skillRepository;

    public SearchProfileDto createSearchProfile(String userId, SearchProfileRequest request) {
        List<String> desiredSkills = sanitizeStrings(request.desiredSkills());
        // Skip skill validation - allow free-form skill input from users
        // validateSkills(desiredSkills);
        validateSalaryRange(request);

        SearchProfile profile = new SearchProfile();
        profile.setUserId(userId);
        applyRequest(profile, request, desiredSkills);

        SearchProfile savedProfile = searchProfileRepository.save(profile);
        return toDto(savedProfile);
    }

    public List<SearchProfileDto> getSearchProfilesByUserId(String userId) {
        return searchProfileRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SearchProfileDto updateSearchProfile(String id, String userId, SearchProfileRequest request) {
        SearchProfile existingProfile = searchProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Search profile not found for id: " + id));

        List<String> desiredSkills = sanitizeStrings(request.desiredSkills());
        // Skip skill validation - allow free-form skill input from users
        // validateSkills(desiredSkills);
        validateSalaryRange(request);

        applyRequest(existingProfile, request, desiredSkills);
        SearchProfile updatedProfile = searchProfileRepository.save(existingProfile);
        return toDto(updatedProfile);
    }

    public void deleteSearchProfile(String id, String userId) {
        SearchProfile existingProfile = searchProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Search profile not found for id: " + id));
        searchProfileRepository.delete(existingProfile);
    }

    private void validateSkills(List<String> skillNames) {
        for (String skillName : skillNames) {
            boolean exists = skillRepository.existsByNameIgnoreCase(skillName);
            if (!exists) {
                throw new ValidationException("Skill does not exist: " + skillName);
            }
        }
    }

    private void validateSalaryRange(SearchProfileRequest request) {
        if (request.maxSalary() != null && request.maxSalary().compareTo(request.minSalary()) < 0) {
            throw new ValidationException("maxSalary must be greater than or equal to minSalary");
        }
    }

    private void applyRequest(SearchProfile profile, SearchProfileRequest request, List<String> desiredSkills) {
        profile.setProfileName(normalize(request.profileName()));
        profile.setDesiredSkills(List.copyOf(desiredSkills));
        profile.setEmploymentTypes(List.copyOf(request.employmentTypes()));
        profile.setJobTitles(List.copyOf(sanitizeStrings(request.jobTitles())));
        profile.setDesiredCountry(normalize(request.desiredCountry()));
        profile.setMinSalary(request.minSalary());
        profile.setMaxSalary(request.maxSalary());
    }

    private List<String> sanitizeStrings(List<String> source) {
        return source.stream()
                .map(this::normalize)
                .collect(Collectors.toList());
    }

    private SearchProfileDto toDto(SearchProfile profile) {
        return new SearchProfileDto(
                profile.getId(),
                profile.getUserId(),
                profile.getProfileName(),
                profile.getDesiredSkills(),
                profile.getEmploymentTypes(),
                profile.getJobTitles(),
                profile.getDesiredCountry(),
                profile.getMinSalary(),
                profile.getMaxSalary(),
                profile.getCreatedAt()
        );
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String toExactMatchRegex(String value) {
        String safeValue = StringUtils.hasText(value) ? value : "";
        return "^" + Pattern.quote(safeValue) + "$";
    }
}
