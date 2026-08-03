package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.QuestionRequest;

import java.util.List;

public interface AdminQuestionService {

    List<AdminQuestionDto> findByLesson(Integer lessonId);

    /** Questions of a subject that belong to no lesson and therefore live only in practice. */
    List<AdminQuestionDto> findPracticeOnly(Integer subjectId);

    AdminQuestionDto get(Integer questionId);

    AdminQuestionDto create(QuestionRequest request);

    AdminQuestionDto update(Integer questionId, QuestionRequest request);

    void delete(Integer questionId);

    /** Rewrites the order of every question of the lesson to match the given sequence of ids. */
    List<AdminQuestionDto> reorder(Integer lessonId, List<Integer> questionIds);
}
