package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Section;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * Order of the programme of a subject, kept by both the lessons and the topics.
 *
 * <p>{@code lessons.order} is a single sequence over the subject, and it always reads the
 * programme top to bottom: the topics in their order, inside every topic its lessons and then its
 * test, then everything outside a topic. Whatever a write asks for, the order is rebuilt from that
 * rule, so the student list never has to group or sort anything itself, and a lesson never lands
 * between the lessons of a topic it does not belong to.
 */
@Component
@RequiredArgsConstructor
class ProgramOrder {

    private final LessonRepository lessonRepository;
    private final SectionRepository sectionRepository;

    /**
     * Renumbers the lessons of the subject. {@code preferred} decides only the order inside every
     * block — which block a lesson goes to comes from its topic, and a test always closes its topic.
     *
     * @param preferred every lesson of the subject, in the wanted relative order
     * @return the lessons in their final order
     */
    List<Lesson> arrange(Integer subjectId, List<Lesson> preferred) {
        Map<Integer, List<Lesson>> bySection = new LinkedHashMap<>();
        for (Section section : sectionRepository.findBySubject_IdOrderByOrderAsc(subjectId)) {
            bySection.put(section.getId(), new ArrayList<>());
        }

        List<Lesson> tests = new ArrayList<>();
        List<Lesson> outside = new ArrayList<>();
        for (Lesson lesson : preferred) {
            List<Lesson> block = lesson.getSection() == null ? null : bySection.get(lesson.getSection().getId());
            if (block == null) {
                outside.add(lesson);
            } else if (lesson.getKind() == LessonKind.TEST) {
                tests.add(lesson);
            } else {
                block.add(lesson);
            }
        }
        // Tests are put in after the loop, so one listed early in `preferred` still ends its topic.
        tests.forEach(test -> bySection.get(test.getSection().getId()).add(test));

        List<Lesson> sequence = new ArrayList<>(preferred.size());
        bySection.values().forEach(sequence::addAll);
        sequence.addAll(outside);

        resequence(sequence, lessonRepository::saveAll, lessonRepository::flush, Lesson::setOrder);
        return sequence;
    }

    /** {@link #arrange} over the order the lessons already have. */
    List<Lesson> arrange(Integer subjectId) {
        return arrange(subjectId, lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId));
    }

    /** Rewrites the positions of the topics to {@code 1..n}, then the lessons to follow them. */
    void resequenceSections(Integer subjectId, List<Section> inWantedOrder) {
        resequence(inWantedOrder, sectionRepository::saveAll, sectionRepository::flush, Section::setOrder);
        arrange(subjectId);
    }

    /**
     * Rewrites the positions to {@code 1..n}. The order is unique per subject in the database, so
     * the rows are first parked on negative positions no real row uses: assigning the final
     * numbers straight away would collide with the rows still holding them.
     */
    private static <T> void resequence(List<T> rows, Consumer<List<T>> saveAll, Runnable flush,
                                       BiConsumer<T, Integer> setOrder) {
        for (int index = 0; index < rows.size(); index++) {
            setOrder.accept(rows.get(index), -(index + 1));
        }
        saveAll.accept(rows);
        flush.run();

        for (int index = 0; index < rows.size(); index++) {
            setOrder.accept(rows.get(index), index + 1);
        }
        saveAll.accept(rows);
        flush.run();
    }
}
