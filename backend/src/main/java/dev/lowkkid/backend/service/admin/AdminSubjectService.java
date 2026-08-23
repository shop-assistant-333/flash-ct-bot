package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.admin.SubjectDto;
import dev.lowkkid.backend.model.admin.SubjectRequest;
import dev.lowkkid.backend.security.CurrentUser;

import java.util.List;

public interface AdminSubjectService {

    /** Every subject for an admin; only the ones they teach for a teacher. */
    List<SubjectDto> findAll(CurrentUser user);

    SubjectDto create(SubjectRequest request);

    SubjectDto update(Integer subjectId, SubjectRequest request);

    void delete(Integer subjectId);
}
