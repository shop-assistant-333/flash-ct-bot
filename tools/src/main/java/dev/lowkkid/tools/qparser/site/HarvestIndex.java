package dev.lowkkid.tools.qparser.site;

import dev.lowkkid.tools.qparser.model.HarvestedQuestion;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * What a harvest already has, so a walk knows what to skip. Two kinds of repeat show up:
 * questions collected by an earlier run, recognised by their id on the source site, and
 * questions the test author entered twice under different ids, recognisable only by their text.
 */
public final class HarvestIndex {

    private final Set<String> sourceIds = new LinkedHashSet<>();
    private final Set<String> titles = new LinkedHashSet<>();
    private final boolean dedupeByTitle;

    public HarvestIndex(List<HarvestedQuestion> known, boolean dedupeByTitle) {
        this.dedupeByTitle = dedupeByTitle;
        known.forEach(this::record);
    }

    public int knownCount() {
        return sourceIds.size();
    }

    public boolean knowsSourceId(String sourceId) {
        return sourceIds.contains(sourceId);
    }

    public boolean knowsTitle(String title) {
        return dedupeByTitle && titles.contains(normalise(title));
    }

    public void record(HarvestedQuestion question) {
        sourceIds.add(question.getSourceId());
        titles.add(normalise(question.getTitle()));
    }

    private static String normalise(String title) {
        return title == null ? "" : title.replaceAll("\\s+", " ").trim().toLowerCase();
    }
}
