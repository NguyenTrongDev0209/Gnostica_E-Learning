package com.gnostica.util;

import lombok.extern.slf4j.Slf4j;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class VttParserUtil {

    /**
     * Cleans up raw WebVTT content into an aggregated timestamped format optimal for AI parsing.
     * Input: Standard .vtt file
     * Output: "[00:00] Xin chào. [00:05] Hôm nay..."
     */
    public static String parseAndCompressVtt(String vttContent) {
        if (vttContent == null || vttContent.isBlank()) {
            return "";
        }

        StringBuilder result = new StringBuilder();
        // Standard VTT block regex: timestamp regex matching "HH:MM:SS.mmm --> HH:MM:SS.mmm"
        // We capture the start timestamp in HH:MM:SS or MM:SS format.
        Pattern timePattern = Pattern.compile("(\\d{2}:\\d{2}(?::\\d{2})?)\\.\\d{3}\\s+-->");
        
        String[] lines = vttContent.split("\\r?\\n");
        
        String currentTimestamp = "";
        StringBuilder sentenceBuilder = new StringBuilder();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            
            // Skip header or empty lines
            if (line.isEmpty() || line.equalsIgnoreCase("WEBVTT") || line.matches("\\d+")) {
                continue;
            }

            Matcher matcher = timePattern.matcher(line);
            if (matcher.find()) {
                // If there was a accumulated sentence, commit it before setting new timestamp
                if (sentenceBuilder.length() > 0) {
                    result.append("[").append(currentTimestamp).append("] ")
                          .append(sentenceBuilder.toString().trim()).append(" ");
                    sentenceBuilder.setLength(0);
                }
                currentTimestamp = matcher.group(1);
            } else {
                // It's text, append to builder
                sentenceBuilder.append(line).append(" ");
            }
        }

        // Commit final sentence
        if (sentenceBuilder.length() > 0) {
            result.append("[").append(currentTimestamp).append("] ")
                  .append(sentenceBuilder.toString().trim());
        }

        return result.toString().trim();
    }
}
