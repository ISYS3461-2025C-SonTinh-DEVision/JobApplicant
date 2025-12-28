package com.DEVision.JobApplicant.applicant.external.service;

import com.DEVision.JobApplicant.applicant.external.dto.ApplicantProfileEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka producer service for applicant profile events
 * Publishes profile updates to the applicant-profile-events topic
 */
@Service
public class ApplicantProfileEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(ApplicantProfileEventProducer.class);
    private static final String TOPIC = "applicant-profile-events";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Send applicant profile event to Kafka topic
     * 
     * @param event The applicant profile event to send
     */
    public void sendProfileEvent(ApplicantProfileEvent event) {
        try {
            String key = event.getUserId() != null ? event.getUserId() : event.getId();
            
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(TOPIC, key, event);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("Successfully sent applicant profile event to topic {} for user {}: {}", 
                            TOPIC, key, event.getEventType());
                } else {
                    logger.error("Failed to send applicant profile event to topic {} for user {}: {}", 
                            TOPIC, key, ex.getMessage(), ex);
                }
            });
        } catch (Exception e) {
            logger.error("Error sending applicant profile event to Kafka: {}", e.getMessage(), e);
        }
    }
}

