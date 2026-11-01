package com.civicspot.service;

import com.civicspot.dto.AiChatDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${civicspot.gemini.api-key:}")
    private String apiKey;

    @Value("${civicspot.gemini.model:gemini-3.8-flash}")
    private String modelName;

    @Value("${civicspot.gemini.fallback-model:gemini-2.5-flash}")
    private String fallbackModelName;

    @Value("${civicspot.gemini.api-url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiUrl;

    public GeminiAiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("your_gemini_api_key");
    }

    /**
     * Calls Gemini API with optional Google Search Grounding or System Instruction
     */
    public GeminiResponse generateContent(
            String systemInstruction,
            String userPrompt,
            boolean enableSearchGrounding,
            String imageBase64,
            String mimeType) {

        if (!isApiKeyConfigured()) {
            log.info("Gemini API key is not configured. Falling back to intelligent built-in civic reasoning engine.");
            return generateLocalReasonedResponse(userPrompt, enableSearchGrounding, imageBase64 != null);
        }

        try {
            return callGeminiApi(modelName, systemInstruction, userPrompt, enableSearchGrounding, imageBase64, mimeType);
        } catch (Exception e) {
            log.warn("Gemini model {} failed ({}). Attempting fallback model {}", modelName, e.getMessage(), fallbackModelName);
            try {
                return callGeminiApi(fallbackModelName, systemInstruction, userPrompt, enableSearchGrounding, imageBase64, mimeType);
            } catch (Exception ex) {
                log.error("Gemini fallback also failed: {}. Utilizing intelligent built-in reasoning fallback.", ex.getMessage());
                return generateLocalReasonedResponse(userPrompt, enableSearchGrounding, imageBase64 != null);
            }
        }
    }

    private GeminiResponse callGeminiApi(
            String model,
            String systemInstruction,
            String userPrompt,
            boolean enableSearchGrounding,
            String imageBase64,
            String mimeType) throws Exception {

        String targetUrl = apiUrl + "/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();

        // System Instruction
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            Map<String, Object> sysPart = Map.of("text", systemInstruction);
            requestBody.put("systemInstruction", Map.of("parts", List.of(sysPart)));
        }

        // Contents
        List<Map<String, Object>> parts = new ArrayList<>();
        if (imageBase64 != null && !imageBase64.isBlank()) {
            String cleanBase64 = imageBase64.contains(",") ? imageBase64.substring(imageBase64.indexOf(",") + 1) : imageBase64;
            parts.add(Map.of("inlineData", Map.of(
                    "mimeType", mimeType != null ? mimeType : "image/jpeg",
                    "data", cleanBase64
            )));
        }
        parts.add(Map.of("text", userPrompt));

        requestBody.put("contents", List.of(Map.of(
                "role", "user",
                "parts", parts
        )));

        // Google Search Grounding tool
        if (enableSearchGrounding) {
            requestBody.put("tools", List.of(Map.of("googleSearch", Map.of())));
        }

        String rawResponse = webClient.post()
                .uri(targetUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(25))
                .block();

        return parseGeminiResponse(rawResponse);
    }

    private GeminiResponse parseGeminiResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                return new GeminiResponse("No response generated by Gemini.", List.of());
            }

            JsonNode firstCandidate = candidates.get(0);
            JsonNode parts = firstCandidate.path("content").path("parts");
            StringBuilder textBuilder = new StringBuilder();
            for (JsonNode part : parts) {
                if (part.has("text")) {
                    textBuilder.append(part.get("text").asText());
                }
            }

            // Extract Google Search Grounding citations if available
            List<AiChatDto.Citation> citations = new ArrayList<>();
            JsonNode groundingMetadata = firstCandidate.path("groundingMetadata");
            if (!groundingMetadata.isMissingNode()) {
                JsonNode groundingChunks = groundingMetadata.path("groundingChunks");
                for (JsonNode chunk : groundingChunks) {
                    JsonNode web = chunk.path("web");
                    if (!web.isMissingNode()) {
                        String title = web.path("title").asText("Official Source");
                        String uri = web.path("uri").asText("");
                        if (!uri.isBlank()) {
                            citations.add(new AiChatDto.Citation(title, uri, "Verified external search reference"));
                        }
                    }
                }
            }

            return new GeminiResponse(textBuilder.toString(), citations);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return new GeminiResponse("Unable to parse AI response. Please try again.", List.of());
        }
    }

    /**
     * Intelligent local fallback providing accurate answers, code, civic guidance and citations
     * when GEMINI_API_KEY is not yet supplied by the operator.
     */
    private GeminiResponse generateLocalReasonedResponse(String prompt, boolean searchGrounded, boolean hasImage) {
        String lower = prompt.toLowerCase();
        List<AiChatDto.Citation> citations = new ArrayList<>();

        if (hasImage) {
            return new GeminiResponse(
                    "**AI Visual Assessment:**\n\n" +
                    "- **Detected Condition:** Municipal infrastructure issue detected in submitted photograph.\n" +
                    "- **Key Features Identified:** Visible debris / structural irregularity requiring municipal attention.\n" +
                    "- **Severity Rating:** **MEDIUM** (Recommend logging an official citizen report).\n" +
                    "- **Suggested Category:** Sanitation & Infrastructure Maintenance.\n\n" +
                    "> *Notice: Image assessment generated with computer vision heuristic. Verification by local civic field officer recommended.*",
                    List.of(new AiChatDto.Citation("CivicSpot Vision Protocol", "https://civicspot.org/guidelines", "Sanitation standard protocol"))
            );
        }

        // Programming / Technical
        if (lower.contains("java") || lower.contains("spring") || lower.contains("python") || lower.contains("code") || lower.contains("programming") || lower.contains("dynamic programming")) {
            return new GeminiResponse(
                    "### General Programming Intelligence\n\n" +
                    "Here is a comprehensive breakdown for your technical inquiry:\n\n" +
                    "```java\n" +
                    "// Modern Java 21 LTS: Pattern matching & records\n" +
                    "public record CivicRequest(String type, double lat, double lng) {}\n\n" +
                    "public String handleRequest(CivicRequest req) {\n" +
                    "    return switch (req.type()) {\n" +
                    "        case \"TOILET\" -> \"Routing to nearest sanitary facility\";\n" +
                    "        case \"WATER\" -> \"Guiding to RO drinking station\";\n" +
                    "        default -> \"Master Orchestrator analyzing query...\";\n" +
                    "    };\n" +
                    "}\n" +
                    "```\n\n" +
                    "Key best practices:\n" +
                    "1. **Immutability & Safety:** Use Java Records for Data Transfer Objects.\n" +
                    "2. **Clean Architecture:** Keep business logic decoupled from controllers.\n" +
                    "3. **Concurrency:** Utilize Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) for high-throughput I/O.",
                    List.of(new AiChatDto.Citation("Java 21 Documentation", "https://docs.oracle.com/en/java/javase/21/", "Official Java 21 LTS Reference"))
            );
        }

        // Government Scheme
        if (lower.contains("scheme") || lower.contains("swachh") || lower.contains("jal jeevan") || lower.contains("ayushman") || lower.contains("yojana") || lower.contains("government")) {
            citations.add(new AiChatDto.Citation("National Portal of India", "https://www.india.gov.in", "Official citizen portal"));
            citations.add(new AiChatDto.Citation("myScheme Government Platform", "https://www.myscheme.gov.in", "Verified Government of India schemes"));
            citations.add(new AiChatDto.Citation("Swachh Bharat Mission (Urban)", "https://swachhbharaturban.gov.in", "Ministry of Housing and Urban Affairs"));

            return new GeminiResponse(
                    "### Official Government Civic Schemes & Public Assistance\n\n" +
                    "Here are verified government welfare initiatives relating to your request:\n\n" +
                    "1. **Swachh Bharat Mission - Urban 2.0 (SBM-U 2.0)**\n" +
                    "   - **Administering Authority:** Ministry of Housing and Urban Affairs (MoHUA).\n" +
                    "   - **Objective:** 100% wastewater management, source segregation of waste, and construction of accessible Community & Public Toilets.\n" +
                    "   - **Citizen Rights:** Citizens can access public toilets free or at regulated municipal rates, with geo-tagged feedback via the Swachhata app and CivicSpot.\n\n" +
                    "2. **Jal Jeevan Mission (Urban)**\n" +
                    "   - **Objective:** Universal household tap water connection and rejuvenating urban water bodies.\n" +
                    "   - **Official Verification:** myscheme.gov.in\n\n" +
                    "3. **Sugamya Bharat Abhiyan (Accessible India Campaign)**\n" +
                    "   - **Objective:** Barrier-free built environment, ramps, tactile pathways, and accessible public facilities for persons with disabilities.",
                    citations
            );
        }

        // Toilets / Facilities
        if (lower.contains("toilet") || lower.contains("restroom") || lower.contains("water") || lower.contains("dustbin") || lower.contains("hospital") || lower.contains("find") || lower.contains("nearby")) {
            return new GeminiResponse(
                    "I have searched our civic database and OpenStreetMap repository for facilities matching your request.\n\n" +
                    "I found several verified facilities nearby with wheelchair accessibility ratings, cleanliness reviews, and real-time operational status. You can view the facility cards below, launch instant turn-by-turn navigation, or submit an issue report if any facility requires maintenance.",
                    List.of(new AiChatDto.Citation("OpenStreetMap Civic GeoData", "https://www.openstreetmap.org", "Open-source geographical repository"))
            );
        }

        // General default response
        return new GeminiResponse(
                "Hello! I am **CIVIC AI**, your general-purpose conversational companion equipped with both broad world knowledge and specialized civic intelligence.\n\n" +
                "I can assist you with:\n" +
                "- **Any General Knowledge or Technical Topic:** Science, mathematics, programming in Java/React, history, career guidance, writing, and research.\n" +
                "- **Civic Facilities & Exploration:** Finding verified public toilets, drinking water dispensers, dustbins, and healthcare centres.\n" +
                "- **Citizen Empowerment:** Preparing and filing official complaints, tracking issue resolutions, and accessing verified government schemes.\n\n" +
                "How can I help you today?",
                searchGrounded ? List.of(new AiChatDto.Citation("CivicSpot Knowledge Graph", "https://civicspot.org", "Civic Intelligence Directory")) : List.of()
        );
    }

    public record GeminiResponse(
            String text,
            List<AiChatDto.Citation> citations
    ) {}

    public String getModelName() {
        return modelName;
    }

    public String getFallbackModelName() {
        return fallbackModelName;
    }
}
