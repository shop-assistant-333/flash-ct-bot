package dev.lowkkid.backend.service.prediction;

import dev.lowkkid.backend.model.LessonStatsItem;

import java.util.Comparator;

/**
 * Estimate computed here rather than asked of a model, used while {@code app.ai.api-key} is not
 * filled in.
 *
 * <p>It is deliberately plain arithmetic: the accuracy of the window, pulled down a little for
 * every topic of the subject the student has not touched yet, since an exam covers the whole
 * programme and not only the part that was practised. The comment says where the number came
 * from, so nobody mistakes it for the model based one.
 */
public class LocalScorePredictor implements ScorePredictor {

    /** How much of the estimate is the coverage of the programme rather than the accuracy. */
    private static final double COVERAGE_WEIGHT = 0.25;

    @Override
    public Prediction predict(Input input) {
        double accuracy = input.window().accuracyPercent();
        double coverage = coverage(input);
        int score = (int) Math.round(accuracy * (1 - COVERAGE_WEIGHT) + accuracy * coverage * COVERAGE_WEIGHT);

        return new Prediction(Math.clamp(score, 0, 100), comment(input, coverage));
    }

    /** Share of the topics of the subject the student has solved at least something in. */
    private static double coverage(Input input) {
        if (input.byLesson().isEmpty()) {
            return 1;
        }
        long touched = input.byLesson().stream().filter(lesson -> lesson.total() > 0).count();
        return (double) touched / input.byLesson().size();
    }

    private static String comment(Input input, double coverage) {
        StringBuilder comment = new StringBuilder("Оценка рассчитана по вашим ответам за последние ")
                .append(input.windowDays())
                .append(" дней: ")
                .append(input.window().correct())
                .append(" из ")
                .append(input.window().answered())
                .append(" верно.");

        if (coverage < 1) {
            comment.append(" Часть тем ещё не пройдена, поэтому оценка занижена — ")
                    .append(weakest(input))
                    .append('.');
        }
        return comment.toString();
    }

    /** Points at what to work on: the weakest solved topic, or the first untouched one. */
    private static String weakest(Input input) {
        return input.byLesson().stream()
                .filter(lesson -> lesson.total() == 0)
                .map(lesson -> "начните с темы «" + lesson.title() + "»")
                .findFirst()
                .orElseGet(() -> input.byLesson().stream()
                        .min(Comparator.comparingInt(LessonStatsItem::accuracyPercent))
                        .map(lesson -> "слабее всего идёт тема «" + lesson.title() + "»")
                        .orElse("продолжайте решать уроки"));
    }
}
