package com.civicspot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("h2")
class CivicSpotApplicationTests {

    @Test
    void contextLoads() {
        // Confirms Spring Boot application context bootstraps cleanly
    }
}
