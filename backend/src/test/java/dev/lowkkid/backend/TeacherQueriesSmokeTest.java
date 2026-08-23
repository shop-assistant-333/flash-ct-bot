package dev.lowkkid.backend;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.Subscription;
import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.model.admin.AdminUserDto;
import dev.lowkkid.backend.model.admin.AdminUserItem;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.SubscriptionRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.admin.AdminSubjectService;
import dev.lowkkid.backend.service.admin.AdminUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TeacherQueriesSmokeTest {

    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired SubscriptionRepository subscriptionRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired UserAnswerRepository userAnswerRepository;
    @Autowired AdminUserService adminUserService;
    @Autowired AdminSubjectService adminSubjectService;

    @Test
    void everyNewQueryActuallyRuns() {
        Subject mine = subject("Мой предмет");
        Subject foreign = subject("Чужой предмет");

        User teacher = new User();
        teacher.setUsername("t_" + System.nanoTime());
        teacher.setRole(UserRole.TEACHER);
        teacher.getTaughtSubjects().add(mine);
        teacher = userRepository.saveAndFlush(teacher);

        User student = new User();
        student.setUsername("s_" + System.nanoTime());
        student.setRole(UserRole.USER);
        student = userRepository.saveAndFlush(student);

        subscribe(student, mine);

        User outsider = new User();
        outsider.setUsername("o_" + System.nanoTime());
        outsider.setRole(UserRole.USER);
        outsider = userRepository.saveAndFlush(outsider);
        subscribe(outsider, foreign);

        Lesson lesson = new Lesson();
        lesson.setTitle("Урок");
        lesson.setOrder(1);
        lesson.setSubject(mine);
        lesson = lessonRepository.saveAndFlush(lesson);

        Question lessonQuestion = new Question();
        lessonQuestion.setTitle("Вопрос урока");
        lessonQuestion.setType(QuestionType.INPUT);
        lessonQuestion.setCorrectAnswer("да");
        lessonQuestion.setOrder(1);
        lessonQuestion.setLesson(lesson);
        lessonQuestion = questionRepository.saveAndFlush(lessonQuestion);

        Question practiceQuestion = new Question();
        practiceQuestion.setTitle("Вопрос практики");
        practiceQuestion.setType(QuestionType.INPUT);
        practiceQuestion.setCorrectAnswer("да");
        practiceQuestion.setSubject(mine);
        practiceQuestion = questionRepository.saveAndFlush(practiceQuestion);

        Set<Integer> taught = userRepository.findTaughtSubjectIds(teacher.getId());
        assertThat(taught).containsExactly(mine.getId());
        assertThat(userRepository.countTeachersOfSubject(mine.getId())).isEqualTo(1);
        assertThat(userRepository.countTeachersOfSubject(foreign.getId())).isZero();

        assertThat(lessonRepository.findSubjectId(lesson.getId())).contains(mine.getId());
        assertThat(questionRepository.findSubjectId(lessonQuestion.getId())).contains(mine.getId());
        assertThat(questionRepository.findSubjectId(practiceQuestion.getId())).contains(mine.getId());
        assertThat(lessonRepository.findSubjectId(-1)).isEmpty();

        assertThat(userAnswerRepository.countAllOfSubjects(student.getId(), taught).getAnswered())
                .isZero();

        CurrentUser asTeacher = new CurrentUser(
                teacher.getId(), null, teacher.getUsername(), UserRole.TEACHER, taught);

        // Blank search and a real one go down different branches of the same query.
        PageRequest page = PageRequest.of(0, 20, Sort.by("username"));
        Page<AdminUserItem> all = adminUserService.search(asTeacher, null, page);
        assertThat(all.getContent()).extracting(AdminUserItem::id).contains(student.getId());
        assertThat(all.getContent()).extracting(AdminUserItem::id)
                .doesNotContain(outsider.getId(), teacher.getId());

        Page<AdminUserItem> found = adminUserService.search(asTeacher, student.getUsername(), page);
        assertThat(found.getContent()).hasSize(1);
        assertThat(adminUserService.search(asTeacher, "нетакого", page).getContent()).isEmpty();

        AdminUserDto card = adminUserService.get(asTeacher, student.getId());
        assertThat(card.subscriptions()).isEmpty();
        assertThat(card.progress()).extracting("subjectId").containsExactly(mine.getId());

        assertThat(adminSubjectService.findAll(asTeacher)).extracting("id").containsExactly(mine.getId());

        // Assign / unassign, and the taught subjects of the admin card.
        adminUserService.assignSubject(teacher.getId(), foreign.getId());
        adminUserService.assignSubject(teacher.getId(), foreign.getId());
        CurrentUser asAdmin = new CurrentUser(0, null, "admin", UserRole.ADMIN, Set.of());
        assertThat(adminUserService.get(asAdmin, teacher.getId()).taughtSubjects()).hasSize(2);
        adminUserService.unassignSubject(teacher.getId(), foreign.getId());
        assertThat(adminUserService.get(asAdmin, teacher.getId()).taughtSubjects()).hasSize(1);

        // Dropping a teacher must not trip over the join table.
        adminUserService.delete(teacher.getId());
        assertThat(userRepository.findById(teacher.getId())).isEmpty();
    }

    private Subject subject(String name) {
        Subject subject = new Subject();
        subject.setName(name + " " + System.nanoTime());
        return subjectRepository.saveAndFlush(subject);
    }

    private void subscribe(User student, Subject subject) {
        Subscription subscription = new Subscription();
        subscription.setUser(student);
        subscription.setSubject(subject);
        subscription.setPaidUntil(LocalDateTime.now().plusDays(30));
        subscriptionRepository.saveAndFlush(subscription);
    }
}
