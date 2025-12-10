package com.DEVision.JobApplicant.subscription.service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.DEVision.JobApplicant.subscription.dto.CreateSkillRequest;
import com.DEVision.JobApplicant.subscription.dto.SkillDto;
import com.DEVision.JobApplicant.subscription.entity.Skill;
import com.DEVision.JobApplicant.subscription.exception.ResourceNotFoundException;
import com.DEVision.JobApplicant.subscription.exception.ValidationException;
import com.DEVision.JobApplicant.subscription.repository.SkillRepository;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public SkillDto createSkill(CreateSkillRequest request) {
        String normalizedName = normalize(request.name());
        if (skillRepository.existsByName(toExactMatchRegex(normalizedName))) {
            throw new ValidationException("Skill with name '%s' already exists".formatted(normalizedName));
        }

        Skill skill = new Skill();
        skill.setName(normalizedName);
        skill.setCategory(normalize(request.category()));

        Skill savedSkill = skillRepository.save(skill);
        return toDto(savedSkill);
    }

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void deleteSkill(String id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
        skillRepository.delete(skill);
    }

    private SkillDto toDto(Skill skill) {
        return new SkillDto(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getCreatedAt()
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

