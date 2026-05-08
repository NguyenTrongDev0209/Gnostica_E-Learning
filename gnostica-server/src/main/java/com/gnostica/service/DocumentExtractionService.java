package com.gnostica.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class DocumentExtractionService {

    public String extractText(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên trống hoặc không tồn tại.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Không thể xác định tên file.");
        }

        String lowerName = originalFilename.toLowerCase();
        
        try (InputStream is = file.getInputStream()) {
            if (lowerName.endsWith(".pdf")) {
                return extractTextFromPdf(is);
            } else if (lowerName.endsWith(".docx")) {
                return extractTextFromDocx(is);
            } else if (lowerName.endsWith(".txt")) {
                return new String(is.readAllBytes());
            } else {
                throw new IllegalArgumentException("Định dạng file không được hỗ trợ. Vui lòng tải lên PDF, DOCX hoặc TXT.");
            }
        }
    }

    private String extractTextFromPdf(InputStream is) throws Exception {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(new org.apache.pdfbox.io.RandomAccessReadBuffer(is))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromDocx(InputStream is) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }
}
