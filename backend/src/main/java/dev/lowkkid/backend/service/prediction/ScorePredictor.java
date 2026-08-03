package dev.lowkkid.backend.service.prediction;

import dev.lowkkid.backend.model.LessonStatsItem;
import dev.lowkkid.backend.model.PeriodStatsDto;

import java.util.List;

/**
 * Estimates the exam result a student is heading for.
 *
 * <p>Only the recent window is handed over: a student who spent the autumn making mistakes and the
 * last month solving everything should be judged by the last month, otherwise the number stays
 * unfairly low right when it matters.
 */
public interface ScorePredictor {

    Prediction predict(Input input);

    /**
     * @param window     counters over the window the estimate is based on
     * @param byLesson   per topic breakdown, including topics never touched, which is a signal of
     *                   its own for the model
     */
    record Input(String subjectName,
                 int windowDays,
                 PeriodStatsDto window,
                 List<LessonStatsItem> byLesson,
                 int lessonsCompleted,
                 int lessonsTotal) {
    }

    /**
     * @param score   estimated exam result on the 0..100 scale
     * @param comment short text shown under the number, in the language of the students
     */
    record Prediction(Integer score, String comment) {
    }
}
