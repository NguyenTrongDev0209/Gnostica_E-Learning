package com.gnostica.core.util;

public class FileUtil {

    /**
     * Lấy đuôi mở rộng của file (VD: "jpg", "mp4")
     */
    public static String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Kiểm tra xem file có phải là định dạng hình ảnh hợp lệ không
     */
    public static boolean isValidImage(String filename) {
        String ext = getFileExtension(filename);
        return ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png") 
               || ext.equals("gif") || ext.equals("webp") || ext.equals("svg");
    }

    /**
     * Định dạng kích thước byte sang định dạng thân thiện (KB, MB, GB)
     */
    public static String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "B";
        return String.format("%.1f %s", bytes / Math.pow(1024, exp), pre);
    }
}
