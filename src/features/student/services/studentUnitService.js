import { supabase } from '../../../lib/supabase'

function normalizeLesson(lesson) {
  return {
    id: lesson?.id ?? null,
    title: lesson?.title ?? '',
    slug: lesson?.slug ?? '',
    summary: lesson?.summary ?? '',
    estimatedMinutes:
      Number(lesson?.estimatedMinutes) || 0,
    sortOrder:
      Number(lesson?.sortOrder) || 0,
    status:
      lesson?.status || 'not_started',
    progressPercent:
      Number(lesson?.progressPercent) || 0,
    lastPosition:
      lesson?.lastPosition &&
      typeof lesson.lastPosition === 'object'
        ? lesson.lastPosition
        : {},
    lastOpenedAt:
      lesson?.lastOpenedAt ?? null,
    completedAt:
      lesson?.completedAt ?? null,
    totalStudySeconds:
      Number(lesson?.totalStudySeconds) || 0,
  }
}

function normalizeSection(section) {
  return {
    id: section?.id ?? null,
    title: section?.title ?? '',
    sectionType:
      section?.sectionType ?? '',
    sortOrder:
      Number(section?.sortOrder) || 0,
    lessonCount:
      Number(section?.lessonCount) || 0,
    completedLessonCount:
      Number(
        section?.completedLessonCount,
      ) || 0,
    progressPercent:
      Number(section?.progressPercent) || 0,
    completionPercent:
      Number(section?.completionPercent) || 0,
    lessons: Array.isArray(section?.lessons)
      ? section.lessons.map(normalizeLesson)
      : [],
  }
}

function normalizeUnitData(data) {
  const unit = data?.unit ?? null

  if (!unit) {
    return {
      unit: null,
      generatedAt:
        data?.generatedAt ?? null,
    }
  }

  return {
    unit: {
      id: unit.id ?? null,
      title: unit.title ?? '',
      slug: unit.slug ?? '',
      unitNumber:
        Number(unit.unitNumber) || 0,
      unitType:
        unit.unitType ?? 'standard',
      description:
        unit.description ?? '',
      coverImageUrl:
        unit.coverImageUrl ?? null,
      sortOrder:
        Number(unit.sortOrder) || 0,
      isFree:
        Boolean(unit.isFree),

      course: {
        id:
          unit.course?.id ?? null,
        title:
          unit.course?.title ?? '',
        slug:
          unit.course?.slug ?? '',
        subject:
          unit.course?.subject ?? '',
        gradeLevel:
          unit.course?.gradeLevel ?? '',
        cohort:
          unit.course?.cohort ?? '',
      },

      statistics: {
        lessonCount:
          Number(
            unit.statistics?.lessonCount,
          ) || 0,

        completedLessonCount:
          Number(
            unit.statistics
              ?.completedLessonCount,
          ) || 0,

        progressPercent:
          Number(
            unit.statistics?.progressPercent,
          ) || 0,

        completionPercent:
          Number(
            unit.statistics?.completionPercent,
          ) || 0,
      },

      sections:
        Array.isArray(unit.sections)
          ? unit.sections.map(
              normalizeSection,
            )
          : [],
    },

    generatedAt:
      data?.generatedAt ?? null,
  }
}

async function getStudentUnit(unitSlug) {
  const cleanUnitSlug =
    String(unitSlug || '').trim()

  if (!cleanUnitSlug) {
    throw new Error(
      'Unit slug is required.',
    )
  }

  const { data, error } =
    await supabase.rpc(
      'get_student_unit_v2',
      {
        target_unit_slug:
          cleanUnitSlug,
      },
    )

  if (error) {
    throw new Error(
      error.message ||
        'The unit could not be loaded.',
    )
  }

  return normalizeUnitData(data)
}

export {
  getStudentUnit,
}
