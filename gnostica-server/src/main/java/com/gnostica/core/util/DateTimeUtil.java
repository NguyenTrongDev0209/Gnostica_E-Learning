package com.gnostica.core.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateTimeUtil {

    private static final DateTimeFormatter VN_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter VN_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Định dạng ngày tháng kiểu Việt Nam (VD: 25/12/2023)
     */
    public static String formatToVietnameseDate(LocalDateTime time) {
        if (time == null) return "";
        return time.format(VN_DATE_FORMATTER);
    }

    /**
     * Định dạng ngày giờ kiểu Việt Nam (VD: 25/12/2023 15:30)
     */
    public static String formatToVietnameseDateTime(LocalDateTime time) {
        if (time == null) return "";
        return time.format(VN_DATETIME_FORMATTER);
    }

    /**
     * Hiển thị thời gian trôi qua thân thiện dạng "Time Ago" (VD: 5 phút trước)
     */
    public static String getTimeAgo(LocalDateTime pastTime) {
        if (pastTime == null) return "";
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        long seconds = ChronoUnit.SECONDS.between(pastTime, now);
        
        if (seconds < 0) return "Vừa xong";
        if (seconds < 60) return seconds + " giây trước";
        
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + " phút trước";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " giờ trước";
        
        long days = hours / 24;
        if (days < 30) return days + " ngày trước";
        
        long months = days / 30;
        if (months < 12) return months + " tháng trước";
        
        long years = days / 365;
        return years + " năm trước";
    }
}
