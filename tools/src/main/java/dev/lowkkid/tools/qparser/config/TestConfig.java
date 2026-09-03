package dev.lowkkid.tools.qparser.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/** One YAML file per test being harvested. See {@code tools/configs} for examples. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestConfig {

    private String url;
    private String adapter = "onlinetestpad";

    /** How many questions to collect. Null means "walk the whole test". */
    private Integer limit;

    /**
     * Exactly one of {@link #lessonId} / {@link #subjectId} must be set: the database has a
     * check constraint saying a question belongs either to a lesson or to a subject's practice.
     */
    private Integer lessonId;
    private Integer subjectId;

    private int startOrder = 1;

    /** Values for fields the test asks for before it starts, keyed by input name. */
    private Map<String, String> prefill = new LinkedHashMap<>();

    /**
     * Drop a question whose text a collected question already has. Tests sometimes carry the
     * same question twice under different ids, and the ids alone cannot tell them apart.
     */
    private boolean dedupeByTitle = true;

    /** Pause between requests, to stay a polite guest on someone else's site. */
    private int delayMs = 400;

    private String out;

    public static TestConfig load(Path path) throws IOException {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        TestConfig config = mapper.readValue(Files.readString(path), TestConfig.class);
        config.validate(path);
        return config;
    }

    private void validate(Path path) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException(path + ": 'url' is required");
        }
        if ((lessonId == null) == (subjectId == null)) {
            throw new IllegalArgumentException(
                    path + ": set exactly one of 'lessonId' (question inside a lesson) or "
                            + "'subjectId' (question in the practice tab)");
        }
        if (limit != null && limit < 1) {
            throw new IllegalArgumentException(path + ": 'limit' must be positive");
        }
        if (out == null || out.isBlank()) {
            throw new IllegalArgumentException(path + ": 'out' is required");
        }
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getAdapter() {
        return adapter;
    }

    public void setAdapter(String adapter) {
        this.adapter = adapter;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public int limitOrAll() {
        return limit == null ? Integer.MAX_VALUE : limit;
    }

    public Integer getLessonId() {
        return lessonId;
    }

    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public int getStartOrder() {
        return startOrder;
    }

    public void setStartOrder(int startOrder) {
        this.startOrder = startOrder;
    }

    public Map<String, String> getPrefill() {
        return prefill;
    }

    public void setPrefill(Map<String, String> prefill) {
        this.prefill = prefill;
    }

    public boolean isDedupeByTitle() {
        return dedupeByTitle;
    }

    public void setDedupeByTitle(boolean dedupeByTitle) {
        this.dedupeByTitle = dedupeByTitle;
    }

    public int getDelayMs() {
        return delayMs;
    }

    public void setDelayMs(int delayMs) {
        this.delayMs = delayMs;
    }

    public String getOut() {
        return out;
    }

    public void setOut(String out) {
        this.out = out;
    }
}
