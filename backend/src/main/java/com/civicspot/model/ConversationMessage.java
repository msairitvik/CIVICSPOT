package com.civicspot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "conversation_messages")
public class ConversationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private ConversationSession session;

    @Column(nullable = false, length = 20)
    private String sender; // USER, ASSISTANT, TOOL, SYSTEM

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 50)
    private String routingCategory; // GENERAL_QUESTION, FACILITY_DISCOVERY, etc.

    @Column(columnDefinition = "TEXT")
    private String citationsJson;

    @Column(columnDefinition = "TEXT")
    private String functionCallsJson;

    @Column(columnDefinition = "TEXT")
    private String agentLogsJson;

    @Column(columnDefinition = "TEXT")
    private String facilityCardsJson;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ConversationMessage() {}

    public ConversationMessage(ConversationSession session, String sender, String content) {
        this.session = session;
        this.sender = sender;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConversationSession getSession() { return session; }
    public void setSession(ConversationSession session) { this.session = session; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getRoutingCategory() { return routingCategory; }
    public void setRoutingCategory(String routingCategory) { this.routingCategory = routingCategory; }

    public String getCitationsJson() { return citationsJson; }
    public void setCitationsJson(String citationsJson) { this.citationsJson = citationsJson; }

    public String getFunctionCallsJson() { return functionCallsJson; }
    public void setFunctionCallsJson(String functionCallsJson) { this.functionCallsJson = functionCallsJson; }

    public String getAgentLogsJson() { return agentLogsJson; }
    public void setAgentLogsJson(String agentLogsJson) { this.agentLogsJson = agentLogsJson; }

    public String getFacilityCardsJson() { return facilityCardsJson; }
    public void setFacilityCardsJson(String facilityCardsJson) { this.facilityCardsJson = facilityCardsJson; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
