package com.gnostica.modules.integration.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xssf.extractor.XSSFExcelExtractor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.io.InputStream;

@Service
@Slf4j
public class DocumentExtractionService {

    /** Minimum character count after extraction to be considered usable content */
    private static final int MIN_CONTENT_LENGTH = 200;

    public String extractText(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên trống hoặc không tồn tại. Vui lòng chọn lại file.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Không thể xác định tên file. Vui lòng thử lại.");
        }

        String lowerName = originalFilename.toLowerCase();
        String extractedText;

        try (InputStream is = file.getInputStream()) {
            if (lowerName.endsWith(".pdf")) {
                extractedText = extractTextFromPdf(is, originalFilename);
            } else if (lowerName.endsWith(".docx")) {
                extractedText = extractTextFromDocx(is, originalFilename);
            } else if (lowerName.endsWith(".xlsx")) {
                extractedText = extractTextFromXlsx(is, originalFilename);
            } else if (lowerName.endsWith(".txt")) {
                extractedText = new String(is.readAllBytes());
            } else {
                throw new IllegalArgumentException(
                    "Định dạng file \"" + getExtension(originalFilename) + "\" không được hỗ trợ. " +
                    "Vui lòng tải lên file có định dạng: PDF, DOCX, XLSX hoặc TXT."
                );
            }
        }

        // --- Post-extraction content validation ---
        if (extractedText == null || extractedText.isBlank()) {
            throw new IllegalArgumentException(
                "Không tìm thấy nội dung văn bản trong file \"" + originalFilename + "\". " +
                "File có thể là ảnh scan (PDF scan) hoặc chỉ chứa hình ảnh mà không có chữ. " +
                "Vui lòng sử dụng file chứa văn bản thực sự."
            );
        }

        String stripped = extractedText.replaceAll("[\\s\\p{Punct}]", "");
        if (stripped.length() < MIN_CONTENT_LENGTH) {
            throw new IllegalArgumentException(
                "Nội dung trong file \"" + originalFilename + "\" quá ngắn (" + stripped.length() + " ký tự có nghĩa). " +
                "Cần ít nhất " + MIN_CONTENT_LENGTH + " ký tự để AI có thể sinh câu hỏi chất lượng. " +
                "Vui lòng tải lên file có nhiều nội dung hơn."
            );
        }

        log.info("Extracted {} characters from file '{}'.", extractedText.length(), originalFilename);
        return extractedText;
    }

    private String extractTextFromPdf(InputStream is, String filename) throws Exception {
        try {
            PDDocument document = org.apache.pdfbox.Loader.loadPDF(new org.apache.pdfbox.io.RandomAccessReadBuffer(is));
            try (document) {
                if (document.isEncrypted()) {
                    throw new IllegalArgumentException(
                        "File PDF \"" + filename + "\" đang bị mã hóa (có mật khẩu). " +
                        "Vui lòng gỡ bỏ mật khẩu trước khi tải lên."
                    );
                }
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw our own validation exceptions
        } catch (Exception e) {
            log.warn("Failed to extract text from PDF '{}': {}", filename, e.getMessage());
            throw new IllegalArgumentException(
                "Không thể đọc file PDF \"" + filename + "\". " +
                "File có thể bị hỏng hoặc không đúng định dạng PDF. Vui lòng kiểm tra lại file."
            );
        }
    }

    private String extractTextFromDocx(InputStream is, String filename) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        } catch (Exception e) {
            log.warn("Failed to extract text from DOCX '{}': {}", filename, e.getMessage());
            throw new IllegalArgumentException(
                "Không thể đọc file DOCX \"" + filename + "\". " +
                "File có thể bị hỏng, đang được mã hóa, hoặc ở định dạng DOC cũ (không phải DOCX). " +
                "Vui lòng lưu lại dưới dạng .docx và thử lại."
            );
        }
    }

    private String extractTextFromXlsx(InputStream is, String filename) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(is);
             XSSFExcelExtractor extractor = new XSSFExcelExtractor(wb)) {
            extractor.setFormulasNotResults(false);
            extractor.setIncludeSheetNames(false);
            return extractor.getText();
        } catch (Exception e) {
            log.warn("Failed to extract text from XLSX '{}': {}", filename, e.getMessage());
            throw new IllegalArgumentException(
                "Không thể đọc file Excel \"" + filename + "\". " +
                "File có thể bị hỏng hoặc ở định dạng .xls cũ (chưa được hỗ trợ). " +
                "Vui lòng lưu lại dưới dạng .xlsx và thử lại."
            );
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "(không rõ)";
    }
}
