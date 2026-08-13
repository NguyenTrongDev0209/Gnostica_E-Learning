package com.gnostica.modules.user.service;

import com.gnostica.modules.user.dto.request.ReplyTemplateRequest;
import com.gnostica.modules.user.dto.response.ReplyTemplateResponse;

import java.util.List;

public interface ReplyTemplateService {
    List<ReplyTemplateResponse> getTemplates(String email);
    ReplyTemplateResponse createTemplate(ReplyTemplateRequest request, String email);
    ReplyTemplateResponse updateTemplate(Integer id, ReplyTemplateRequest request, String email);
    void deleteTemplate(Integer id, String email);
}
