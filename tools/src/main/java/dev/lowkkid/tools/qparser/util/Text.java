package dev.lowkkid.tools.qparser.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;

/** Turning the rich text a test author typed into the plain text our UI renders. */
public final class Text {

    private Text() {
    }

    /**
     * Flattens an element to plain text. The frontend renders titles and explanations as plain
     * text, so tags have to go — but paragraph and line breaks carry meaning in explanations,
     * and are kept as newlines.
     */
    public static String plain(Element element) {
        if (element == null) {
            return null;
        }
        String html = element.html()
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</(p|div|li|tr)\\s*>", "\n\n");
        String text = Jsoup.parse(html).wholeText()
                .replace('\u00a0', ' ')
                .replace('\u202f', ' ')
                // Soft hyphens mark where a word may break; some sites put one in every word,
                // and they are invisible on screen but very much there in the database.
                .replace("\u00ad", "")
                .replaceAll("[ \\t]+", " ")
                .replaceAll(" *\n *", "\n")
                .replaceAll("\n{3,}", "\n\n")
                .trim();
        return text.isEmpty() ? null : text;
    }

    /** Same, but collapsed onto a single line — used for short things like answer options. */
    public static String oneLine(Element element) {
        String text = plain(element);
        return text == null ? null : text.replaceAll("\\s*\n\\s*", " ").trim();
    }
}
