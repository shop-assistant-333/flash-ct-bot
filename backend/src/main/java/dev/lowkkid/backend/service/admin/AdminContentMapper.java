package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.Section;
import dev.lowkkid.backend.model.admin.AdminAnswerOptionDto;
import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.AdminSectionItem;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Content as the admin panel sees it, answer key included — the mirror image of
 * {@link dev.lowkkid.backend.service.ContentMapper}, which hides exactly that from students.
 */
@Component
public class AdminContentMapper {

    public AdminLessonItem toItem(Lesson lesson, int questionCount) {
        return new AdminLessonItem(
                lesson.getId(),
                lesson.getSubject().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getOrder(),
                lesson.getOpensAt(),
                questionCount,
                lesson.getKind(),
                sectionIdOf(lesson));
    }

    public AdminLessonDto toLesson(Lesson lesson, List<Question> questions) {
        return new AdminLessonDto(
                lesson.getId(),
                lesson.getSubject().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getOrder(),
                lesson.getOpensAt(),
                toQuestions(questions),
                lesson.getKind(),
                sectionIdOf(lesson));
    }

    public AdminSectionItem toSection(Section section) {
        return new AdminSectionItem(
                section.getId(), section.getSubject().getId(), section.getTitle(), section.getOrder());
    }

    private static Integer sectionIdOf(Lesson lesson) {
        return lesson.getSection() == null ? null : lesson.getSection().getId();
    }

    public List<AdminQuestionDto> toQuestions(List<Question> questions) {
        return questions.stream().map(this::toQuestion).toList();
    }

    public AdminQuestionDto toQuestion(Question question) {
        return new AdminQuestionDto(
                question.getId(),
                question.getLesson() == null ? null : question.getLesson().getId(),
                question.getSubject() == null ? null : question.getSubject().getId(),
                question.getTitle(),
                question.getType(),
                question.getOrder(),
                question.getCorrectAnswer(),
                question.getExplanation(),
                question.getAnswerOptions().stream()
                        .sorted(Comparator.comparing(AnswerOption::getId))
                        .map(option -> new AdminAnswerOptionDto(
                                option.getId(), option.getText(), Boolean.TRUE.equals(option.getCorrect())))
                        .toList());
    }
}
