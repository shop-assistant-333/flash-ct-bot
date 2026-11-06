package dev.lowkkid.backend;

import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.ApiException;
import dev.lowkkid.backend.exception.ErrorCode;
import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.AdminSectionItem;
import dev.lowkkid.backend.model.admin.LessonRequest;
import dev.lowkkid.backend.model.admin.SectionRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.service.admin.AdminLessonService;
import dev.lowkkid.backend.service.admin.AdminSectionService;
import dev.lowkkid.backend.service.admin.AdminSubjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The programme of a subject: topics, the lessons and the one test under each, and the single
 * order over all of it that reads top to bottom whatever the admin asked for.
 */
@SpringBootTest
@Transactional
class ProgramSectionsTest {

    @Autowired SubjectRepository subjectRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired AdminLessonService adminLessonService;
    @Autowired AdminSectionService adminSectionService;
    @Autowired AdminSubjectService adminSubjectService;

    Integer subjectId;

    @BeforeEach
    void subject() {
        Subject subject = new Subject();
        subject.setName("Предмет " + System.nanoTime());
        subjectId = subjectRepository.saveAndFlush(subject).getId();
    }

    @Test
    void ordersTopicsThenTheirLessonsThenTheTestThenTheRest() {
        AdminSectionItem spelling = section("Орфография");
        AdminSectionItem punctuation = section("Пунктуация");

        AdminLessonDto loose = lesson("Без темы", LessonKind.LESSON, null);
        AdminLessonDto test = lesson("Тест", LessonKind.TEST, spelling.id());
        AdminLessonDto second = lesson("Урок 2", LessonKind.LESSON, punctuation.id());
        AdminLessonDto first = lesson("Урок 1", LessonKind.LESSON, spelling.id());

        assertThat(titles()).containsExactly("Урок 1", "Тест", "Урок 2", "Без темы");

        // The test is asked to go first and the loose lesson into the middle: neither leaves its block.
        adminLessonService.reorder(subjectId, List.of(test.id(), loose.id(), second.id(), first.id()));
        assertThat(titles()).containsExactly("Урок 1", "Тест", "Урок 2", "Без темы");

        adminSectionService.reorder(subjectId, List.of(punctuation.id(), spelling.id()));
        assertThat(titles()).containsExactly("Урок 2", "Урок 1", "Тест", "Без темы");
        assertThat(adminLessonService.findBySubject(subjectId)).extracting(AdminLessonItem::order)
                .containsExactly(1, 2, 3, 4);
    }

    @Test
    void keepsOneTestPerTopic() {
        AdminSectionItem spelling = section("Орфография");
        AdminLessonDto test = lesson("Тест", LessonKind.TEST, spelling.id());
        AdminLessonDto lesson = lesson("Урок", LessonKind.LESSON, spelling.id());

        assertThatThrownBy(() -> lesson("Второй тест", LessonKind.TEST, spelling.id()))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo(ErrorCode.SECTION_HAS_TEST));
        assertThatThrownBy(() -> adminLessonService.update(lesson.id(), new LessonRequest(
                subjectId, "Урок", null, null, null, LessonKind.TEST, spelling.id())))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo(ErrorCode.SECTION_HAS_TEST));

        // Saving the test itself again is not a second test.
        adminLessonService.update(test.id(), new LessonRequest(
                subjectId, "Тест по орфографии", null, null, null, null, spelling.id()));
        assertThat(adminLessonService.get(test.id()).kind()).isEqualTo(LessonKind.TEST);
    }

    @Test
    void refusesATopicOfAnotherSubject() {
        Subject other = new Subject();
        other.setName("Другой " + System.nanoTime());
        Integer otherId = subjectRepository.saveAndFlush(other).getId();
        AdminSectionItem foreign = adminSectionService.create(new SectionRequest(otherId, "Чужая"));

        assertThatThrownBy(() -> lesson("Урок", LessonKind.LESSON, foreign.id()))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo(ErrorCode.BAD_REQUEST));
    }

    @Test
    void deletingATopicLeavesItsLessonsOutsideEveryTopic() {
        AdminSectionItem spelling = section("Орфография");
        AdminSectionItem punctuation = section("Пунктуация");
        lesson("Урок 1", LessonKind.LESSON, spelling.id());
        lesson("Тест", LessonKind.TEST, spelling.id());
        lesson("Урок 2", LessonKind.LESSON, punctuation.id());

        adminSectionService.delete(spelling.id());

        assertThat(adminSectionService.findBySubject(subjectId)).extracting(AdminSectionItem::order)
                .containsExactly(1);
        assertThat(titles()).containsExactly("Урок 2", "Урок 1", "Тест");
        assertThat(adminLessonService.findBySubject(subjectId))
                .filteredOn(item -> !item.title().equals("Урок 2"))
                .extracting(AdminLessonItem::sectionId)
                .containsOnlyNulls();
    }

    @Test
    void leavesTestQuestionsOutOfPractice() {
        AdminLessonDto lesson = lesson("Урок", LessonKind.LESSON, null);
        AdminLessonDto test = lesson("Тест", LessonKind.TEST, null);
        Integer lessonQuestion = question(lesson.id());
        question(test.id());

        assertThat(questionRepository.findByLesson_Subject_IdAndLesson_Kind(subjectId, LessonKind.LESSON))
                .extracting(Question::getId)
                .containsExactly(lessonQuestion);
        assertThat(lessonRepository.countBySubject_IdAndKind(subjectId, LessonKind.LESSON)).isEqualTo(1);
    }

    @Test
    void deletesASubjectWithOnlyEmptyTopicsLeft() {
        section("Орфография");
        adminSubjectService.delete(subjectId);
        assertThat(subjectRepository.findById(subjectId)).isEmpty();
    }

    private AdminSectionItem section(String title) {
        return adminSectionService.create(new SectionRequest(subjectId, title));
    }

    private AdminLessonDto lesson(String title, LessonKind kind, Integer sectionId) {
        return adminLessonService.create(new LessonRequest(subjectId, title, null, null, null, kind, sectionId));
    }

    private Integer question(Integer lessonId) {
        Question question = new Question();
        question.setTitle("Вопрос");
        question.setType(QuestionType.INPUT);
        question.setCorrectAnswer("да");
        question.setOrder(1);
        question.setLesson(lessonRepository.getReferenceById(lessonId));
        return questionRepository.saveAndFlush(question).getId();
    }

    private List<String> titles() {
        return adminLessonService.findBySubject(subjectId).stream().map(AdminLessonItem::title).toList();
    }
}
