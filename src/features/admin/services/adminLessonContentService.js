import { supabase } from '../../../lib/supabase'

import {
  normalizeLessonContent,
} from '../../content/normalizeLessonContent'

function validateLessonId(lessonId) {
  if (!lessonId) {
    throw new Error('Lesson ID is required.')
  }

  return lessonId
}

function prepareLessonContent(content) {
  return normalizeLessonContent(content)
}

function normalizeLessonContext(data) {
  return {
    lesson: {
      id: data?.lesson?.id ?? null,
      title: data?.lesson?.title ?? '',
      slug: data?.lesson?.slug ?? '',
      sectionId:
        data?.lesson?.sectionId ?? null,
    },

    section: {
      id: data?.section?.id ?? null,
      title: data?.section?.title ?? '',
      sectionType:
        data?.section?.sectionType ?? '',
      sortOrder:
        Number(data?.section?.sortOrder) || 0,
    },

    unit: {
      id: data?.unit?.id ?? null,
      title: data?.unit?.title ?? '',
      slug: data?.unit?.slug ?? '',
      unitNumber:
        Number(data?.unit?.unitNumber) || 0,
      unitType:
        data?.unit?.unitType ?? 'standard',
      sortOrder:
        Number(data?.unit?.sortOrder) || 0,
      isFree:
        Boolean(data?.unit?.isFree),
    },

    course: {
      id: data?.course?.id ?? null,
      title: data?.course?.title ?? '',
      slug: data?.course?.slug ?? '',
      subject: data?.course?.subject ?? '',
      gradeLevel:
        data?.course?.gradeLevel ?? '',
      cohort: data?.course?.cohort ?? '',
    },
  }
}

async function getAdminLessonContext(
  lessonId,
) {
  const safeLessonId =
    validateLessonId(lessonId)

  const { data, error } = await supabase.rpc(
    'get_admin_lesson_context',
    {
      target_lesson_id: safeLessonId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Lesson context could not be loaded.',
    )
  }

  return normalizeLessonContext(data)
}

async function getAdminLessonById(lessonId) {
  const safeLessonId =
    validateLessonId(lessonId)

  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id,
      section_id,
      title,
      slug,
      summary,
      content_json,
      estimated_minutes,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .eq('id', safeLessonId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const context =
    await getAdminLessonContext(
      safeLessonId,
    )

  return {
    ...data,
    content_json: prepareLessonContent(
      data?.content_json,
    ),
    context,
  }
}

async function updateAdminLessonContent(
  lessonId,
  content,
) {
  const safeLessonId =
    validateLessonId(lessonId)

  const normalizedContent =
    prepareLessonContent(content)

  const { data, error } = await supabase.rpc(
    'admin_update_lesson_content',
    {
      target_lesson_id: safeLessonId,
      new_content_json:
        normalizedContent,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...data,
    content_json: prepareLessonContent(
      data?.content_json,
    ),
  }
}

export {
  getAdminLessonById,
  getAdminLessonContext,
  updateAdminLessonContent,
}

