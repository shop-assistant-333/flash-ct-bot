package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.admin.SubjectDto;
import dev.lowkkid.backend.model.admin.SubjectRequest;

import java.util.List;

public interface AdminSubjectService {

    List<SubjectDto> findAll();

    SubjectDto create(SubjectRequest request);

    SubjectDto update(Integer subjectId, SubjectRequest request);

    void delete(Integer subjectId);
}
