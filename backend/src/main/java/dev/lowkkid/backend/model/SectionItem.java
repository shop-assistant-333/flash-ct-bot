package dev.lowkkid.backend.model;

/** Topic of the homework list: a heading the lessons with its {@code sectionId} are listed under. */
public record SectionItem(Integer id, String title, Integer order) {
}
