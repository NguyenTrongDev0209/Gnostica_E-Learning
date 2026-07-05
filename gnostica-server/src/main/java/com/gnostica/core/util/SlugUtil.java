package com.gnostica.core.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_DASHES = Pattern.compile("^-|-$");

    /**
     * Chuyển đổi một chuỗi tiếng Việt thành chuỗi slug thân thiện với URL.
     * Ví dụ: "Khóa học Spring Boot" -> "khoa-hoc-spring-boot"
     */
    public static String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "";
        
        // Đổi khoảng trắng thành dấu gạch ngang
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        
        // Loại bỏ dấu tiếng Việt
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Loại bỏ ký tự đặc biệt không phải tiếng Anh hoặc số
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        
        // Rút gọn các dấu gạch ngang liên tiếp và cắt bỏ ở 2 đầu
        slug = slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-");
        slug = EDGES_DASHES.matcher(slug).replaceAll("");
        
        return slug;
    }
}
