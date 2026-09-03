package dev.lowkkid.tools.qparser.model;

/** One row of {@code answer_options}. */
public class HarvestedOption {

    private String text;
    private boolean correct;

    public HarvestedOption() {
    }

    public HarvestedOption(String text, boolean correct) {
        this.text = text;
        this.correct = correct;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }
}
