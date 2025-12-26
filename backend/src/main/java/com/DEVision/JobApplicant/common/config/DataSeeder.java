package com.DEVision.JobApplicant.common.config;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.Education;
import com.DEVision.JobApplicant.applicant.entity.WorkExperience;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;

/**
 * Database Data Seeder
 * Initializes required data according to project requirements:
 * - One ADMINISTRATOR
 * - Five APPLICANT accounts (2 Vietnam, 2 Singapore, 1 other; 2 Premium)
 * 
 * This runs on application startup and clears existing data if needed.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== Starting Database Data Seeding ===");
        
        // Clear existing data
        logger.info("Clearing existing data...");
        applicantRepository.deleteAll();
        authRepository.deleteAll();
        
        // Seed Admin account
        seedAdminAccount();
        
        // Seed Applicant accounts
        seedApplicantAccounts();
        
        logger.info("=== Database Data Seeding Completed ===");
    }

    /**
     * Create Administrator account
     * Email: admin@devision.com
     * Password: Admin@123
     */
    private void seedAdminAccount() {
        logger.info("Creating Administrator account...");
        
        User admin = new User();
        admin.setEmail("admin@devision.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(RoleConfig.ADMIN.getRoleName());
        admin.setEnabled(true);
        admin.setActivated(true);
        admin.setPlanType(PlanType.PREMIUM);
        
        authRepository.save(admin);
        logger.info("Admin account created: admin@devision.com");
    }

    /**
     * Create 5 Applicant accounts:
     * - 2 from Vietnam (1 Premium)
     * - 2 from Singapore (1 Premium)
     * - 1 from another nation (Australia)
     */
    private void seedApplicantAccounts() {
        logger.info("Creating Applicant accounts...");

        // Applicant 1: Vietnam, Premium - Software Engineer (React, Spring Boot, Docker)
        createApplicant(
            "nguyen.an@gmail.com", "Applicant@123", PlanType.PREMIUM,
            "Nguyen", "Van An", Country.VIETNAM, "+84901234567",
            "123 Le Loi Street", "Ho Chi Minh City",
            Arrays.asList("React", "Spring Boot", "Docker", "TypeScript", "PostgreSQL"),
            "Bachelor of Software Engineering (Hons) at RMIT Vietnam",
            "Experienced Full Stack Developer seeking challenging opportunities in software engineering."
        );

        // Applicant 2: Vietnam, Freemium - Backend Developer
        createApplicant(
            "tran.bich@gmail.com", "Applicant@123", PlanType.FREEMIUM,
            "Tran", "Thi Bich", Country.VIETNAM, "+84912345678",
            "456 Nguyen Hue Boulevard", "Ha Noi",
            Arrays.asList("Java", "Spring Boot", "MySQL", "Redis"),
            "Bachelor of Computer Science at Vietnam National University",
            "Backend Developer with 3 years experience in enterprise applications."
        );

        // Applicant 3: Singapore, Premium - Data Engineer (Python, AWS, Snowflake)
        createApplicant(
            "lee.weiming@gmail.com", "Applicant@123", PlanType.PREMIUM,
            "Lee", "Wei Ming", Country.SINGAPORE, "+6581234567",
            "78 Robinson Road", "Singapore",
            Arrays.asList("Python", "AWS", "Snowflake", "Spark", "Kafka"),
            "Master of Data Science at National University of Singapore",
            "Senior Data Engineer specializing in cloud data platforms and ETL pipelines."
        );

        // Applicant 4: Singapore, Freemium - Frontend Developer
        createApplicant(
            "tan.meilin@outlook.com", "Applicant@123", PlanType.FREEMIUM,
            "Tan", "Mei Lin", Country.SINGAPORE, "+6591234567",
            "25 Marina Boulevard", "Singapore",
            Arrays.asList("React", "Vue.js", "CSS", "Tailwind CSS", "JavaScript"),
            "Bachelor of Information Systems at Singapore Management University",
            "UI/UX focused Frontend Developer passionate about creating beautiful interfaces."
        );

        // Applicant 5: Australia (other nation), Freemium - DevOps Engineer
        createApplicant(
            "james.smith@gmail.com", "Applicant@123", PlanType.FREEMIUM,
            "James", "Smith", Country.AUSTRALIA, "+61412345678",
            "100 Collins Street", "Melbourne",
            Arrays.asList("Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"),
            "Bachelor of Computer Science at University of Melbourne",
            "DevOps Engineer with expertise in cloud infrastructure and automation."
        );

        logger.info("5 Applicant accounts created successfully");
    }

    private void createApplicant(
        String email, String password, PlanType planType,
        String firstName, String lastName, Country country, String phone,
        String address, String city, List<String> skills,
        String education, String objectiveSummary
    ) {
        // Create User account
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(RoleConfig.APPLICANT.getRoleName());
        user.setEnabled(true);
        user.setActivated(true);
        user.setPlanType(planType);
        User savedUser = authRepository.save(user);

        // Create Applicant profile
        Applicant applicant = new Applicant(savedUser.getId(), country);
        applicant.setFirstName(firstName);
        applicant.setLastName(lastName);
        applicant.setPhoneNumber(phone);
        applicant.setAddress(address);
        applicant.setCity(city);
        applicant.setSkills(skills);
        applicant.setObjectiveSummary(objectiveSummary);
        
        // Add education
        Education edu = new Education();
        edu.setDegree(education.split(" at ")[0]);
        edu.setInstitution(education.contains(" at ") ? education.split(" at ")[1] : "");
        edu.setStartDate(java.time.LocalDate.of(2018, 1, 1));
        edu.setEndDate(java.time.LocalDate.of(2022, 6, 30));
        applicant.setEducation(Arrays.asList(edu));
        
        // Add work experience
        WorkExperience work = new WorkExperience();
        work.setPosition("Software Developer");
        work.setCompany("Tech Company");
        work.setStartDate(java.time.LocalDate.of(2022, 1, 1));
        work.setCurrent(true);
        work.setDescription("Developed and maintained software applications.");
        applicant.setWorkExperience(Arrays.asList(work));

        applicant.setCreatedAt(LocalDateTime.now().minusDays((int)(Math.random() * 30)));
        applicant.setUpdatedAt(LocalDateTime.now());
        
        applicantRepository.save(applicant);
        logger.info("Created applicant: {} {} ({}) - {}", firstName, lastName, country.getDisplayName(), planType);
    }
}
