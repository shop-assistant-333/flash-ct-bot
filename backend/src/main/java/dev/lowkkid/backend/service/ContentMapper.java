package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.model.AnswerOptionDto;
import dev.lowkkid.backend.model.LessonDto;
import dev.lowkkid.backend.model.LessonStatus;
import dev.lowkkid.backend.model.QuestionDto;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Content as the student is allowed to see it: the answer key never leaves the server before the
 * question has been answered.
 */
@Component
public class ContentMapper {

    public LessonDto toLesson(Lesson lesson, LessonStatus status, List<Question> questions) {
        return new LessonDto(
                lesson.getId(),
                lesson.getSubject().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getOrder(),
                lesson.getOpensAt(),
                status,
                toQuestions(questions));
    }

    public List<QuestionDto> toQuestions(List<Question> questions) {
        return questions.stream().map(this::toQuestion).toList();
    }

    public QuestionDto toQuestion(Question question) {
        return new QuestionDto(
                question.getId(),
                question.getTitle(),
                question.getType(),
                question.getOrder(),
                toOptions(question));
    }

    /** Empty for {@link QuestionType#INPUT}, where the student types the answer instead. */
    private List<AnswerOptionDto> toOptions(Question question) {
        if (question.getType() == QuestionType.INPUT) {
            return List.of();
        }
        return question.getAnswerOptions().stream()
                .sorted(Comparator.comparing(AnswerOption::getId))
                .map(option -> new AnswerOptionDto(option.getId(), option.getText()))
                .toList();
    }
}
