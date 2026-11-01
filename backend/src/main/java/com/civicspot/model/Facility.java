package com.civicspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "facilities", indexes = {
    @Index(name = "idx_facilities_lat_lng", columnList = "latitude, longitude"),
    @Index(name = "idx_facilities_category", columnList = "category")
})
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private FacilityCategory category;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String area;

    private boolean isAccessible = false;
    private boolean hasRamp = false;
    private boolean isFree = true;

    @Column(length = 50)
    private String fee;

    @Column(length = 100)
    private String openingHours = "24/7";

    @Column(length = 30)
    private String operationalStatus = "OPERATIONAL"; // OPERATIONAL, MAINTENANCE, CLOSED

    private Double cleanlinessRating = 4.2;
    private Integer totalReviews = 1;

    @Column(length = 50)
    private String osmId;

    private boolean verified = true;

    @Column(length = 50)
    private String source = "CIVICSPOT_VERIFIED"; // OPENSTREETMAP, CITIZEN_VERIFIED, CIVICSPOT_VERIFIED

    @Column(columnDefinition = "TEXT")
    private String additionalDetails;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Facility() {}

    public Facility(String name, FacilityCategory category, Double latitude, Double longitude, String address, String area) {
        this.name = name;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.area = area;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public FacilityCategory getCategory() { return category; }
    public void setCategory(FacilityCategory category) { this.category = category; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public boolean isAccessible() { return isAccessible; }
    public void setAccessible(boolean accessible) { isAccessible = accessible; }

    public boolean isHasRamp() { return hasRamp; }
    public void setHasRamp(boolean hasRamp) { this.hasRamp = hasRamp; }

    public boolean isFree() { return isFree; }
    public void setFree(boolean free) { isFree = free; }

    public String getFee() { return fee; }
    public void setFee(String fee) { this.fee = fee; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getOperationalStatus() { return operationalStatus; }
    public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }

    public Double getCleanlinessRating() { return cleanlinessRating; }
    public void setCleanlinessRating(Double cleanlinessRating) { this.cleanlinessRating = cleanlinessRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public String getOsmId() { return osmId; }
    public void setOsmId(String osmId) { this.osmId = osmId; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getAdditionalDetails() { return additionalDetails; }
    public void setAdditionalDetails(String additionalDetails) { this.additionalDetails = additionalDetails; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
