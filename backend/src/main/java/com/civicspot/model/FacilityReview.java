package com.civicspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "facility_reviews", indexes = {
    @Index(name = "idx_reviews_facility", columnList = "facility_id"),
    @Index(name = "idx_reviews_user", columnList = "user_id")
})
public class FacilityReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int rating; // 1 to 5

    @Column(length = 50)
    private String cleanlinessLevel; // SPOTLESS, CLEAN, ACCEPTABLE, NEEDS_CLEANING, POOR

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(length = 500)
    private String evidencePhotoUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public FacilityReview() {}

    public FacilityReview(Facility facility, User user, int rating, String cleanlinessLevel, String comment, String evidencePhotoUrl) {
        this.facility = facility;
        this.user = user;
        this.rating = rating;
        this.cleanlinessLevel = cleanlinessLevel;
        this.comment = comment;
        this.evidencePhotoUrl = evidencePhotoUrl;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getCleanlinessLevel() { return cleanlinessLevel; }
    public void setCleanlinessLevel(String cleanlinessLevel) { this.cleanlinessLevel = cleanlinessLevel; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getEvidencePhotoUrl() { return evidencePhotoUrl; }
    public void setEvidencePhotoUrl(String evidencePhotoUrl) { this.evidencePhotoUrl = evidencePhotoUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
