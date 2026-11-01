package com.civicspot;

import com.civicspot.service.AgentOrchestrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
class AgentOrchestrationServiceTest {

    @Autowired
    private AgentOrchestrationService orchestrationService;

    @Test
    void testQueryClassification() {
        assertEquals("FACILITY_DISCOVERY", orchestrationService.classifyQuery("Where is the nearest public toilet?", false));
        assertEquals("FACILITY_DISCOVERY", orchestrationService.classifyQuery("Find drinking water and dustbins nearby", false));
        assertEquals("EMERGENCY_ASSISTANCE", orchestrationService.classifyQuery("Call emergency police helpline now", false));
        assertEquals("ACCESSIBILITY", orchestrationService.classifyQuery("Find wheelchair accessible ramps and restrooms", false));
        assertEquals("GOVERNMENT_SCHEME", orchestrationService.classifyQuery("What is the Swachh Bharat Mission 2.0 subsidy?", false));
        assertEquals("PROGRAMMING_OR_TECHNICAL", orchestrationService.classifyQuery("Explain Java 21 virtual threads and Spring Boot", false));
        assertEquals("IMAGE_ANALYSIS", orchestrationService.classifyQuery("What is this?", true));
        assertEquals("NAVIGATION", orchestrationService.classifyQuery("How to reach Secunderabad railway station directions", false));
        assertEquals("COMPLAINT_TRACKING", orchestrationService.classifyQuery("Track my complaint status CIV-2026", false));
        assertEquals("GENERAL_QUESTION", orchestrationService.classifyQuery("Explain how photosynthesis works in plants", false));
    }
}
