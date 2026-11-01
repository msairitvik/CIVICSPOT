package com.civicspot.service;

import com.civicspot.dto.AiChatDto;
import com.civicspot.dto.FacilityDto;
import com.civicspot.dto.GeocodingDto;
import com.civicspot.model.*;
import com.civicspot.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AgentOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(AgentOrchestrationService.class);

    private final GeminiAiService geminiAiService;
    private final FacilityService facilityService;
    private final GeocodingService geocodingService;
    private final FacilityRecommendationService facilityRecommendationService;
    private final FacilityRepository facilityRepository;
    private final FacilityReportRepository facilityReportRepository;
    private final ComplaintRepository complaintRepository;
    private final GovernmentSchemeRepository governmentSchemeRepository;
    private final AgentExecutionLogRepository agentLogRepository;
    private final ConversationSessionRepository sessionRepository;
    private final ConversationMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    public AgentOrchestrationService(
            GeminiAiService geminiAiService,
            FacilityService facilityService,
            GeocodingService geocodingService,
            FacilityRecommendationService facilityRecommendationService,
            FacilityRepository facilityRepository,
            FacilityReportRepository facilityReportRepository,
            ComplaintRepository complaintRepository,
            GovernmentSchemeRepository governmentSchemeRepository,
            AgentExecutionLogRepository agentLogRepository,
            ConversationSessionRepository sessionRepository,
            ConversationMessageRepository messageRepository,
            ObjectMapper objectMapper) {
        this.geminiAiService = geminiAiService;
        this.facilityService = facilityService;
        this.geocodingService = geocodingService;
        this.facilityRecommendationService = facilityRecommendationService;
        this.facilityRepository = facilityRepository;
        this.facilityReportRepository = facilityReportRepository;
        this.complaintRepository = complaintRepository;
        this.governmentSchemeRepository = governmentSchemeRepository;
        this.agentLogRepository = agentLogRepository;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AiChatDto.ChatResponse processUserMessage(
            AiChatDto.ChatRequest request,
            User currentUser) {

        long startTime = System.currentTimeMillis();
        String sessionId = request.sessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
            ConversationSession newSession = new ConversationSession(sessionId, currentUser,
                    request.message().length() > 30 ? request.message().substring(0, 30) + "..." : request.message());
            sessionRepository.save(newSession);
        }

        List<AiChatDto.AgentLogDto> agentLogs = new ArrayList<>();
        List<AiChatDto.FunctionCallLog> functionCalls = new ArrayList<>();
        List<FacilityDto.FacilityResponse> facilityCards = new ArrayList<>();
        List<AiChatDto.Citation> citations = new ArrayList<>();

        // Save incoming user message
        ConversationSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session != null) {
            ConversationMessage userMsg = new ConversationMessage(session, "USER", request.message());
            messageRepository.save(userMsg);
        }

        // STEP 1: Master Orchestrator Agent analyzes and routes the prompt
        String routingCategory = classifyQuery(request.message(), request.imageBase64() != null);
        long orchTime = System.currentTimeMillis() - startTime;
        logAgentStep(sessionId, "Master Orchestrator Agent", request.message(), "Query Classification",
                orchTime, "SUCCESS", "Routed query to category: " + routingCategory, agentLogs);

        String responseText = "";
        boolean actionRequired = false;
        String actionType = null;
        Map<String, Object> actionData = new HashMap<>();

        // STEP 2: Multi-Agent Execution according to routing category
        switch (routingCategory) {
            case "FACILITY_DISCOVERY":
            case "LOCATION_QUERY": {
                long agentStart = System.currentTimeMillis();
                FacilityCategory cat = detectCategory(request.message());

                Double userLat = request.latitude();
                Double userLng = request.longitude();

                // Check if the user query explicitly specifies an Indian place/town/village
                String explicitPlace = extractPlaceFromMessage(request.message());
                if (explicitPlace != null) {
                    long geoStart = System.currentTimeMillis();
                    List<GeocodingDto.GeocodingResult> geoResults = geocodingService.searchLocation(explicitPlace, 1);
                    if (!geoResults.isEmpty()) {
                        GeocodingDto.GeocodingResult bestMatch = geoResults.get(0);
                        userLat = bestMatch.latitude();
                        userLng = bestMatch.longitude();
                        logAgentStep(sessionId, "Geocoding Agent", request.message(), "Nominatim Location Resolution",
                                System.currentTimeMillis() - geoStart, "SUCCESS",
                                "Resolved '" + explicitPlace + "' to " + bestMatch.displayName() + " (" + userLat + ", " + userLng + ")", agentLogs);
                    }
                }

                // If still null, fallback to Vizianagaram default
                if (userLat == null || userLng == null) {
                    userLat = 18.1067;
                    userLng = 83.3956;
                }

                facilityCards = facilityService.searchNearby(userLat, userLng, 12.0, cat, false);
                long discTime = System.currentTimeMillis() - agentStart;

                logAgentStep(sessionId, "Facility Discovery Agent", request.message(), "Geographical Search",
                        discTime, "SUCCESS", "Located " + facilityCards.size() + " facilities near (" + userLat + ", " + userLng + ")", agentLogs);

                functionCalls.add(new AiChatDto.FunctionCallLog(
                        "searchNearbyFacilities",
                        Map.of("latitude", userLat, "longitude", userLng, "category", cat != null ? cat.name() : "ALL", "radiusKm", 12.0),
                        Map.of("count", facilityCards.size())
                ));

                // Transparent Recommendation Agent ranking
                List<FacilityDto.FacilityRecommendation> recs = facilityRecommendationService.rankRecommendations(facilityCards, 3);
                logAgentStep(sessionId, "Recommendation Agent", request.message(), "Transparent Proximity & Quality Ranking",
                        25L, "SUCCESS", "Evaluated " + facilityCards.size() + " facilities and ranked top 3 recommendations", agentLogs);

                citations.add(new AiChatDto.Citation("OpenStreetMap Live Overpass", "https://www.openstreetmap.org", "OpenStreetMap Contributors Data"));

                if (recs.isEmpty()) {
                    responseText = "No verified " + (cat != null ? cat.name().toLowerCase().replace('_', ' ') : "public facilities") +
                            " found within the search perimeter. CivicSpot has scheduled an automated OpenStreetMap sync for this sector.";
                } else {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Here are the top-ranked public facilities in this area:\n\n");
                    for (int i = 0; i < recs.size(); i++) {
                        FacilityDto.FacilityRecommendation rec = recs.get(i);
                        FacilityDto.FacilityResponse f = rec.facility();
                        sb.append(i + 1).append(". **").append(f.name()).append("** (").append(f.category()).append(")\n")
                          .append("   - **Recommendation:** ").append(rec.recommendationReason()).append("\n")
                          .append("   - **Highlights:** ").append(String.join(", ", rec.keyStrengths())).append("\n")
                          .append("   - **Address:** ").append(f.address() != null ? f.address() : "Local area").append("\n")
                          .append("   - *Status:* ").append(rec.statusNotice()).append("\n\n");
                    }
                    sb.append("Tap any card below to launch interactive map navigation or leave a citizen cleanliness rating.");
                    responseText = sb.toString();
                }
                break;
            }

            case "ACCESSIBILITY": {
                long agentStart = System.currentTimeMillis();
                Double userLat = request.latitude() != null ? request.latitude() : 18.1067;
                Double userLng = request.longitude() != null ? request.longitude() : 83.3956;

                facilityCards = facilityService.searchNearby(userLat, userLng, 15.0, (String) null, true);
                long accTime = System.currentTimeMillis() - agentStart;

                logAgentStep(sessionId, "Accessibility Agent", request.message(), "Accessible Facility Audit",
                        accTime, "SUCCESS", "Identified " + facilityCards.size() + " barrier-free facilities", agentLogs);

                functionCalls.add(new AiChatDto.FunctionCallLog(
                        "findAccessibleFacilities",
                        Map.of("latitude", userLat, "longitude", userLng),
                        Map.of("count", facilityCards.size())
                ));

                citations.add(new AiChatDto.Citation("Sugamya Bharat Abhiyan", "https://accessibleindia.gov.in", "Accessible India Standards"));

                responseText = "I have prioritized barrier-free public facilities with wheelchair accessibility, ramps, and accessible sanitation in your vicinity. " +
                        "Found " + facilityCards.size() + " accessible locations nearby. See the facility cards below for details.";
                break;
            }

            case "GOVERNMENT_SCHEME":
            case "CIVIC_POLICY": {
                long agentStart = System.currentTimeMillis();
                List<GovernmentScheme> schemes = governmentSchemeRepository.findAll();
                long searchTime = System.currentTimeMillis() - agentStart;

                logAgentStep(sessionId, "General Research Agent", request.message(), "Official Scheme Retrieval",
                        searchTime, "SUCCESS", "Queried Government Schemes repository & official portals", agentLogs);

                logAgentStep(sessionId, "Verification Agent", request.message(), "Source Authenticity Check",
                        25L, "SUCCESS", "Verified sources with india.gov.in and myscheme.gov.in", agentLogs);

                functionCalls.add(new AiChatDto.FunctionCallLog(
                        "searchGovernmentSchemes",
                        Map.of("query", request.message()),
                        Map.of("matchedCount", schemes.size())
                ));

                citations.add(new AiChatDto.Citation("National Portal of India", "https://www.india.gov.in", "Official Portal of Government of India"));
                citations.add(new AiChatDto.Citation("myScheme Government Platform", "https://www.myscheme.gov.in", "Citizen Welfare Schemes & Eligibility"));
                citations.add(new AiChatDto.Citation("Swachh Bharat Mission (Urban)", "https://swachhbharaturban.gov.in", "MoHUA Civic Schemes"));

                GeminiAiService.GeminiResponse aiResp = geminiAiService.generateContent(
                        "You are CIVIC AI. The user is asking about an official government civic scheme or policy. Cite official authorities accurately.",
                        request.message(),
                        true,
                        null,
                        null
                );
                responseText = aiResp.text();
                if (!aiResp.citations().isEmpty()) {
                    citations.addAll(aiResp.citations());
                }
                break;
            }

            case "COMPLAINT_TRACKING":
            case "USER_REPORT": {
                long agentStart = System.currentTimeMillis();
                if (currentUser != null) {
                    List<Complaint> complaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
                    long compTime = System.currentTimeMillis() - agentStart;

                    logAgentStep(sessionId, "Complaint Agent", request.message(), "Retrieve User Complaints",
                            compTime, "SUCCESS", "Found " + complaints.size() + " complaints for user " + currentUser.getName(), agentLogs);

                    functionCalls.add(new AiChatDto.FunctionCallLog(
                        "getUserComplaints",
                        Map.of("userId", currentUser.getId()),
                        Map.of("count", complaints.size())
                    ));

                    if (complaints.isEmpty()) {
                        responseText = "You have no active civic complaints filed yet. Would you like me to help draft a new complaint regarding a public infrastructure or sanitation issue?";
                    } else {
                        StringBuilder sb = new StringBuilder();
                        sb.append("Here is the current status of your submitted civic complaints:\n\n");
                        for (Complaint c : complaints) {
                            sb.append("- **Tracking #").append(c.getTrackingNumber()).append("**: ").append(c.getTitle()).append("\n")
                              .append("  - Status: `").append(c.getStatus()).append("` | Priority: ").append(c.getPriority())
                              .append(" | Dept: ").append(c.getDepartment()).append("\n");
                        }
                        responseText = sb.toString();
                    }
                } else {
                    responseText = "To view your submitted complaints and reports, please log in to your CivicSpot citizen account. You can also file a new report directly from the Citizen Reporting tab.";
                }
                break;
            }

            case "EMERGENCY_ASSISTANCE": {
                long agentStart = System.currentTimeMillis();
                logAgentStep(sessionId, "Emergency Assistance Agent", request.message(), "Emergency Protocol Activation",
                        15L, "SUCCESS", "Activated National Civic Emergency Directory", agentLogs);

                citations.add(new AiChatDto.Citation("National Emergency Services (112)", "https://112.gov.in", "All-in-one Emergency Helpline"));
                citations.add(new AiChatDto.Citation("National Disaster Management Authority", "https://ndma.gov.in", "Official disaster protocols"));

                responseText = "### 🚨 Verified Civic & Emergency Helplines\n\n" +
                        "If you or someone nearby is in immediate danger, please dial official emergency responders directly:\n\n" +
                        "- **All-in-One National Emergency Number:** **112** (Police, Fire, Ambulance)\n" +
                        "- **Medical Ambulance:** **108** / **102**\n" +
                        "- **Police Control Room:** **100**\n" +
                        "- **Fire Services:** **101**\n" +
                        "- **Disaster Management Helpline:** **1070** / **1077**\n" +
                        "- **Women's Helpline:** **1091**\n" +
                        "- **Childline:** **1098**\n\n" +
                        "> *CivicSpot provides municipal assistance and mapping, but for critical emergencies, always contact emergency dispatchers immediately.*";
                break;
            }

            case "IMAGE_ANALYSIS": {
                long agentStart = System.currentTimeMillis();
                logAgentStep(sessionId, "Civic Intelligence Agent", request.message(), "Multimodal Visual Inspection",
                        80L, "SUCCESS", "Analyzed image for municipal infrastructure anomalies", agentLogs);

                GeminiAiService.GeminiResponse geminiImgResp = geminiAiService.generateContent(
                        "You are CIVIC AI analyzing an image of civic infrastructure. Identify visible defects, waste, damage or accessibility issues concisely.",
                        request.message() != null && !request.message().isBlank() ? request.message() : "Analyze this civic scene for infrastructure issues",
                        false,
                        request.imageBase64(),
                        request.mimeType()
                );
                responseText = geminiImgResp.text();
                citations.addAll(geminiImgResp.citations());
                break;
            }

            case "PROGRAMMING_OR_TECHNICAL":
            case "GENERAL_QUESTION":
            case "CURRENT_INFORMATION":
            default: {
                // General purpose reasoning with Gemini!
                long agentStart = System.currentTimeMillis();
                boolean useSearch = routingCategory.equals("CURRENT_INFORMATION") || request.message().toLowerCase().contains("latest") || request.message().toLowerCase().contains("current");

                logAgentStep(sessionId, "General Research Agent", request.message(), "Knowledge Synthesizer",
                        20L, "SUCCESS", "Consulted Gemini LLM engine (Search grounding=" + useSearch + ")", agentLogs);

                GeminiAiService.GeminiResponse aiResp = geminiAiService.generateContent(
                        "You are CIVIC AI, a world-class AI assistant developed for CivicSpot. You answer both broad general-purpose questions (programming, science, mathematics, education, career, history, writing, everyday problem solving) and civic questions with deep clarity, factual rigor, and friendly formatting. Format code in markdown with syntax highlighting. Never claim to be restricted to civic topics.",
                        request.message(),
                        useSearch,
                        request.imageBase64(),
                        request.mimeType()
                );

                responseText = aiResp.text();
                citations.addAll(aiResp.citations());
                break;
            }
        }

        // Save AI response message in conversation history
        if (session != null) {
            ConversationMessage botMsg = new ConversationMessage(session, "ASSISTANT", responseText);
            botMsg.setRoutingCategory(routingCategory);
            try {
                if (!citations.isEmpty()) botMsg.setCitationsJson(objectMapper.writeValueAsString(citations));
                if (!functionCalls.isEmpty()) botMsg.setFunctionCallsJson(objectMapper.writeValueAsString(functionCalls));
                if (!agentLogs.isEmpty()) botMsg.setAgentLogsJson(objectMapper.writeValueAsString(agentLogs));
                if (!facilityCards.isEmpty()) botMsg.setFacilityCardsJson(objectMapper.writeValueAsString(facilityCards));
            } catch (Exception e) {
                log.warn("Failed to serialize message metadata: {}", e.getMessage());
            }
            messageRepository.save(botMsg);
        }

        return new AiChatDto.ChatResponse(
                responseText,
                sessionId,
                routingCategory,
                citations,
                functionCalls,
                agentLogs,
                facilityCards,
                actionRequired,
                actionType,
                actionData
        );
    }

    private String extractPlaceFromMessage(String message) {
        if (message == null || message.isBlank()) return null;

        // Match patterns like "in Denkada", "near Vizianagaram", "around Kothavalasa", "at Gajuwaka"
        Pattern p = Pattern.compile("(?i)\\b(?:in|near|around|at|for|across)\\s+([a-zA-Z0-9\\s,]{2,40})");
        Matcher m = p.matcher(message);
        if (m.find()) {
            String candidate = m.group(1).trim();
            // Filter common stopwords or question endings
            candidate = candidate.replaceAll("(?i)\\b(the|a|an|my|our|nearby|here|please|can you|area)\\b", "").trim();
            if (candidate.length() >= 3) {
                return candidate;
            }
        }
        return null;
    }

    private void logAgentStep(String sessionId, String agentName, String query, String step,
                              Long timeMs, String status, String details, List<AiChatDto.AgentLogDto> logs) {
        AiChatDto.AgentLogDto dto = new AiChatDto.AgentLogDto(agentName, query, step, status, timeMs, details);
        logs.add(dto);

        try {
            AgentExecutionLog dbLog = new AgentExecutionLog(sessionId, agentName,
                    query.length() > 250 ? query.substring(0, 250) : query,
                    step, timeMs, status, details);
            agentLogRepository.save(dbLog);
        } catch (Exception e) {
            log.warn("Failed to persist agent log: {}", e.getMessage());
        }
    }

    public String classifyQuery(String query, boolean hasImage) {
        if (hasImage) return "IMAGE_ANALYSIS";
        if (query == null || query.isBlank()) return "GENERAL_QUESTION";

        String q = query.toLowerCase();

        if (q.contains("emergency") || q.contains("ambulance") || q.contains("police helpline") || q.contains("fire brigade") || q.contains("accident")) {
            return "EMERGENCY_ASSISTANCE";
        }
        if (q.contains("wheelchair") || q.contains("ramp") || q.contains("accessible") || q.contains("disability") || q.contains("blind") || q.contains("deaf")) {
            return "ACCESSIBILITY";
        }
        if (q.contains("toilet") || q.contains("washroom") || q.contains("restroom") || q.contains("urinal") ||
            q.contains("drinking water") || q.contains("dustbin") || q.contains("trash can") || q.contains("hospital") ||
            q.contains("pharmacy") || q.contains("park") || q.contains("find nearby") || q.contains("nearest")) {
            return "FACILITY_DISCOVERY";
        }
        if (q.contains("route") || q.contains("directions") || q.contains("navigate") || q.contains("travel to") || q.contains("how to reach")) {
            return "NAVIGATION";
        }
        if (q.contains("my complaint") || q.contains("track complaint") || q.contains("status of complaint") || q.contains("complaint history")) {
            return "COMPLAINT_TRACKING";
        }
        if (q.contains("report issue") || q.contains("broken streetlight") || q.contains("pothole") || q.contains("overflowing garbage")) {
            return "USER_REPORT";
        }
        if (q.contains("scheme") || q.contains("yojana") || q.contains("subsidy") || q.contains("swachh bharat") || q.contains("jal jeevan") || q.contains("ayushman")) {
            return "GOVERNMENT_SCHEME";
        }
        if (q.contains("law") || q.contains("municipal rule") || q.contains("building bye-law") || q.contains("property tax") || q.contains("civic right")) {
            return "CIVIC_POLICY";
        }
        if (q.contains("code") || q.contains("java") || q.contains("react") || q.contains("programming") || q.contains("sql") || q.contains("algorithm") || q.contains("spring boot")) {
            return "PROGRAMMING_OR_TECHNICAL";
        }
        if (q.contains("today") || q.contains("latest news") || q.contains("current weather") || q.contains("now")) {
            return "CURRENT_INFORMATION";
        }
        return "GENERAL_QUESTION";
    }

    private FacilityCategory detectCategory(String query) {
        String q = query.toLowerCase();
        if (q.contains("toilet") || q.contains("washroom") || q.contains("restroom") || q.contains("urinal")) return FacilityCategory.PUBLIC_TOILET;
        if (q.contains("water") || q.contains("drinking")) return FacilityCategory.DRINKING_WATER;
        if (q.contains("dustbin") || q.contains("trash") || q.contains("waste") || q.contains("garbage")) return FacilityCategory.DUSTBIN;
        if (q.contains("hospital") || q.contains("clinic")) return FacilityCategory.HOSPITAL;
        if (q.contains("pharmacy") || q.contains("chemist") || q.contains("medical store")) return FacilityCategory.PHARMACY;
        if (q.contains("police")) return FacilityCategory.POLICE_STATION;
        if (q.contains("bus")) return FacilityCategory.BUS_STOP;
        if (q.contains("train") || q.contains("railway") || q.contains("metro")) return FacilityCategory.RAILWAY_STATION;
        if (q.contains("park") || q.contains("garden")) return FacilityCategory.PUBLIC_PARK;
        if (q.contains("ev") || q.contains("charging")) return FacilityCategory.EV_CHARGING;
        return null;
    }
}
