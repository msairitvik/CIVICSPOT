package com.civicspot;

import com.civicspot.model.FacilityCategory;
import com.civicspot.service.FacilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
class FacilityServiceTest {

    @Autowired
    private FacilityService facilityService;

    @Test
    void testHaversineDistanceCalculation() {
        // Distance between Charminar (17.3616, 78.4747) and Secunderabad (17.4399, 78.4983) is ~9-10 km
        double dist = FacilityService.calculateHaversineKm(17.3616, 78.4747, 17.4399, 78.4983);
        assertTrue(dist > 7.0 && dist < 12.0, "Distance should be approx 9-10 km, was: " + dist);
    }

    @Test
    void testSearchNearbyFacilities() {
        var results = facilityService.searchNearby(17.3850, 78.4867, 15.0, (String) null, false);
        assertNotNull(results);
        assertFalse(results.isEmpty(), "Should find seeded facilities within 15 km");
    }

    @Test
    void testAccessibleFacilityFilter() {
        var accessibleResults = facilityService.searchNearby(17.3850, 78.4867, 25.0, (String) null, true);
        assertNotNull(accessibleResults);
        for (var f : accessibleResults) {
            assertTrue(f.isAccessible(), "Every returned facility must be accessible");
        }
    }

    @Test
    void testDustbinSearchReturnsOnlyDustbins() {
        // Test in Vizianagaram (18.1067, 83.3956)
        var dustbinResults = facilityService.searchNearby(18.1067, 83.3956, 15.0, "DUSTBIN", false);
        assertNotNull(dustbinResults);
        assertFalse(dustbinResults.isEmpty(), "Should find seeded dustbins in Vizianagaram");
        for (var f : dustbinResults) {
            assertEquals(FacilityCategory.DUSTBIN, f.category(), "Result must strictly be a DUSTBIN, but got: " + f.category() + " (" + f.name() + ")");
        }

        // Test recommendations as well
        var recs = facilityService.getRecommendations(18.1067, 83.3956, 15.0, "DUSTBIN", false, 3);
        assertNotNull(recs);
        assertFalse(recs.isEmpty(), "Recommendations for DUSTBIN must not be empty");
        for (var rec : recs) {
            assertEquals(FacilityCategory.DUSTBIN, rec.facility().category(),
                    "Recommendation must strictly be a DUSTBIN, never a PUBLIC_TOILET!");
        }
    }

    @Test
    void testPluralCategoryStringParsing() {
        // "DUSTBINS" with an S must resolve to DUSTBIN
        var dustbinPlural = facilityService.searchNearby(18.1067, 83.3956, 15.0, "DUSTBINS", false);
        assertNotNull(dustbinPlural);
        assertFalse(dustbinPlural.isEmpty());
        for (var f : dustbinPlural) {
            assertEquals(FacilityCategory.DUSTBIN, f.category());
        }

        // "TOILETS" with an S must resolve to PUBLIC_TOILET
        var toiletPlural = facilityService.searchNearby(18.1067, 83.3956, 15.0, "TOILETS", false);
        assertNotNull(toiletPlural);
        assertFalse(toiletPlural.isEmpty());
        for (var f : toiletPlural) {
            assertEquals(FacilityCategory.PUBLIC_TOILET, f.category());
        }
    }

    @Test
    void testPoliceFilterNeverReturnsHospitalsOrToilets() {
        var policeResults = facilityService.searchNearby(18.1067, 83.3956, 15.0, "POLICE", false);
        assertNotNull(policeResults);
        assertFalse(policeResults.isEmpty());
        for (var f : policeResults) {
            assertEquals(FacilityCategory.POLICE_STATION, f.category(), "Must strictly be POLICE_STATION");
            assertNotEquals(FacilityCategory.HOSPITAL, f.category());
            assertNotEquals(FacilityCategory.PUBLIC_TOILET, f.category());
        }
    }

    @Test
    void testHospitalFilterReturnsOnlyHospitals() {
        var hospitalResults = facilityService.searchNearby(18.1067, 83.3956, 15.0, "HOSPITAL", false);
        assertNotNull(hospitalResults);
        assertFalse(hospitalResults.isEmpty());
        for (var f : hospitalResults) {
            assertEquals(FacilityCategory.HOSPITAL, f.category(), "Must strictly be HOSPITAL");
        }
    }

    @Test
    void testAllReturnsAllSupportedCategories() {
        var allResults = facilityService.searchNearby(18.1067, 83.3956, 15.0, "ALL", false);
        assertNotNull(allResults);
        assertTrue(allResults.size() >= 4, "Should find multiple categories in Vizianagaram");
    }
}
