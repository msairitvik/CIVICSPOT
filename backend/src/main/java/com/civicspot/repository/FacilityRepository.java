package com.civicspot.repository;

import com.civicspot.model.Facility;
import com.civicspot.model.FacilityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findByCategory(FacilityCategory category);

    List<Facility> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrAreaContainingIgnoreCase(
            String name, String address, String area);

    List<Facility> findByIsAccessibleTrue();

    @Query("SELECT f FROM Facility f WHERE f.latitude BETWEEN :minLat AND :maxLat AND f.longitude BETWEEN :minLng AND :maxLng")
    List<Facility> findWithinBoundingBox(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng);

    @Query("SELECT f FROM Facility f WHERE f.category = :category AND f.latitude BETWEEN :minLat AND :maxLat AND f.longitude BETWEEN :minLng AND :maxLng")
    List<Facility> findByCategoryWithinBoundingBox(
            @Param("category") FacilityCategory category,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng);

    long countByCategory(FacilityCategory category);
}
