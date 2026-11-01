package com.civicspot.controller;

import com.civicspot.dto.ComplaintDto;
import com.civicspot.model.User;
import com.civicspot.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintDto.ComplaintResponse> createComplaint(
            @RequestBody ComplaintDto.CreateComplaintRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.createComplaint(user, request));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintDto.ComplaintResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(complaintService.getAllComplaints(status));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ComplaintDto.ComplaintResponse>> getUserComplaints(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(complaintService.getUserComplaints(user));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ComplaintDto.ComplaintResponse> trackComplaint(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(complaintService.getComplaintByTrackingNumber(trackingNumber));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDto.ComplaintResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComplaintDto.ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ComplaintDto.UpdateComplaintStatusRequest request) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, request));
    }
}
