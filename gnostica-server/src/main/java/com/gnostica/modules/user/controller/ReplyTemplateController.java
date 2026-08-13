package com.gnostica.modules.user.controller;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.user.dto.request.ReplyTemplateRequest;
import com.gnostica.modules.user.dto.response.ReplyTemplateResponse;
import com.gnostica.modules.user.service.ReplyTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reply-templates")
@RequiredArgsConstructor
public class ReplyTemplateController {

    private final ReplyTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ResponseDTO<List<ReplyTemplateResponse>>> getTemplates(Principal principal) {
        List<ReplyTemplateResponse> data = templateService.getTemplates(principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", data));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ResponseDTO<ReplyTemplateResponse>> createTemplate(@RequestBody @Valid ReplyTemplateRequest request, Principal principal) {
        ReplyTemplateResponse data = templateService.createTemplate(request, principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Created successfully", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ResponseDTO<ReplyTemplateResponse>> updateTemplate(@PathVariable Integer id, @RequestBody @Valid ReplyTemplateRequest request, Principal principal) {
        ReplyTemplateResponse data = templateService.updateTemplate(id, request, principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Updated successfully", data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ResponseDTO<String>> deleteTemplate(@PathVariable Integer id, Principal principal) {
        templateService.deleteTemplate(id, principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Deleted successfully", null));
    }
}
