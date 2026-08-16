import { supabase } from '../../../lib/supabase'

async function getAdminUnitsOverview() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      subject,
      grade_level,
      cohort,
      is_active,
      units (
        id,
        course_id,
        title,
        slug,
        unit_type,
        unit_number,
        description,
        cover_image_url,
        sort_order,
        is_free,
        is_published,
        unit_sections (
          id,
          unit_id,
          section_type,
          title,
          description,
          sort_order,
          is_published,
          lessons (
            id,
            section_id,
            title,
            slug,
            summary,
            estimated_minutes,
            sort_order,
            is_published,
            updated_at
          )
        )
      )
    `)
    .order('title', { ascending: true })
    .order('sort_order', {
      foreignTable: 'units',
      ascending: true,
    })
    .order('sort_order', {
      foreignTable: 'units.unit_sections',
      ascending: true,
    })
    .order('sort_order', {
      foreignTable:
        'units.unit_sections.lessons',
      ascending: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}


async function updateAdminUnitSettings(
  unitId,
  {
    isPublished,
    isFree,
  },
) {
  const { data, error } = await supabase.rpc(
    'admin_update_unit_settings',
    {
      target_unit_id: unitId,
      new_is_published: isPublished,
      new_is_free: isFree,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}


async function createAdminLesson({
  sectionId,
  title,
  slug,
  summary = '',
  estimatedMinutes = 15,
  isPublished = false,
}) {
  const { data, error } = await supabase.rpc(
    'admin_create_lesson',
    {
      target_section_id: sectionId,
      new_title: title,
      new_slug: slug,
      new_summary: summary,
      new_estimated_minutes: estimatedMinutes,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function reorderAdminLessons(
  sectionId,
  orderedLessonIds,
) {
  const { data, error } = await supabase.rpc(
    'admin_reorder_lessons',
    {
      target_section_id: sectionId,
      ordered_lesson_ids: orderedLessonIds,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function deleteAdminLesson(
  lessonId,
) {
  const { data, error } = await supabase.rpc(
    'admin_delete_lesson',
    {
      target_lesson_id: lessonId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateAdminSectionSettings(
  sectionId,
  isPublished,
) {
  const { data, error } = await supabase.rpc(
    'admin_update_section_settings',
    {
      target_section_id: sectionId,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function reorderAdminSections(
  unitId,
  orderedSectionIds,
) {
  const { data, error } = await supabase.rpc(
    'admin_reorder_sections',
    {
      target_unit_id: unitId,
      ordered_section_ids: orderedSectionIds,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function createAdminSection({
  unitId,
  sectionType,
  title,
  description = '',
  isPublished = true,
}) {
  const { data, error } = await supabase.rpc(
    'admin_create_section',
    {
      target_unit_id: unitId,
      new_section_type: sectionType,
      new_title: title,
      new_description: description || null,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateAdminSection({
  sectionId,
  title,
  description = '',
  isPublished = true,
}) {
  const { data, error } = await supabase.rpc(
    'admin_update_section',
    {
      target_section_id: sectionId,
      new_title: title,
      new_description: description || null,
      new_is_published: isPublished,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
export {
  createAdminLesson,
  createAdminSection,
  deleteAdminLesson,
  getAdminUnitsOverview,
  reorderAdminLessons,
  reorderAdminSections,
  updateAdminSection,
  updateAdminSectionSettings,
  updateAdminUnitSettings,
}