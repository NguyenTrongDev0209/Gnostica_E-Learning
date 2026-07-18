package com.gnostica.core.util;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Conservative sanitizer for administrator-authored policy content.
 * All tag attributes are removed except safe HTTP(S), mailto and tel links.
 */
public final class PolicyHtmlSanitizer {
    private static final Set<String> ALLOWED_TAGS = Set.of(
            "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote",
            "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "a");
    private static final Set<String> VOID_TAGS = Set.of("br");
    private static final Pattern COMMENTS = Pattern.compile("<!--.*?-->", Pattern.DOTALL);
    private static final Pattern TAGS = Pattern.compile("<\\s*(/?)\\s*([a-zA-Z0-9]+)([^>]*)>");
    private static final Pattern HREF = Pattern.compile(
            "(?i)\\bhref\\s*=\\s*(['\"])(https?://|mailto:|tel:)(.*?)\\1");

    private PolicyHtmlSanitizer() {
    }

    public static String sanitize(String html) {
        if (html == null || html.isBlank()) return "";

        String withoutComments = COMMENTS.matcher(html).replaceAll("");
        Matcher matcher = TAGS.matcher(withoutComments);
        StringBuffer safe = new StringBuffer();

        while (matcher.find()) {
            boolean closing = !matcher.group(1).isEmpty();
            String tag = matcher.group(2).toLowerCase();
            String replacement = "";

            if (ALLOWED_TAGS.contains(tag)) {
                if (closing) {
                    if (!VOID_TAGS.contains(tag)) replacement = "</" + tag + ">";
                } else if ("a".equals(tag)) {
                    Matcher hrefMatcher = HREF.matcher(matcher.group(3));
                    if (hrefMatcher.find()) {
                        String href = hrefMatcher.group(2) + hrefMatcher.group(3);
                        replacement = "<a href=\"" + escapeAttribute(href) + "\" rel=\"noopener noreferrer\">";
                    } else {
                        replacement = "<a>";
                    }
                } else {
                    replacement = "<" + tag + ">";
                }
            }

            matcher.appendReplacement(safe, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(safe);
        return safe.toString();
    }

    private static String escapeAttribute(String value) {
        return value.replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
