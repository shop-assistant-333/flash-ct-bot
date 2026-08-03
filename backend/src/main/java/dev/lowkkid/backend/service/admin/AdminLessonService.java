package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.LessonRequest;

import java.util.List;

public interface AdminLessonService {

    List<AdminLessonItem> findBySubject(Integer subjectId);

    AdminLessonDto get(Integer lessonId);

    AdminLessonDto create(LessonRequest request);

    AdminLessonDto update(Integer lessonId, LessonRequest request);

    void delete(Integer lessonId);

    /** Rewrites the order of every lesson of the subject to match the given sequence of ids. */
    List<AdminLessonItem> reorder(Integer subjectId, List<Integer> lessonIds);
}
