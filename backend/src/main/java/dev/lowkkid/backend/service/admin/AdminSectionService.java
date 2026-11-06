package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.admin.AdminSectionItem;
import dev.lowkkid.backend.model.admin.SectionRequest;

import java.util.List;

public interface AdminSectionService {

    List<AdminSectionItem> findBySubject(Integer subjectId);

    AdminSectionItem create(SectionRequest request);

    AdminSectionItem update(Integer sectionId, SectionRequest request);

    /** Deletes the topic alone: its lessons and test stay, outside every topic. */
    void delete(Integer sectionId);

    /** Rewrites the order of every topic of the subject, and the lessons to follow it. */
    List<AdminSectionItem> reorder(Integer subjectId, List<Integer> sectionIds);
}
