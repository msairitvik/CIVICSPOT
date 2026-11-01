package com.civicspot.dto;

import java.util.List;
import java.util.Map;

public class AiChatDto {

    public record ChatRequest(
            String message,
            String sessionId,
            Double latitude,
            Double longitude,
            String imageBase64,
            String mimeType
    ) {}

    public record Citation(
            String title,
            String url,
            String snippet
    ) {}

    public record FunctionCallLog(
            String name,
            Map<String, Object> arguments,
            Object result
    ) {}

    public record AgentLogDto(
            String agentName,
            String query,
            String step,
            String status,
            Long executionTimeMs,
            String details
    ) {}

    public record ChatResponse(
            String message,
            String sessionId,
            String routingCategory,
            List<Citation> citations,
            List<FunctionCallLog> functionCalls,
            List<AgentLogDto> agentLogs,
            List<FacilityDto.FacilityResponse> facilityCards,
            boolean actionRequired,
            String actionType,
            Map<String, Object> actionData
    ) {}

    public record ImageAnalysisRequest(
            String imageBase64,
            String mimeType,
            String contextPrompt,
            Double latitude,
            Double longitude
    ) {}

    public record ImageAnalysisResponse(
            String assessment,
            String detectedIssueCategory,
            String severityEstimate,
            List<String> detectedFeatures,
            boolean recommendsReporting,
            String disclaimer
    ) {}
}
