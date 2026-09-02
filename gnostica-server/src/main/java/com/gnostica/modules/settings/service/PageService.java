package com.gnostica.modules.settings.service;

import com.gnostica.core.model.Page;
import com.gnostica.core.repository.PageRepository;
import com.gnostica.core.util.PolicyHtmlSanitizer;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.modules.settings.dto.request.PageRequest;
import com.gnostica.modules.settings.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PageService {
    private final PageRepository repository;

    public PageResponse getPublished(String slug) {
        return repository.findBySlugAndStatus(slug, 1)
                .map(PageResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trang nội dung"));
    }

    public List<PageResponse> getAll() {
        return repository.findAllByOrderByTitleAsc().stream().map(PageResponse::from).toList();
    }

    @Transactional
    public PageResponse create(PageRequest request) {
        if (repository.findBySlug(request.getSlug()).isPresent()) {
            throw new IllegalArgumentException("Slug trang đã tồn tại");
        }
        Page page = new Page();
        apply(page, request);
        return PageResponse.from(repository.save(page));
    }

    @Transactional
    public PageResponse update(Integer id, PageRequest request) {
        Page page = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trang nội dung"));
        repository.findBySlug(request.getSlug())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new IllegalArgumentException("Slug trang đã tồn tại"); });
        apply(page, request);
        return PageResponse.from(repository.save(page));
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) throw new IllegalArgumentException("Không tìm thấy trang nội dung");
        repository.deleteById(id);
    }

    private void apply(Page page, PageRequest request) {
        page.setTitle(request.getTitle().trim());
        page.setSlug(request.getSlug().trim().toLowerCase());
        page.setContent(PolicyHtmlSanitizer.sanitize(request.getContent()));
        page.setStatus(request.getStatus());
        page.setMetadata(request.getMetadata() == null ? new java.util.LinkedHashMap<>() : new java.util.LinkedHashMap<>(request.getMetadata()));
    }
}
