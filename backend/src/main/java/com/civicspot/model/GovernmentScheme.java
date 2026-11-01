package com.civicspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "government_schemes", indexes = {
    @Index(name = "idx_scheme_category", columnList = "category"),
    @Index(name = "idx_scheme_name", columnList = "schemeName")
})
public class GovernmentScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String schemeName;

    @Column(nullable = false, length = 150)
    private String ministry;

    @Column(nullable = false, length = 60)
    private String category; // Sanitation, Water Supply, Healthcare, Urban Infrastructure, Disability Welfare, Housing

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String documentsRequired;

    @Column(columnDefinition = "TEXT")
    private String applicationProcedure;

    @Column(length = 255)
    private String officialUrl;

    @Column(length = 50)
    private String lastVerifiedDate;

    @Column(length = 100)
    private String source = "myscheme.gov.in / india.gov.in";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public GovernmentScheme() {}

    public GovernmentScheme(String schemeName, String ministry, String category, String description,
                            String eligibilityCriteria, String benefits, String documentsRequired,
                            String applicationProcedure, String officialUrl, String lastVerifiedDate, String source) {
        this.schemeName = schemeName;
        this.ministry = ministry;
        this.category = category;
        this.description = description;
        this.eligibilityCriteria = eligibilityCriteria;
        this.benefits = benefits;
        this.documentsRequired = documentsRequired;
        this.applicationProcedure = applicationProcedure;
        this.officialUrl = officialUrl;
        this.lastVerifiedDate = lastVerifiedDate;
        this.source = source;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }

    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }

    public String getDocumentsRequired() { return documentsRequired; }
    public void setDocumentsRequired(String documentsRequired) { this.documentsRequired = documentsRequired; }

    public String getApplicationProcedure() { return applicationProcedure; }
    public void setApplicationProcedure(String applicationProcedure) { this.applicationProcedure = applicationProcedure; }

    public String getOfficialUrl() { return officialUrl; }
    public void setOfficialUrl(String officialUrl) { this.officialUrl = officialUrl; }

    public String getLastVerifiedDate() { return lastVerifiedDate; }
    public void setLastVerifiedDate(String lastVerifiedDate) { this.lastVerifiedDate = lastVerifiedDate; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
