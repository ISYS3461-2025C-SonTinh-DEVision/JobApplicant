package com.DEVision.JobApplicant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JobApplicantApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobApplicantApplication.class, args);
	}

}
