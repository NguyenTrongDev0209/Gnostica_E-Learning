package com.gnostica.service;

import com.gnostica.payload.request.InstructorApplicationRequest;
import com.gnostica.payload.request.RejectApplicationRequest;
import com.gnostica.payload.response.InstructorApplicationResponse;

import java.util.List;

public interface InstructorApplicationService {
    void submitApplication(String email, InstructorApplicationRequest request);
    List<InstructorApplicationResponse> getAllApplications();
    List<InstructorApplicationResponse> getPendingApplications();
    void approveApplication(Integer id);
    void rejectApplication(Integer id, RejectApplicationRequest request);
}
