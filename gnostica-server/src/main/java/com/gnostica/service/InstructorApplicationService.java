package com.gnostica.service;

import com.gnostica.dto.request.InstructorApplicationRequest;
import com.gnostica.dto.request.RejectApplicationRequest;
import com.gnostica.dto.response.InstructorApplicationResponse;

import java.util.List;

public interface InstructorApplicationService {
    void submitApplication(String email, InstructorApplicationRequest request);
    List<InstructorApplicationResponse> getAllApplications();
    List<InstructorApplicationResponse> getPendingApplications();
    void approveApplication(Integer id);
    void rejectApplication(Integer id, RejectApplicationRequest request);
}
