package com.gnostica.modules.settings.service;

import com.gnostica.core.model.Banner;
import com.gnostica.core.repository.BannerRepository;
import com.gnostica.modules.settings.dto.request.BannerRequest;
import com.gnostica.modules.settings.dto.response.BannerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BannerService {

    private static final Set<String> POSITIONS = Set.of("HOME_HERO", "HOME_SUB");
    private static final Set<String> TARGET_TYPES = Set.of("NONE", "INTERNAL", "EXTERNAL");

    private final BannerRepository repository;

    public List<BannerResponse> getActiveByPosition(String position) {
        validatePosition(position);
        return repository.findByPositionAndStatusOrderBySortOrderAsc(position, 1)
                .stream().map(BannerResponse::from).toList();
    }

    public List<BannerResponse> getAll() {
        return repository.findAllByOrderByPositionAscSortOrderAsc()
                .stream().map(BannerResponse::from).toList();
    }

    @Transactional
    public BannerResponse create(BannerRequest request) {
        Banner banner = new Banner();
        apply(banner, request);
        return BannerResponse.from(repository.save(banner));
    }

    @Transactional
    public BannerResponse update(Integer id, BannerRequest request) {
        Banner banner = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner"));
        apply(banner, request);
        return BannerResponse.from(repository.save(banner));
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy banner");
        }
        repository.deleteById(id);
    }

    private void apply(Banner banner, BannerRequest request) {
        validatePosition(request.getPosition());
        String targetType = request.getTargetType() == null || request.getTargetType().isBlank()
                ? "NONE" : request.getTargetType().toUpperCase();
        if (!TARGET_TYPES.contains(targetType)) {
            throw new IllegalArgumentException("Kiểu liên kết banner không hợp lệ");
        }
        banner.setTitle(request.getTitle().trim());
        banner.setImageUrl(request.getImageUrl().trim());
        banner.setAltText(request.getAltText());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setTargetType(targetType);
        banner.setPosition(request.getPosition().toUpperCase());
        banner.setSortOrder(request.getSortOrder());
        banner.setStatus(request.getStatus());
    }

    private void validatePosition(String position) {
        if (position == null || !POSITIONS.contains(position.toUpperCase())) {
            throw new IllegalArgumentException("Vị trí banner không hợp lệ");
        }
    }
}
