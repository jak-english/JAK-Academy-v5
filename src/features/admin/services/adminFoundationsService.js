import { supabase } from '../../../lib/supabase'

async function getAdminFoundationsOverview() {
  const { data, error } = await supabase.rpc(
    'admin_get_foundations_overview',
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

async function createAdminFoundationLesson({
  moduleId,
  title,
  slug,
  summary = '',
  estimatedMinutes = 15,
  isPublished = false,
}) {
  const { data, error } = await supabase.rpc(
    'admin_create_foundation_lesson',
    {
      target_module_id: moduleId,
      new_title: title,
      new_slug: slug,
      new_summary: summary || null,
      new_estimated_minutes: estimatedMinutes,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateAdminFoundationLesson({
  lessonId,
  title,
  slug,
  summary = '',
  estimatedMinutes = 15,
  isPublished = false,
}) {
  const { data, error } = await supabase.rpc(
    'admin_update_foundation_lesson',
    {
      target_lesson_id: lessonId,
      new_title: title,
      new_slug: slug,
      new_summary: summary || null,
      new_estimated_minutes: estimatedMinutes,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function deleteAdminFoundationLesson(
  lessonId,
) {
  const { data, error } = await supabase.rpc(
    'admin_delete_foundation_lesson',
    {
      target_lesson_id: lessonId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function reorderAdminFoundationLessons(
  moduleId,
  orderedLessonIds,
) {
  const { data, error } = await supabase.rpc(
    'admin_reorder_foundation_lessons',
    {
      target_module_id: moduleId,
      ordered_lesson_ids: orderedLessonIds,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getAdminFoundationLesson(
  lessonId,
) {
  const { data, error } = await supabase.rpc(
    'admin_get_foundation_lesson',
    {
      target_lesson_id: lessonId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateAdminFoundationLessonContent(
  lessonId,
  contentJson,
) {
  const { data, error } = await supabase.rpc(
    'admin_update_foundation_lesson_content',
    {
      target_lesson_id: lessonId,
      new_content_json: contentJson,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export {
  createAdminFoundationLesson,
  deleteAdminFoundationLesson,
  getAdminFoundationLesson,
  getAdminFoundationsOverview,
  reorderAdminFoundationLessons,
  updateAdminFoundationLesson,
  updateAdminFoundationLessonContent,
}
