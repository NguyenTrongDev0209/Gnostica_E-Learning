package com.gnostica.modules.settings.service;

import com.gnostica.core.model.SystemConfig;
import com.gnostica.core.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    public static final Map<String, SettingDefinition> DEFINITIONS = new LinkedHashMap<>();

    static {
        define("site.name", "STRING", "Tên website", true, 255);
        define("site.tagline", "STRING", "Slogan website", true, 255);
        define("site.logo_url", "URL", "Logo chính", true, 1000);
        define("site.favicon_url", "URL", "Favicon", true, 1000);
        define("site.contact_email", "STRING", "Email liên hệ", true, 255);
        define("site.contact_phone", "STRING", "Số điện thoại liên hệ", true, 100);
        define("site.address", "TEXT", "Địa chỉ văn phòng", true, 1000);
        define("site.map_embed_url", "URL", "Đường dẫn bản đồ nhúng", true, 3000);
        define("footer.description", "TEXT", "Giới thiệu ở chân trang", true, 3000);
        define("footer.copyright", "STRING", "Thông tin bản quyền", true, 500);
        define("footer.social_links", "JSON", "Liên kết mạng xã hội", true, 5000);
        define("footer.link_groups", "JSON", "Nhóm liên kết chân trang", true, 10000);
        define("about.content", "JSON", "Nội dung trang Giới thiệu", true, 50000);
        define("about.hero_banner_url", "URL", "Banner đầu trang Giới thiệu", true, 1000);
        define("about.solutions_banner_url", "URL", "Banner giải pháp trang Giới thiệu", true, 1000);
        define("about.vision_banner_url", "URL", "Banner tầm nhìn trang Giới thiệu", true, 1000);
    }

    private final SystemConfigRepository repository;

    public Map<String, String> getPublicSettings() {
        return getSettings(DEFINITIONS.entrySet().stream()
                .filter(entry -> entry.getValue().publicSetting())
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toSet()));
    }

    public Map<String, String> getAdminSettings() {
        return getSettings(DEFINITIONS.keySet());
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, String> values) {
        if (values == null) {
            throw new IllegalArgumentException("Danh sách cấu hình không được để trống");
        }

        for (Map.Entry<String, String> entry : values.entrySet()) {
            SettingDefinition definition = DEFINITIONS.get(entry.getKey());
            if (definition == null) {
                throw new IllegalArgumentException("Khóa cấu hình không được hỗ trợ: " + entry.getKey());
            }

            String value = entry.getValue() == null ? "" : entry.getValue().trim();
            if (value.length() > definition.maxLength()) {
                throw new IllegalArgumentException("Giá trị quá dài cho cấu hình: " + entry.getKey());
            }

            SystemConfig config = repository.findByConfigKey(entry.getKey()).orElseGet(() ->
                    SystemConfig.builder()
                            .configKey(entry.getKey())
                            .configType(definition.type())
                            .description(definition.description())
                            .build());
            config.setConfigValue(value);
            config.setConfigType(definition.type());
            config.setDescription(definition.description());
            repository.save(config);
        }

        return getAdminSettings();
    }

    public BigDecimal getDecimal(String key, BigDecimal fallback) {
        return repository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .filter(value -> value != null && !value.isBlank())
                .map(value -> {
                    try {
                        return new BigDecimal(value);
                    } catch (NumberFormatException ignored) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }



    private Map<String, String> getSettings(Set<String> keys) {
        Map<String, String> result = new LinkedHashMap<>();
        keys.forEach(key -> result.put(key, ""));

        List<SystemConfig> configs = repository.findByConfigKeyIn(keys);
        configs.forEach(config -> result.put(config.getConfigKey(), config.getConfigValue()));
        return result;
    }

    private static void define(String key, String type, String description, boolean publicSetting, int maxLength) {
        DEFINITIONS.put(key, new SettingDefinition(type, description, publicSetting, maxLength));
    }

    public record SettingDefinition(
            String type,
            String description,
            boolean publicSetting,
            int maxLength
    ) {
    }
}
