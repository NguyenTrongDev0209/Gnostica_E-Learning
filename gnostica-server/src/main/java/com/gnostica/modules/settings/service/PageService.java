package com.gnostica.modules.settings.service;

import com.gnostica.core.model.Page;
import com.gnostica.core.repository.PageRepository;
import com.gnostica.core.util.PolicyHtmlSanitizer;
import com.gnostica.modules.settings.dto.request.PageRequest;
import com.gnostica.modules.settings.dto.response.PageResponse;
import com.gnostica.modules.settings.dto.response.TermsMenuGroupResponse;
import com.gnostica.modules.settings.dto.response.TermsMenuItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PageService {
    private final PageRepository repository;

    public PageResponse getPublished(String slug) {
        return repository.findBySlugAndStatus(slug, 1)
                .map(PageResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trang nội dung"));
    }

    public List<PageResponse> getAll() {
        return repository.findAllByOrderByTitleAsc().stream().map(PageResponse::from).toList();
    }

    public List<TermsMenuGroupResponse> getPublishedTermsMenu() {
        record MenuPage(Page page, String group, int groupOrder, int pageOrder) {}

        Map<String, List<MenuPage>> pagesByGroup = repository.findAllByStatusAndSlugStartingWith(1, "terms")
                .stream()
                .filter(page -> isShownInTermsMenu(page.getMetadata()))
                .map(page -> new MenuPage(
                        page,
                        metadataText(page.getMetadata(), "menuGroup", "Điều khoản & Chính sách"),
                        metadataNumber(page.getMetadata(), "menuOrder", 0),
                        metadataNumber(page.getMetadata(), "pageOrder", 0)))
                .collect(java.util.stream.Collectors.groupingBy(MenuPage::group));

        return pagesByGroup.entrySet().stream()
                .map(entry -> {
                    List<MenuPage> groupPages = entry.getValue();
                    int groupOrder = groupPages.stream().mapToInt(MenuPage::groupOrder).min().orElse(0);
                    List<TermsMenuItemResponse> items = groupPages.stream()
                            .sorted(Comparator.comparingInt(MenuPage::pageOrder).thenComparing(menuPage -> menuPage.page().getTitle()))
                            .map(menuPage -> TermsMenuItemResponse.builder()
                                    .id(menuPage.page().getId())
                                    .title(menuPage.page().getTitle())
                                    .slug(menuPage.page().getSlug())
                                    .order(menuPage.pageOrder())
                                    .build())
                            .toList();
                    return TermsMenuGroupResponse.builder().title(entry.getKey()).order(groupOrder).items(items).build();
                })
                .sorted(Comparator.comparing(TermsMenuGroupResponse::getOrder).thenComparing(TermsMenuGroupResponse::getTitle))
                .toList();
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
        page.setMetadata(request.getMetadata() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(request.getMetadata()));
        page.setStatus(request.getStatus());
    }

    private boolean isShownInTermsMenu(Map<String, Object> metadata) {
        return !Boolean.FALSE.equals(metadata == null ? null : metadata.get("showInTermsMenu"));
    }

    private String metadataText(Map<String, Object> metadata, String key, String fallback) {
        Object value = metadata == null ? null : metadata.get(key);
        return value instanceof String text && !text.isBlank() ? text.trim() : fallback;
    }

    private int metadataNumber(Map<String, Object> metadata, String key, int fallback) {
        Object value = metadata == null ? null : metadata.get(key);
        if (value instanceof Number number) return number.intValue();
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return fallback;
            }
        }
        return fallback;
    }
}
