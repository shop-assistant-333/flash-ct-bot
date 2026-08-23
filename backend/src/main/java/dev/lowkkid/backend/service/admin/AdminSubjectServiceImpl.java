package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.admin.SubjectDto;
import dev.lowkkid.backend.model.admin.SubjectRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.SubscriptionRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The two subjects of the course, russian and english, and whatever the owner adds later.
 * Everything else in the app hangs off a subject, so a subject that is in use cannot be dropped.
 */
@Service
@RequiredArgsConstructor
public class AdminSubjectServiceImpl implements AdminSubjectService {

    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDto> findAll(CurrentUser user) {
        return subjectRepository.findAll(Sort.by("id")).stream()
                .filter(subject -> user.manages(subject.getId()))
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public SubjectDto create(SubjectRequest request) {
        requireFreeName(request.name(), null);
        Subject subject = new Subject();
        subject.setName(request.name().trim());
        return toDto(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public SubjectDto update(Integer subjectId, SubjectRequest request) {
        Subject subject = subject(subjectId);
        requireFreeName(request.name(), subjectId);
        subject.setName(request.name().trim());
        return toDto(subjectRepository.save(subject));
    }

    /**
     * @throws ConflictException if lessons, practice questions, paid access or a teacher still
     *                           point at the subject; those have to be removed first, deliberately
     */
    @Override
    @Transactional
    public void delete(Integer subjectId) {
        Subject subject = subject(subjectId);

        int lessons = lessonRepository.countBySubject_Id(subjectId);
        if (lessons > 0) {
            throw new ConflictException("Subject " + subjectId + " still has " + lessons + " lessons");
        }
        int practiceQuestions = questionRepository.countBySubject_Id(subjectId);
        if (practiceQuestions > 0) {
            throw new ConflictException("Subject " + subjectId + " still has " + practiceQuestions
                    + " practice questions");
        }
        if (subscriptionRepository.existsBySubject_Id(subjectId)) {
            throw new ConflictException("Subject " + subjectId + " is still granted to students");
        }
        long teachers = userRepository.countTeachersOfSubject(subjectId);
        if (teachers > 0) {
            throw new ConflictException("Subject " + subjectId + " is still assigned to "
                    + teachers + " teachers");
        }
        subjectRepository.delete(subject);
    }

    private Subject subject(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> NotFoundException.of("Subject", subjectId));
    }

    /** Two subjects with the same name would be indistinguishable in every dropdown of the app. */
    private void requireFreeName(String name, Integer allowedId) {
        subjectRepository.findByNameIgnoreCase(name.trim())
                .filter(existing -> !existing.getId().equals(allowedId))
                .ifPresent(existing -> {
                    throw new ConflictException("Subject named " + existing.getName() + " already exists");
                });
    }

    private SubjectDto toDto(Subject subject) {
        return new SubjectDto(
                subject.getId(),
                subject.getName(),
                lessonRepository.countBySubject_Id(subject.getId()),
                questionRepository.countBySubject_Id(subject.getId()));
    }
}
