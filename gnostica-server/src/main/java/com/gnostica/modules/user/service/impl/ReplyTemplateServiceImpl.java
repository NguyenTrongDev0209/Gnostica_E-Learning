package com.gnostica.modules.user.service.impl;

import com.gnostica.core.model.ReplyTemplate;
import com.gnostica.core.repository.ReplyTemplateRepository;
import com.gnostica.modules.user.dto.request.ReplyTemplateRequest;
import com.gnostica.modules.user.dto.response.ReplyTemplateResponse;
import com.gnostica.modules.user.service.ReplyTemplateService;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReplyTemplateServiceImpl implements ReplyTemplateService {

    private final ReplyTemplateRepository templateRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<ReplyTemplateResponse> getTemplates(String email) {
        return templateRepository.findByAccountEmailOrderByCreatedAtAsc(email)
                .stream()
                .map(t -> ReplyTemplateResponse.builder()
                        .id(t.getId())
                        .content(t.getContent())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ReplyTemplateResponse createTemplate(ReplyTemplateRequest request, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        ReplyTemplate template = ReplyTemplate.builder()
                .account(account)
                .content(request.getContent())
                .build();
        template = templateRepository.save(template);
        return ReplyTemplateResponse.builder()
                .id(template.getId())
                .content(template.getContent())
                .build();
    }

    @Override
    public ReplyTemplateResponse updateTemplate(Integer id, ReplyTemplateRequest request, String email) {
        ReplyTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        
        if (template.getAccount() == null || !template.getAccount().getEmail().equals(email)) {
            throw new IllegalArgumentException("Không có quyền sửa mẫu này");
        }
        
        template.setContent(request.getContent());
        template = templateRepository.save(template);
        return ReplyTemplateResponse.builder()
                .id(template.getId())
                .content(template.getContent())
                .build();
    }

    @Override
    public void deleteTemplate(Integer id, String email) {
        ReplyTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        
        if (template.getAccount() == null || !template.getAccount().getEmail().equals(email)) {
            throw new IllegalArgumentException("Không có quyền xóa mẫu này");
        }
        
        templateRepository.delete(template);
    }
}
