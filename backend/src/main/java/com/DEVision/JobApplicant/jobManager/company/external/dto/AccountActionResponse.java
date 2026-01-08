package com.DEVision.JobApplicant.jobManager.company.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.Map;

/**
 * Response DTO for account activation/deactivation
 *
 * NOTE: Actual response structure is not yet confirmed by JM team.
 * Using a flexible structure with Map for unknown fields.
 *
 * TODO: Update this DTO when JM team provides the actual response spec
 */
public class AccountActionResponse implements Serializable {

    private Boolean success;
    private String message;

    @JsonProperty("statusCode")
    private Integer statusCode;

    // Flexible field for any additional data JM might return
    private Map<String, Object> data;

    public AccountActionResponse() {
    }

    // Getters and Setters
    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
