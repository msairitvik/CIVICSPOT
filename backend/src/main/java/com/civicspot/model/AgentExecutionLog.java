package com.civicspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "agent_execution_logs", indexes = {
    @Index(name = "idx_agent_logs_agent", columnList = "agentName"),
    @Index(name = "idx_agent_logs_session", columnList = "sessionId")
})
public class AgentExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64)
    private String sessionId;

    @Column(nullable = false, length = 60)
    private String agentName; // Master Orchestrator, Facility Discovery Agent, General Research Agent, etc.

    @Column(length = 255)
    private String query;

    @Column(length = 100)
    private String step;

    private Long executionTimeMs = 0L;

    @Column(length = 30)
    private String status = "SUCCESS"; // SUCCESS, FAILED, SKIPPED

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    public AgentExecutionLog() {}

    public AgentExecutionLog(String sessionId, String agentName, String query, String step, Long executionTimeMs, String status, String details) {
        this.sessionId = sessionId;
        this.agentName = agentName;
        this.query = query;
        this.step = step;
        this.executionTimeMs = executionTimeMs;
        this.status = status;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
