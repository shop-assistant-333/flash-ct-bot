package dev.lowkkid.tools.qparser.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

/**
 * A question in the canonical, site-independent shape. Adapters produce these; the SQL
 * generator is the only place that knows about the database schema.
 */
public class HarvestedQuestion {

    /**
     * Identifier of the question on the source site. Stable across sessions, which is what
     * makes re-runs able to skip what a previous run already collected.
     */
    private String sourceId;

    private QuestionType type;
    private String title;

    /** Set for {@link QuestionType#INPUT} only. */
    private String correctAnswer;

    private String explanation;
    private List<HarvestedOption> options = new ArrayList<>();

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<HarvestedOption> getOptions() {
        return options;
    }

    public void setOptions(List<HarvestedOption> options) {
        this.options = options;
    }

    /** True once the question carries everything the database needs. */
    @JsonIgnore
    public boolean isComplete() {
        if (type == QuestionType.INPUT) {
            return correctAnswer != null && !correctAnswer.isBlank();
        }
        return options.stream().anyMatch(HarvestedOption::isCorrect);
    }
}
