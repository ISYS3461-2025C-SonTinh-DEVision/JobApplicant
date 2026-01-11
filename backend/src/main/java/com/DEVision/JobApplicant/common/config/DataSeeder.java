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
import com.DEVision.JobApplicant.subscription.service.SubscriptionService;

/**
 * Database Data Seeder
 * Initializes required data according to project requirements:
 * - One ADMINISTRATOR
 * - Five APPLICANT accounts (2 Vietnam, 2 Singapore, 1 other; 2 Premium)
 * 
 * This runs on application startup and only seeds data if it doesn't already exist.
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

    @Autowired
    private SubscriptionService subscriptionService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== Starting Database Data Seeding ===");
        
        seedAdminAccount();
        seedApplicantAccounts();
        
        logger.info("=== Database Data Seeding Completed ===");
    }

    private void seedAdminAccount() {
        String adminEmail = "admin@devision.com";
        
        if (authRepository.findByEmail(adminEmail) != null) {
            logger.info("Admin account already exists: {}", adminEmail);
            return;
        }
        
        logger.info("Creating Administrator account...");
        
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(RoleConfig.ADMIN.getRoleName());
        admin.setEnabled(true);
        admin.setActivated(true);
        admin.setPlanType(PlanType.PREMIUM);
        
        User savedAdmin = authRepository.save(admin);
        
        // Create subscription for admin
        subscriptionService.createSubscription(
            savedAdmin.getId(), 
            com.DEVision.JobApplicant.subscription.enums.PlanType.PREMIUM
        );
        
        logger.info("Admin account created: {}", adminEmail);
    }

    private void seedApplicantAccounts() {
        logger.info("Checking and creating Applicant accounts...");

        int created = 0;
        int skipped = 0;

        if (createApplicantIfNotExists(
            "nguyen.an@gmail.com", "Applicant@123", PlanType.PREMIUM,
            "Nguyen", "Van An", Country.VIETNAM, "+84901234567",
            "123 Le Loi Street", "Ho Chi Minh City",
            Arrays.asList("React", "Spring Boot", "Docker", "TypeScript", "PostgreSQL"),
            "Bachelor of Software Engineering (Hons) at RMIT Vietnam",
            "Experienced Full Stack Developer seeking challenging opportunities in software engineering."
        )) {
            created++;
        } else {
            skipped++;
        }

        if (createApplicantIfNotExists(
            "tran.bich@gmail.com", "Applicant@123", PlanType.FREEMIUM,
            "Tran", "Thi Bich", Country.VIETNAM, "+84912345678",
            "456 Nguyen Hue Boulevard", "Ha Noi",
            Arrays.asList("Java", "Spring Boot", "MySQL", "Redis"),
            "Bachelor of Computer Science at Vietnam National University",
            "Backend Developer with 3 years experience in enterprise applications."
        )) {
            created++;
        } else {
            skipped++;
        }

        if (createApplicantIfNotExists(
            "lee.weiming@gmail.com", "Applicant@123", PlanType.PREMIUM,
            "Lee", "Wei Ming", Country.SINGAPORE, "+6581234567",
            "78 Robinson Road", "Singapore",
            Arrays.asList("Python", "AWS", "Snowflake", "Spark", "Kafka"),
            "Master of Data Science at National University of Singapore",
            "Senior Data Engineer specializing in cloud data platforms and ETL pipelines."
        )) {
            created++;
        } else {
            skipped++;
        }

        if (createApplicantIfNotExists(
            "tan.meilin@outlook.com", "Applicant@123", PlanType.FREEMIUM,
            "Tan", "Mei Lin", Country.SINGAPORE, "+6591234567",
            "25 Marina Boulevard", "Singapore",
            Arrays.asList("React", "Vue.js", "CSS", "Tailwind CSS", "JavaScript"),
            "Bachelor of Information Systems at Singapore Management University",
            "UI/UX focused Frontend Developer passionate about creating beautiful interfaces."
        )) {
            created++;
        } else {
            skipped++;
        }

        if (createApplicantIfNotExists(
            "james.smith@gmail.com", "Applicant@123", PlanType.FREEMIUM,
            "James", "Smith", Country.AUSTRALIA, "+61412345678",
            "100 Collins Street", "Melbourne",
            Arrays.asList("Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"),
            "Bachelor of Computer Science at University of Melbourne",
            "DevOps Engineer with expertise in cloud infrastructure and automation."
        )) {
            created++;
        } else {
            skipped++;
        }

        logger.info("Applicant accounts: {} created, {} already existed", created, skipped);
    }

    private boolean createApplicantIfNotExists(
        String email, String password, PlanType planType,
        String firstName, String lastName, Country country, String phone,
        String address, String city, List<String> skills,
        String education, String objectiveSummary
    ) {
        User existingUser = authRepository.findByEmail(email);
        User savedUser;
        
        if (existingUser != null) {
            // User exists - check if Applicant profile also exists
            Applicant existingApplicant = applicantRepository.findByUserId(existingUser.getId());
            if (existingApplicant != null) {
                logger.debug("User and Applicant already exist: {}", email);
                return false;
            }
            // User exists but Applicant doesn't - create missing Applicant
            logger.info("User exists but Applicant missing, creating: {}", email);
            savedUser = existingUser;
        } else {
            // Create new User
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(RoleConfig.APPLICANT.getRoleName());
            user.setEnabled(true);
            user.setActivated(true);
            user.setPlanType(planType);
            user.setCountry(country);
            savedUser = authRepository.save(user);
        }

        // Create subscription (idempotent - won't duplicate if exists)
        com.DEVision.JobApplicant.subscription.enums.PlanType subscriptionPlanType = 
            com.DEVision.JobApplicant.subscription.enums.PlanType.valueOf(planType.name());
        subscriptionService.createSubscription(savedUser.getId(), subscriptionPlanType);

        // Create Applicant profile
        Applicant applicant = new Applicant(savedUser.getId());
        applicant.setFirstName(firstName);
        applicant.setLastName(lastName);
        applicant.setPhoneNumber(phone);
        applicant.setAddress(address);
        applicant.setCity(city);
        applicant.setSkills(skills);
        applicant.setObjectiveSummary(objectiveSummary);
        
        Education edu = new Education();
        edu.setDegree(education.split(" at ")[0]);
        edu.setInstitution(education.contains(" at ") ? education.split(" at ")[1] : "");
        edu.setStartDate(java.time.LocalDate.of(2018, 1, 1));
        edu.setEndDate(java.time.LocalDate.of(2022, 6, 30));
        applicant.setEducation(Arrays.asList(edu));
        
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
        return true;
    }
}
