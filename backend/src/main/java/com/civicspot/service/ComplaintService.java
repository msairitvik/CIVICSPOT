package com.civicspot.service;

import com.civicspot.dto.ComplaintDto;
import com.civicspot.model.Complaint;
import com.civicspot.model.ComplaintEvidence;
import com.civicspot.model.User;
import com.civicspot.repository.ComplaintRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            GeminiAiService geminiAiService,
            ObjectMapper objectMapper) {
        this.complaintRepository = complaintRepository;
        this.geminiAiService = geminiAiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ComplaintDto.ComplaintResponse createComplaint(User user, ComplaintDto.CreateComplaintRequest req) {
        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setTitle(req.title());
        complaint.setCategory(req.category() != null ? req.category() : "SANITATION");
        complaint.setDescription(req.description());
        complaint.setLatitude(req.latitude());
        complaint.setLongitude(req.longitude());
        complaint.setAddress(req.address());
        complaint.setDepartment(req.department() != null ? req.department() : "MUNICIPAL_CORPORATION");
        complaint.setPriority(req.priority() != null ? req.priority() : "MEDIUM");
        complaint.setStatus("SUBMITTED");

        // Generate tracking number: CIV-2026-XXXX
        String trackingNum = "CIV-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        complaint.setTrackingNumber(trackingNum);

        // Status history initial record
        List<Map<String, String>> history = new ArrayList<>();
        history.add(Map.of(
                "status", "SUBMITTED",
                "timestamp", Instant.now().toString(),
                "comment", "Complaint logged internally into CivicSpot resolution portal."
        ));

        try {
            complaint.setStatusHistory(objectMapper.writeValueAsString(history));
        } catch (Exception ignored) {}

        // Handle Evidence photo
        if (req.imageBase64() != null && !req.imageBase64().isBlank()) {
            String aiAnalysis = req.aiAssessment();
            if (aiAnalysis == null || aiAnalysis.isBlank()) {
                aiAnalysis = geminiAiService.generateContent(
                        "You are CIVIC AI assessing municipal evidence. Provide a 1-sentence verification of the reported condition.",
                        req.description() != null ? req.description() : "Analyze evidence",
                        false,
                        req.imageBase64(),
                        "image/jpeg"
                ).text();
            }
            ComplaintEvidence evidence = new ComplaintEvidence(req.imageBase64(), aiAnalysis);
            complaint.addEvidence(evidence);
        }

        complaint = complaintRepository.save(complaint);
        return ComplaintDto.ComplaintResponse.fromEntity(complaint);
    }

    public List<ComplaintDto.ComplaintResponse> getUserComplaints(User user) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ComplaintDto.ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ComplaintDto.ComplaintResponse> getAllComplaints(String status) {
        List<Complaint> list = (status != null && !status.isBlank())
                ? complaintRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                : complaintRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(ComplaintDto.ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ComplaintDto.ComplaintResponse getComplaintByTrackingNumber(String trackingNumber) {
        Complaint c = complaintRepository.findByTrackingNumber(trackingNumber.trim())
                .orElseThrow(() -> new NoSuchElementException("No complaint found with tracking number: " + trackingNumber));
        return ComplaintDto.ComplaintResponse.fromEntity(c);
    }

    public ComplaintDto.ComplaintResponse getComplaintById(Long id) {
        Complaint c = complaintRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No complaint found with ID: " + id));
        return ComplaintDto.ComplaintResponse.fromEntity(c);
    }

    @Transactional
    public ComplaintDto.ComplaintResponse updateComplaintStatus(Long id, ComplaintDto.UpdateComplaintStatusRequest req) {
        Complaint c = complaintRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Complaint not found with ID: " + id));

        if (req.status() != null && !req.status().isBlank()) {
            c.setStatus(req.status().toUpperCase());
        }
        if (req.resolutionNotes() != null) {
            c.setResolutionNotes(req.resolutionNotes());
        }

        // Append to history
        try {
            List<Map<String, String>> history = new ArrayList<>();
            if (c.getStatusHistory() != null) {
                List<?> parsed = objectMapper.readValue(c.getStatusHistory(), List.class);
                for (Object item : parsed) {
                    if (item instanceof Map<?,?> map) {
                        Map<String, String> entry = new HashMap<>();
                        map.forEach((k, v) -> entry.put(String.valueOf(k), String.valueOf(v)));
                        history.add(entry);
                    }
                }
            }
            history.add(Map.of(
                    "status", req.status() != null ? req.status().toUpperCase() : c.getStatus(),
                    "timestamp", Instant.now().toString(),
                    "comment", req.resolutionNotes() != null ? req.resolutionNotes() : "Status updated by municipal administrator."
            ));
            c.setStatusHistory(objectMapper.writeValueAsString(history));
        } catch (Exception ignored) {}

        c = complaintRepository.save(c);
        return ComplaintDto.ComplaintResponse.fromEntity(c);
    }
}
