package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Section;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.admin.AdminSectionItem;
import dev.lowkkid.backend.model.admin.SectionRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.SectionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Topics of a subject. A topic is a heading with a place in the programme and nothing else, so
 * every change of it is a change of the order of the lessons too: {@link ProgramOrder} rebuilds
 * that after each write.
 */
@Service
@RequiredArgsConstructor
public class AdminSectionServiceImpl implements AdminSectionService {

    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final ProgramOrder programOrder;
    private final AdminContentMapper contentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdminSectionItem> findBySubject(Integer subjectId) {
        return toItems(sectionRepository.findBySubject_IdOrderByOrderAsc(subjectId));
    }

    /** A new topic goes to the end; it is empty, so the lessons keep their order. */
    @Override
    @Transactional
    public AdminSectionItem create(SectionRequest request) {
        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> NotFoundException.of("Subject", request.subjectId()));

        Section section = new Section();
        section.setSubject(subject);
        section.setTitle(request.title().trim());
        section.setOrder(sectionRepository.findBySubject_IdOrderByOrderAsc(subject.getId()).size() + 1);
        return contentMapper.toSection(sectionRepository.save(section));
    }

    /** Only renames: a topic does not move to another subject. */
    @Override
    @Transactional
    public AdminSectionItem update(Integer sectionId, SectionRequest request) {
        Section section = section(sectionId);
        if (!section.getSubject().getId().equals(request.subjectId())) {
            throw new BadRequestException("Section " + sectionId + " cannot move to another subject");
        }
        section.setTitle(request.title().trim());
        return contentMapper.toSection(sectionRepository.save(section));
    }

    @Override
    @Transactional
    public void delete(Integer sectionId) {
        Section section = section(sectionId);
        Integer subjectId = section.getSubject().getId();

        List<Lesson> lessons = lessonRepository.findBySection_Id(sectionId);
        lessons.forEach(lesson -> lesson.setSection(null));
        lessonRepository.saveAll(lessons);
        lessonRepository.flush();

        sectionRepository.delete(section);
        sectionRepository.flush();
        programOrder.resequenceSections(subjectId, sectionRepository.findBySubject_IdOrderByOrderAsc(subjectId));
    }

    @Override
    @Transactional
    public List<AdminSectionItem> reorder(Integer subjectId, List<Integer> sectionIds) {
        List<Section> sections = sectionRepository.findBySubject_IdOrderByOrderAsc(subjectId);
        Map<Integer, Section> byId = sections.stream()
                .collect(Collectors.toMap(Section::getId, section -> section));

        if (sectionIds.size() != sections.size() || !byId.keySet().containsAll(sectionIds)) {
            throw new BadRequestException("Reorder must list every section of subject " + subjectId + " exactly once");
        }

        List<Section> reordered = new ArrayList<>(sectionIds.stream().distinct().map(byId::get).toList());
        if (reordered.size() != sections.size()) {
            throw new BadRequestException("Reorder lists a section of subject " + subjectId + " twice");
        }

        programOrder.resequenceSections(subjectId, reordered);
        return toItems(reordered);
    }

    private List<AdminSectionItem> toItems(List<Section> sections) {
        return sections.stream().map(contentMapper::toSection).toList();
    }

    private Section section(Integer sectionId) {
        return sectionRepository.findById(sectionId)
                .orElseThrow(() -> NotFoundException.of("Section", sectionId));
    }
}
