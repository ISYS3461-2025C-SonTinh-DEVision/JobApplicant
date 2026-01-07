package com.DEVision.JobApplicant.jobManager.company.external.dto;

import java.io.Serializable;

/**
 * Request DTO for account activation/deactivation
 *
 * NOTE: Actual request structure is not yet confirmed by JM team.
 * This is a minimal implementation that can be expanded when specs are available.
 *
 * TODO: Update this DTO when JM team provides the actual request/response spec
 */
public class AccountActionRequest implements Serializable {

    private String accountId;
    private String reason;  // Optional reason for deactivation

    public AccountActionRequest() {
    }

    public AccountActionRequest(String accountId) {
        this.accountId = accountId;
    }

    public AccountActionRequest(String accountId, String reason) {
        this.accountId = accountId;
        this.reason = reason;
    }

    // Getters and Setters
    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
