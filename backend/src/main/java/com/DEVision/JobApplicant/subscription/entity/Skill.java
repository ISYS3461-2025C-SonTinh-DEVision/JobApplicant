package com.DEVision.JobApplicant.subscription.entity;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Setter
@Getter
@Document(collection = "skills")
public class Skill {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String category;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    public Skill() {
    }

    public Skill(String name, String category) {
        this.name = name;
        this.category = category;
    }

}

