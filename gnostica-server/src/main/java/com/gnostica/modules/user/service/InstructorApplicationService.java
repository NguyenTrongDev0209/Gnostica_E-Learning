package com.gnostica.modules.user.service;

import com.gnostica.modules.user.dto.request.InstructorApplicationRequest;
import com.gnostica.modules.user.dto.request.RejectApplicationRequest;
import com.gnostica.modules.user.dto.response.InstructorApplicationResponse;

import java.util.List;

public interface InstructorApplicationService {
    void submitApplication(String email, InstructorApplicationRequest request);
    List<InstructorApplicationResponse> getAllApplications();
    List<InstructorApplicationResponse> getPendingApplications();
    void approveApplication(Integer id);
    void rejectApplication(Integer id, RejectApplicationRequest request);
}
