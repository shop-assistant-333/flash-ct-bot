package dev.lowkkid.tools.qparser.site;

import java.util.List;
import java.util.stream.Collectors;

public final class Adapters {

    private static final List<SiteAdapter> ALL = List.of(new OnlineTestPadAdapter());

    private Adapters() {
    }

    public static SiteAdapter byId(String id) {
        return ALL.stream()
                .filter(adapter -> adapter.id().equalsIgnoreCase(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown adapter '" + id + "'. Known: " + known()));
    }

    public static String known() {
        return ALL.stream().map(SiteAdapter::id).collect(Collectors.joining(", "));
    }
}
