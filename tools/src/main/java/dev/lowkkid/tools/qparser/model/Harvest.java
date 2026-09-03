package dev.lowkkid.tools.qparser.model;

import java.util.ArrayList;
import java.util.List;

/** The JSON file a harvest run writes, and the SQL generator reads. */
public class Harvest {

    private String source;
    private String adapter;
    private String harvestedAt;
    private Integer lessonId;
    private Integer subjectId;
    private int startOrder = 1;
    private List<HarvestedQuestion> questions = new ArrayList<>();

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getAdapter() {
        return adapter;
    }

    public void setAdapter(String adapter) {
        this.adapter = adapter;
    }

    public String getHarvestedAt() {
        return harvestedAt;
    }

    public void setHarvestedAt(String harvestedAt) {
        this.harvestedAt = harvestedAt;
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

    public List<HarvestedQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<HarvestedQuestion> questions) {
        this.questions = questions;
    }
}
