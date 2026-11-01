package com.civicspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_facilities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "facility_id"})
})
public class SavedFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false, updatable = false)
    private Instant savedAt = Instant.now();

    public SavedFacility() {}

    public SavedFacility(User user, Facility facility) {
        this.user = user;
        this.facility = facility;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public Instant getSavedAt() { return savedAt; }
    public void setSavedAt(Instant savedAt) { this.savedAt = savedAt; }
}
