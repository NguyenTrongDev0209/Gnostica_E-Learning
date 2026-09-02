package com.gnostica.modules.settings.service;

import com.gnostica.core.model.Term;
import com.gnostica.core.model.TermModule;
import com.gnostica.core.repository.TermModuleRepository;
import com.gnostica.core.repository.TermRepository;
import com.gnostica.core.util.PolicyHtmlSanitizer;
import com.gnostica.modules.settings.dto.request.TermModuleRequest;
import com.gnostica.modules.settings.dto.request.TermRequest;
import com.gnostica.modules.settings.dto.response.TermModuleResponse;
import com.gnostica.modules.settings.dto.response.TermResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TermService {

    private final TermRepository terms;
    private final TermModuleRepository modules;

    public List<TermModuleResponse> adminTree() {
        return tree(false);
    }

    public List<TermModuleResponse> publicTree() {
        return tree(true);
    }

    private List<TermModuleResponse> tree(boolean published) {
        List<TermModule> ms = published
                ? modules.findAllByStatusOrderBySortOrderAscTitleAsc(1)
                : modules.findAllByOrderBySortOrderAscTitleAsc();

        return ms.stream()
                .map(m -> TermModuleResponse.from(
                        m,
                        (published
                                ? terms.findAllByTermModuleIdAndStatusOrderBySortOrderAscTitleAsc(m.getId(), 1)
                                : terms.findAllByTermModuleIdOrderBySortOrderAscTitleAsc(m.getId())
                        ).stream().map(TermResponse::from).toList()
                ))
                .toList();
    }

    public TermResponse publicTerm(String path) {
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("Đường dẫn không hợp lệ");
        }

        String clean = path.replaceFirst("^/+", "");
        String withSlash = "/" + clean;
        String withTerms = clean.startsWith("terms/") ? "/" + clean : "/terms/" + clean;
        String withoutTerms = clean.replaceFirst("^terms/", "");

        return terms.findByUrlPathAndStatus(withTerms, 1)
                .or(() -> terms.findByUrlPathAndStatus(withSlash, 1))
                .or(() -> terms.findByUrlPathAndStatus(clean, 1))
                .or(() -> terms.findByUrlPathAndStatus("/" + withoutTerms, 1))
                .or(() -> terms.findByUrlPathAndStatus(withoutTerms, 1))
                .map(TermResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy điều khoản"));
    }

    @Transactional
    public TermModuleResponse createModule(TermModuleRequest r) {
        TermModule m = new TermModule();
        apply(m, r);
        return TermModuleResponse.from(modules.save(m), List.of());
    }

    @Transactional
    public TermModuleResponse updateModule(Integer id, TermModuleRequest r) {
        TermModule m = modules.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mục"));
        apply(m, r);
        return TermModuleResponse.from(modules.save(m), List.of());
    }

    @Transactional
    public void deleteModule(Integer id) {
        if (terms.existsByTermModuleId(id)) {
            throw new IllegalArgumentException("Hãy xóa hoặc chuyển các trang con trước");
        }
        modules.deleteById(id);
    }

    @Transactional
    public TermResponse createTerm(TermRequest r) {
        String normalizedUrl = normalizeUrlPath(r.getUrlPath());
        if (terms.findByUrlPath(normalizedUrl).isPresent() || terms.findByUrlPath(r.getUrlPath()).isPresent()) {
            throw new IllegalArgumentException("Đường dẫn URL đã tồn tại");
        }
        Term t = new Term();
        apply(t, r);
        t.setUrlPath(normalizedUrl);
        return TermResponse.from(terms.save(t));
    }

    @Transactional
    public TermResponse updateTerm(Integer id, TermRequest r) {
        Term t = terms.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy điều khoản"));
        String normalizedUrl = normalizeUrlPath(r.getUrlPath());
        terms.findByUrlPath(normalizedUrl).filter(x -> !x.getId().equals(id)).ifPresent(x -> {
            throw new IllegalArgumentException("Đường dẫn URL đã tồn tại");
        });
        terms.findByUrlPath(r.getUrlPath()).filter(x -> !x.getId().equals(id)).ifPresent(x -> {
            throw new IllegalArgumentException("Đường dẫn URL đã tồn tại");
        });
        apply(t, r);
        t.setUrlPath(normalizedUrl);
        return TermResponse.from(terms.save(t));
    }

    @Transactional
    public void deleteTerm(Integer id) {
        terms.deleteById(id);
    }

    private String normalizeUrlPath(String urlPath) {
        if (urlPath == null) return "/terms";
        String trimmed = urlPath.trim().toLowerCase();
        if (!trimmed.startsWith("/")) {
            trimmed = "/" + trimmed;
        }
        return trimmed;
    }

    private void apply(TermModule m, TermModuleRequest r) {
        m.setTitle(r.getTitle().trim());
        m.setSortOrder(r.getSortOrder() != null ? r.getSortOrder() : 0);
        m.setStatus(r.getStatus() != null ? r.getStatus() : 1);
        m.setMetadata(r.getMetadata() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(r.getMetadata()));
    }

    private void apply(Term t, TermRequest r) {
        t.setTermModule(modules.findById(r.getTermModuleId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mục")));
        t.setTitle(r.getTitle().trim());
        t.setUrlPath(normalizeUrlPath(r.getUrlPath()));
        t.setContent(PolicyHtmlSanitizer.sanitize(r.getContent()));
        t.setSortOrder(r.getSortOrder() != null ? r.getSortOrder() : 0);
        t.setStatus(r.getStatus() != null ? r.getStatus() : 1);
        t.setMetadata(r.getMetadata() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(r.getMetadata()));
    }
}
