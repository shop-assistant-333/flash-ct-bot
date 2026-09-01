package dev.lowkkid.backend;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserAnswer;
import dev.lowkkid.backend.entity.UserAttempt;
import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.ErrorCode;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.service.admin.AdminLessonService;
import dev.lowkkid.backend.service.admin.AdminSubjectService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The two rules of removing content: a lesson goes away whatever the students have done with it,
 * a subject only once it is empty — and then it says what is still inside.
 */
@SpringBootTest
@Transactional
class AdminContentDeletionTest {

    @Autowired SubjectRepository subjectRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired UserRepository userRepository;
    @Autowired UserAttemptRepository attemptRepository;
    @Autowired UserAnswerRepository answerRepository;
    @Autowired AdminLessonService adminLessonService;
    @Autowired AdminSubjectService adminSubjectService;
    @Autowired EntityManager entityManager;

    @Test
    void deletesASolvedLessonWithEverythingRecordedAboutIt() {
        Subject subject = new Subject();
        subject.setName("Предмет " + System.nanoTime());
        subject = subjectRepository.saveAndFlush(subject);

        Lesson lesson = new Lesson();
        lesson.setTitle("Урок");
        lesson.setOrder(1);
        lesson.setSubject(subject);
        lesson = lessonRepository.saveAndFlush(lesson);

        Lesson survivor = new Lesson();
        survivor.setTitle("Второй урок");
        survivor.setOrder(2);
        survivor.setSubject(subject);
        survivor = lessonRepository.saveAndFlush(survivor);

        Question question = new Question();
        question.setTitle("Вопрос");
        question.setType(QuestionType.SINGLE_ANSWER);
        question.setOrder(1);
        question.setLesson(lesson);
        AnswerOption option = new AnswerOption();
        option.setText("Верно");
        option.setCorrect(true);
        option.setQuestion(question);
        question.getAnswerOptions().add(option);
        question = questionRepository.saveAndFlush(question);

        User student = new User();
        student.setUsername("s_" + System.nanoTime());
        student.setRole(UserRole.USER);
        student = userRepository.saveAndFlush(student);

        UserAttempt attempt = new UserAttempt();
        attempt.setUser(student);
        attempt.setLesson(lesson);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setCompletedAt(LocalDateTime.now());
        attempt = attemptRepository.saveAndFlush(attempt);

        UserAnswer answer = new UserAnswer();
        answer.setAttempt(attempt);
        answer.setQuestion(question);
        answer.setCorrect(true);
        answer.setAnsweredAt(LocalDateTime.now());
        answer.getSelectedOptions().add(question.getAnswerOptions().getFirst());
        answerRepository.saveAndFlush(answer);

        Integer lessonId = lesson.getId();
        Integer questionId = question.getId();
        Long attemptId = attempt.getId();
        Long answerId = answer.getId();

        // The service runs in its own transaction in production: it must find the questions and
        // attempts in the database, not in the collections this test happens to hold.
        entityManager.flush();
        entityManager.clear();

        adminLessonService.delete(lessonId);
        entityManager.flush();
        entityManager.clear();

        assertThat(lessonRepository.findById(lessonId)).isEmpty();
        assertThat(questionRepository.findById(questionId)).isEmpty();
        assertThat(attemptRepository.findById(attemptId)).isEmpty();
        assertThat(answerRepository.findById(answerId)).isEmpty();
        assertThat(joinRowsOf(answerId)).isZero();

        // The subject keeps a clean 1..n after the removal.
        List<Lesson> left = lessonRepository.findBySubject_IdOrderByOrderAsc(subject.getId());
        assertThat(left).extracting(Lesson::getId).containsExactly(survivor.getId());
        assertThat(left).extracting(Lesson::getOrder).containsExactly(1);
    }

    private long joinRowsOf(Long answerId) {
        return ((Number) entityManager
                .createNativeQuery("select count(*) from user_answer_options where user_answer_id = :id")
                .setParameter("id", answerId)
                .getSingleResult()).longValue();
    }

    @Test
    void refusesToDeleteASubjectThatStillHasLessons() {
        Subject subject = new Subject();
        subject.setName("Предмет " + System.nanoTime());
        subject = subjectRepository.saveAndFlush(subject);

        Lesson lesson = new Lesson();
        lesson.setTitle("Урок");
        lesson.setOrder(1);
        lesson.setSubject(subject);
        lessonRepository.saveAndFlush(lesson);

        Integer subjectId = subject.getId();
        assertThatThrownBy(() -> adminSubjectService.delete(subjectId))
                .isInstanceOf(ConflictException.class)
                .extracting(error -> ((ConflictException) error).getCode())
                .isEqualTo(ErrorCode.SUBJECT_HAS_LESSONS);
    }
}
