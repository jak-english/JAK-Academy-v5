import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  createAdminLesson,
  createAdminSection,
  deleteAdminLesson,
  getAdminUnitsOverview,
  reorderAdminLessons,
  reorderAdminSections,
  updateAdminSection,
  updateAdminSectionSettings,
  updateAdminUnitSettings,
} from '../features/admin/services/adminUnitsService'

import './AdminUnitsPage.css'

const emptySectionForm = {
  sectionType: '',
  title: '',
  description: '',
  isPublished: true,
}
const SECTION_OPTIONS = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'notes', label: 'Notes' },
]
const emptyLessonForm = {
  title: '',
  slug: '',
  estimatedMinutes: 15,
  isPublished: false,
}

function createSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function AdminUnitsPage() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] =
    useState(true)
  const [errorMessage, setErrorMessage] =
    useState('')
  const [
    creatingSectionId,
    setCreatingSectionId,
  ] = useState(null)
  const [
    lessonForm,
    setLessonForm,
  ] = useState(emptyLessonForm)
  const [
    isCreatingLesson,
    setIsCreatingLesson,
  ] = useState(false)

  const [
    creatingUnitId,
    setCreatingUnitId,
  ] = useState(null)

  const [
    sectionForm,
    setSectionForm,
  ] = useState(emptySectionForm)

  const [
    isCreatingSection,
    setIsCreatingSection,
  ] = useState(false)
  const [
    editingSectionId,
    setEditingSectionId,
  ] = useState(null)

  const [
    sectionEditForm,
    setSectionEditForm,
  ] = useState({
    title: '',
    description: '',
    isPublished: true,
  })

  const [
    isUpdatingSection,
    setIsUpdatingSection,
  ] = useState(false)
  useEffect(() => {
    let isMounted = true

    async function loadUnits() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getAdminUnitsOverview()

        if (isMounted) {
          setCourses(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Units could not be loaded.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUnits()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleUnitSettingChange(
    unit,
    changes,
  ) {
    try {
      setErrorMessage('')

      const updatedUnit =
        await updateAdminUnitSettings(
          unit.id,
          {
            isPublished:
              changes.isPublished ??
              unit.is_published,
            isFree:
              changes.isFree ??
              unit.is_free,
          },
        )

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((currentUnit) =>
                currentUnit.id === unit.id
                  ? {
                      ...currentUnit,
                      is_published:
                        updatedUnit.isPublished,
                      is_free:
                        updatedUnit.isFree,
                    }
                  : currentUnit,
              )
            : [],
        })),
      )
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Unit settings could not be updated.',
      )
    }
  }


  async function handleMoveLesson(
    sectionId,
    lessonId,
    direction,
  ) {
    let previousCourses = null

    try {
      setErrorMessage('')

      setCourses((currentCourses) => {
        previousCourses = currentCourses

        return currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => ({
                ...unit,
                unit_sections:
                  Array.isArray(
                    unit.unit_sections,
                  )
                    ? unit.unit_sections.map(
                        (section) => {
                          if (
                            section.id !==
                            sectionId
                          ) {
                            return section
                          }

                          const lessons =
                            Array.isArray(
                              section.lessons,
                            )
                              ? [
                                  ...section.lessons,
                                ]
                              : []

                          const currentIndex =
                            lessons.findIndex(
                              (lesson) =>
                                lesson.id ===
                                lessonId,
                            )

                          const nextIndex =
                            currentIndex +
                            direction

                          if (
                            currentIndex < 0 ||
                            nextIndex < 0 ||
                            nextIndex >=
                              lessons.length
                          ) {
                            return section
                          }

                          const [
                            movedLesson,
                          ] = lessons.splice(
                            currentIndex,
                            1,
                          )

                          lessons.splice(
                            nextIndex,
                            0,
                            movedLesson,
                          )

                          return {
                            ...section,
                            lessons:
                              lessons.map(
                                (
                                  lesson,
                                  index,
                                ) => ({
                                  ...lesson,
                                  sort_order:
                                    index + 1,
                                }),
                              ),
                          }
                        },
                      )
                    : [],
              }))
            : [],
        }))
      })

      const targetSection =
        previousCourses
          ?.flatMap(
            (course) =>
              course.units || [],
          )
          .flatMap(
            (unit) =>
              unit.unit_sections || [],
          )
          .find(
            (section) =>
              section.id === sectionId,
          )

      if (!targetSection) {
        throw new Error(
          'Section could not be found.',
        )
      }

      const reorderedLessons = [
        ...(targetSection.lessons || []),
      ]

      const currentIndex =
        reorderedLessons.findIndex(
          (lesson) =>
            lesson.id === lessonId,
        )

      const nextIndex =
        currentIndex + direction

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= reorderedLessons.length
      ) {
        return
      }

      const [movedLesson] =
        reorderedLessons.splice(
          currentIndex,
          1,
        )

      reorderedLessons.splice(
        nextIndex,
        0,
        movedLesson,
      )

      await reorderAdminLessons(
        sectionId,
        reorderedLessons.map(
          (lesson) => lesson.id,
        ),
      )
    } catch (error) {
      if (previousCourses) {
        setCourses(previousCourses)
      }

      setErrorMessage(
        error.message ||
          'Lesson order could not be updated.',
      )
    }
  }
  async function handleDeleteLesson(
    sectionId,
    lesson,
  ) {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"?\n\nThis action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')

      await deleteAdminLesson(lesson.id)

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => ({
                ...unit,
                unit_sections: Array.isArray(
                  unit.unit_sections,
                )
                  ? unit.unit_sections.map(
                      (section) =>
                        section.id === sectionId
                          ? {
                              ...section,
                              lessons: Array.isArray(
                                section.lessons,
                              )
                                ? section.lessons.filter(
                                    (item) =>
                                      item.id !==
                                      lesson.id,
                                  )
                                : [],
                            }
                          : section,
                    )
                  : [],
              }))
            : [],
        })),
      )
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Lesson could not be deleted.',
      )
    }
  }
  async function handleMoveSection(
    unitId,
    sectionId,
    direction,
  ) {
    let previousCourses = null

    try {
      setErrorMessage('')

      setCourses((currentCourses) => {
        previousCourses = currentCourses

        return currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => {
                if (unit.id !== unitId) {
                  return unit
                }

                const sections = Array.isArray(
                  unit.unit_sections,
                )
                  ? [...unit.unit_sections]
                  : []

                const currentIndex =
                  sections.findIndex(
                    (section) =>
                      section.id === sectionId,
                  )

                const nextIndex =
                  currentIndex + direction

                if (
                  currentIndex < 0 ||
                  nextIndex < 0 ||
                  nextIndex >= sections.length
                ) {
                  return unit
                }

                const [movedSection] =
                  sections.splice(
                    currentIndex,
                    1,
                  )

                sections.splice(
                  nextIndex,
                  0,
                  movedSection,
                )

                return {
                  ...unit,
                  unit_sections: sections.map(
                    (section, index) => ({
                      ...section,
                      sort_order: index + 1,
                    }),
                  ),
                }
              })
            : [],
        }))
      })

      const targetUnit =
        previousCourses
          ?.flatMap(
            (course) => course.units || [],
          )
          .find(
            (unit) => unit.id === unitId,
          )

      if (!targetUnit) {
        throw new Error(
          'Unit could not be found.',
        )
      }

      const reorderedSections = [
        ...(targetUnit.unit_sections || []),
      ]

      const currentIndex =
        reorderedSections.findIndex(
          (section) =>
            section.id === sectionId,
        )

      const nextIndex =
        currentIndex + direction

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= reorderedSections.length
      ) {
        return
      }

      const [movedSection] =
        reorderedSections.splice(
          currentIndex,
          1,
        )

      reorderedSections.splice(
        nextIndex,
        0,
        movedSection,
      )

      await reorderAdminSections(
        unitId,
        reorderedSections.map(
          (section) => section.id,
        ),
      )
    } catch (error) {
      if (previousCourses) {
        setCourses(previousCourses)
      }

      setErrorMessage(
        error.message ||
          'Section order could not be updated.',
      )
    }
  }
  async function handleSectionPublishChange(
    sectionId,
    currentValue,
  ) {
    try {
      setErrorMessage('')

      const nextValue = !currentValue

      await updateAdminSectionSettings(
        sectionId,
        nextValue,
      )

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => ({
                ...unit,
                unit_sections: Array.isArray(
                  unit.unit_sections,
                )
                  ? unit.unit_sections.map(
                      (section) =>
                        section.id === sectionId
                          ? {
                              ...section,
                              is_published:
                                nextValue,
                            }
                          : section,
                    )
                  : [],
              }))
            : [],
        })),
      )
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Section visibility could not be updated.',
      )
    }
  }
  function openLessonForm(sectionId) {
    setCreatingSectionId(sectionId)
    setLessonForm(emptyLessonForm)
    setErrorMessage('')
  }

  function closeLessonForm() {
    if (isCreatingLesson) {
      return
    }

    setCreatingSectionId(null)
    setLessonForm(emptyLessonForm)
  }

  function handleLessonTitleChange(event) {
    const title = event.target.value

    setLessonForm((current) => ({
      ...current,
      title,
      slug: createSlug(title),
    }))
  }

  async function handleCreateLesson(
    event,
    sectionId,
  ) {
    event.preventDefault()

    const title = lessonForm.title.trim()
    const slug = lessonForm.slug.trim()

    if (!title || !slug) {
      setErrorMessage(
        'Lesson title and slug are required.',
      )
      return
    }

    try {
      setIsCreatingLesson(true)
      setErrorMessage('')

      const createdLesson =
        await createAdminLesson({
          sectionId,
          title,
          slug,
          estimatedMinutes:
            Number(
              lessonForm.estimatedMinutes,
            ) || 15,
          isPublished:
            lessonForm.isPublished,
        })

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => ({
                ...unit,
                unit_sections:
                  Array.isArray(
                    unit.unit_sections,
                  )
                    ? unit.unit_sections.map(
                        (section) =>
                          section.id === sectionId
                            ? {
                                ...section,
                                lessons: [
                                  ...(Array.isArray(
                                    section.lessons,
                                  )
                                    ? section.lessons
                                    : []),
                                  {
                                    id:
                                      createdLesson.id,
                                    section_id:
                                      createdLesson.sectionId,
                                    title:
                                      createdLesson.title,
                                    slug:
                                      createdLesson.slug,
                                    summary:
                                      createdLesson.summary,
                                    estimated_minutes:
                                      createdLesson.estimatedMinutes,
                                    sort_order:
                                      createdLesson.sortOrder,
                                    is_published:
                                      createdLesson.isPublished,
                                  },
                                ],
                              }
                            : section,
                      )
                    : [],
              }))
            : [],
        })),
      )

      setCreatingSectionId(null)
      setLessonForm(emptyLessonForm)
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Lesson could not be created.',
      )
    } finally {
      setIsCreatingLesson(false)
    }
  }


  function closeSectionForm() {
    if (isCreatingSection) {
      return
    }

    setCreatingUnitId(null)
    setSectionForm(emptySectionForm)
  }

  async function handleCreateSection(
    event,
    unitId,
  ) {
    event.preventDefault()

    const sectionType =
      sectionForm.sectionType.trim()
    const title =
      sectionForm.title.trim()

    if (!sectionType || !title) {
      setErrorMessage(
        'Section type and title are required.',
      )
      return
    }

    try {
      setIsCreatingSection(true)
      setErrorMessage('')

      const createdSection =
        await createAdminSection({
          unitId,
          sectionType,
          title,
          description:
            sectionForm.description.trim(),
          isPublished:
            sectionForm.isPublished,
        })

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) =>
                unit.id === unitId
                  ? {
                      ...unit,
                      unit_sections: [
                        ...(Array.isArray(
                          unit.unit_sections,
                        )
                          ? unit.unit_sections
                          : []),
                        {
                          id:
                            createdSection.id,
                          unit_id:
                            createdSection.unitId,
                          section_type:
                            createdSection.sectionType,
                          title:
                            createdSection.title,
                          description:
                            createdSection.description,
                          sort_order:
                            createdSection.sortOrder,
                          is_published:
                            createdSection.isPublished,
                          lessons: [],
                        },
                      ],
                    }
                  : unit,
              )
            : [],
        })),
      )

      setCreatingUnitId(null)
      setSectionForm(emptySectionForm)
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Section could not be created.',
      )
    } finally {
      setIsCreatingSection(false)
    }
  }
  function openSectionEdit(section) {
    setEditingSectionId(section.id)
    setSectionEditForm({
      title: section.title || '',
      description: section.description || '',
      isPublished:
        Boolean(section.is_published),
    })
    setErrorMessage('')
  }

  function closeSectionEdit() {
    if (isUpdatingSection) {
      return
    }

    setEditingSectionId(null)
  }

  async function handleUpdateSection(
    event,
    sectionId,
  ) {
    event.preventDefault()

    const title =
      sectionEditForm.title.trim()

    if (!title) {
      setErrorMessage(
        'Section title is required.',
      )
      return
    }

    try {
      setIsUpdatingSection(true)
      setErrorMessage('')

      const updatedSection =
        await updateAdminSection({
          sectionId,
          title,
          description:
            sectionEditForm.description.trim(),
          isPublished:
            sectionEditForm.isPublished,
        })

      setCourses((currentCourses) =>
        currentCourses.map((course) => ({
          ...course,
          units: Array.isArray(course.units)
            ? course.units.map((unit) => ({
                ...unit,
                unit_sections: Array.isArray(
                  unit.unit_sections,
                )
                  ? unit.unit_sections.map(
                      (section) =>
                        section.id === sectionId
                          ? {
                              ...section,
                              title:
                                updatedSection.title,
                              description:
                                updatedSection.description,
                              is_published:
                                updatedSection.isPublished,
                            }
                          : section,
                    )
                  : [],
              }))
            : [],
        })),
      )

      setEditingSectionId(null)
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Section could not be updated.',
      )
    } finally {
      setIsUpdatingSection(false)
    }
  }
  if (isLoading) {
    return (
      <section className="admin-units">
        <div className="admin-units__state">
          Loading learning structure...
        </div>
      </section>
    )
  }

  return (
    <section className="admin-units">
      <header className="admin-units__header">
        <div>
          <span className="admin-units__eyebrow">
            Learning Management
          </span>

          <h1>Units & Lessons</h1>

          <p>
            Review the complete course structure,
            sections, lessons, publishing status,
            and lesson content.
          </p>
        </div>

        <div className="admin-units__summary">
          <strong>{courses.length}</strong>
          <span>
            {courses.length === 1
              ? 'Course'
              : 'Courses'}
          </span>
        </div>
      </header>

      {errorMessage && (
        <div className="admin-units__notice admin-units__notice--error">
          {errorMessage}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="admin-units__state">
          No courses are available.
        </div>
      ) : (
        <div className="admin-units__courses">
          {courses.map((course) => {
            const units = Array.isArray(
              course.units,
            )
              ? course.units
              : []

            return (
              <article
                className="admin-units__course"
                key={course.id}
              >
                <div className="admin-units__course-header">
                  <div>
                    <span>
                      {course.subject || 'Course'}
                    </span>

                    <h2>{course.title}</h2>

                    <p>
                      {course.grade_level ||
                        'Grade not set'}
                      {' · '}
                      {course.cohort ||
                        'Cohort not set'}
                    </p>
                  </div>

                  <div className="admin-units__course-status">
                    <span
                      className={
                        course.is_active
                          ? 'is-active'
                          : 'is-inactive'
                      }
                    >
                      {course.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                    <strong>
                      {units.length}{' '}
                      {units.length === 1
                        ? 'unit'
                        : 'units'}
                    </strong>
                  </div>
                </div>

                <div className="admin-units__unit-list">
                  {units.map((unit) => {
                    const sections =
                      Array.isArray(
                        unit.unit_sections,
                      )
                        ? unit.unit_sections
                        : []

                    const existingSectionTypes =
                      new Set(
                        sections.map(
                          (section) =>
                            section.section_type,
                        ),
                      )

                    const availableSectionOptions =
                      SECTION_OPTIONS.filter(
                        (option) =>
                          !existingSectionTypes.has(
                            option.value,
                          ),
                      )
                    return (
                      <details
                        className="admin-units__unit"
                        key={unit.id}
                      >
                        <summary>
                          <div className="admin-units__unit-title">
                            <span>
                              Unit{' '}
                              {unit.unit_number ||
                                unit.sort_order}
                            </span>

                            <strong>
                              {unit.title}
                            </strong>
                          </div>

                          <div className="admin-units__badges">
                            <button
                              type="button"
                              className={
                                unit.is_published
                                  ? 'admin-units__setting admin-units__setting--active'
                                  : 'admin-units__setting'
                              }
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()

                                handleUnitSettingChange(
                                  unit,
                                  {
                                    isPublished:
                                      !unit.is_published,
                                  },
                                )
                              }}
                            >
                              {unit.is_published
                                ? 'Published'
                                : 'Draft'}
                            </button>

                            <button
                              type="button"
                              className={
                                unit.is_free
                                  ? 'admin-units__setting admin-units__setting--free'
                                  : 'admin-units__setting admin-units__setting--premium'
                              }
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()

                                handleUnitSettingChange(
                                  unit,
                                  {
                                    isFree:
                                      !unit.is_free,
                                  },
                                )
                              }}
                            >
                              {unit.is_free
                                ? 'Free'
                                : 'Premium'}
                            </button>

                            {availableSectionOptions.length > 0 ? (
  <button
    type="button"
    className="admin-units__add-section"
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()

      setSectionForm({
        ...emptySectionForm,
        sectionType:
          availableSectionOptions[0].value,
        title:
          availableSectionOptions[0].label,
      })

      setCreatingUnitId(unit.id)
      setErrorMessage('')
    }}
  >
    + Add Section
  </button>
) : (
  <span className="admin-units__sections-complete">
    All sections added ✓
  </span>
)}
<span>
                              {sections.length} sections
                            </span>
                          </div>
                        </summary>

                        {creatingUnitId === unit.id && (
                          <form
                            className="admin-units__section-form"
                            onSubmit={(event) =>
                              handleCreateSection(
                                event,
                                unit.id,
                              )
                            }
                          >
                            <div className="admin-units__section-form-grid">
                              <label>
  <span>Section Type</span>

  <select
    value={sectionForm.sectionType}
    onChange={(event) => {
      const selected =
        SECTION_OPTIONS.find(
          (option) =>
            option.value ===
            event.target.value,
        )

      setSectionForm((current) => ({
        ...current,
        sectionType:
          event.target.value,
        title:
          selected?.label ||
          current.title,
      }))
    }}
    autoFocus
  >
    {availableSectionOptions.map(
      (option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ),
    )}
  </select>
</label>

                              <label>
                                <span>Title</span>
                                <input
                                  type="text"
                                  value={
                                    sectionForm.title
                                  }
                                  onChange={(event) =>
                                    setSectionForm(
                                      (current) => ({
                                        ...current,
                                        title:
                                          event.target.value,
                                      }),
                                    )
                                  }
                                  placeholder="e.g. Final Revision"
                                />
                              </label>

                              <label className="admin-units__section-description">
                                <span>Description</span>
                                <input
                                  type="text"
                                  value={
                                    sectionForm.description
                                  }
                                  onChange={(event) =>
                                    setSectionForm(
                                      (current) => ({
                                        ...current,
                                        description:
                                          event.target.value,
                                      }),
                                    )
                                  }
                                  placeholder="Optional"
                                />
                              </label>

                              <label className="admin-units__publish-check">
                                <input
                                  type="checkbox"
                                  checked={
                                    sectionForm.isPublished
                                  }
                                  onChange={(event) =>
                                    setSectionForm(
                                      (current) => ({
                                        ...current,
                                        isPublished:
                                          event.target.checked,
                                      }),
                                    )
                                  }
                                />
                                <span>
                                  Publish immediately
                                </span>
                              </label>
                            </div>

                            <div className="admin-units__lesson-form-actions">
                              <button
                                type="button"
                                onClick={
                                  closeSectionForm
                                }
                                disabled={
                                  isCreatingSection
                                }
                              >
                                Cancel
                              </button>

                              <button
                                type="submit"
                                className="admin-units__create-section"
                                disabled={
                                  isCreatingSection
                                }
                              >
                                {isCreatingSection
                                  ? 'Creating...'
                                  : 'Create Section'}
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="admin-units__sections">
                          {sections.length === 0 ? (
                            <div className="admin-units__empty">
                              No sections in this unit.
                            </div>
                          ) : (
                            sections.map((section, sectionIndex) => {
                              const lessons =
                                Array.isArray(
                                  section.lessons,
                                )
                                  ? section.lessons
                                  : []

                              return (
                                <div
                                  className="admin-units__section"
                                  key={section.id}
                                >
                                  <div className="admin-units__section-header">
                                    <div>
                                      <span>
                                        {section.section_type}
                                      </span>

                                      <h3>
                                        {section.title}
                                      </h3>
                                    </div>

                                    <div className="admin-units__section-actions">
                                      <strong>
                                        {lessons.length}{' '}
                                        {lessons.length === 1
                                          ? 'lesson'
                                          : 'lessons'}
                                      </strong>

                                      <button
  type="button"
  className="admin-units__move-button"
  disabled={sectionIndex === 0}
  onClick={() =>
    handleMoveSection(
      unit.id,
      section.id,
      -1,
    )
  }
  title="Move section up"
  aria-label="Move section up"
>
  ↑
</button>

<button
  type="button"
  className="admin-units__move-button"
  disabled={
    sectionIndex ===
    sections.length - 1
  }
  onClick={() =>
    handleMoveSection(
      unit.id,
      section.id,
      1,
    )
  }
  title="Move section down"
  aria-label="Move section down"
>
  ↓
</button>
<button
  type="button"
  className={
    section.is_published
      ? 'admin-units__section-status is-published'
      : 'admin-units__section-status is-hidden'
  }
  onClick={() =>
    handleSectionPublishChange(
      section.id,
      section.is_published,
    )
  }
>
  {section.is_published
    ? 'Published'
    : 'Hidden'}
</button>
<button
  type="button"
  className="admin-units__edit-section"
  onClick={() =>
    openSectionEdit(section)
  }
>
  Edit Section
</button>

<button
                                        type="button"
                                        className="admin-units__add-lesson"
                                        onClick={() =>
                                          openLessonForm(
                                            section.id,
                                          )
                                        }
                                      >
                                        + Add Lesson
                                      </button>
                                    </div>
                                  </div>

{editingSectionId === section.id && (
  <form
    className="admin-units__section-edit-form"
    onSubmit={(event) =>
      handleUpdateSection(
        event,
        section.id,
      )
    }
  >
    <div className="admin-units__section-form-grid">
      <label>
        <span>Title</span>
        <input
          type="text"
          value={sectionEditForm.title}
          onChange={(event) =>
            setSectionEditForm(
              (current) => ({
                ...current,
                title: event.target.value,
              }),
            )
          }
          autoFocus
        />
      </label>

      <label className="admin-units__section-description">
        <span>Description</span>
        <input
          type="text"
          value={
            sectionEditForm.description
          }
          onChange={(event) =>
            setSectionEditForm(
              (current) => ({
                ...current,
                description:
                  event.target.value,
              }),
            )
          }
          placeholder="Optional"
        />
      </label>

      <label className="admin-units__publish-check">
        <input
          type="checkbox"
          checked={
            sectionEditForm.isPublished
          }
          onChange={(event) =>
            setSectionEditForm(
              (current) => ({
                ...current,
                isPublished:
                  event.target.checked,
              }),
            )
          }
        />

        <span>Published</span>
      </label>
    </div>

    <div className="admin-units__lesson-form-actions">
      <button
        type="button"
        onClick={closeSectionEdit}
        disabled={isUpdatingSection}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="admin-units__save-section"
        disabled={isUpdatingSection}
      >
        {isUpdatingSection
          ? 'Saving...'
          : 'Save Changes'}
      </button>
    </div>
  </form>
)}

                                  {creatingSectionId ===
                                    section.id && (
                                    <form
                                      className="admin-units__lesson-form"
                                      onSubmit={(event) =>
                                        handleCreateLesson(
                                          event,
                                          section.id,
                                        )
                                      }
                                    >
                                      <div className="admin-units__lesson-form-grid">
                                        <label>
                                          <span>
                                            Lesson title
                                          </span>

                                          <input
                                            type="text"
                                            value={
                                              lessonForm.title
                                            }
                                            onChange={
                                              handleLessonTitleChange
                                            }
                                            placeholder="e.g. Present Perfect Review"
                                            autoFocus
                                          />
                                        </label>

                                        <label>
                                          <span>
                                            Slug
                                          </span>

                                          <input
                                            type="text"
                                            value={
                                              lessonForm.slug
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setLessonForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  slug:
                                                    createSlug(
                                                      event
                                                        .target
                                                        .value,
                                                    ),
                                                }),
                                              )
                                            }
                                            placeholder="present-perfect-review"
                                          />
                                        </label>

                                        <label>
                                          <span>
                                            Minutes
                                          </span>

                                          <input
                                            type="number"
                                            min="1"
                                            value={
                                              lessonForm.estimatedMinutes
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setLessonForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  estimatedMinutes:
                                                    event
                                                      .target
                                                      .value,
                                                }),
                                              )
                                            }
                                          />
                                        </label>

                                        <label className="admin-units__publish-check">
                                          <input
                                            type="checkbox"
                                            checked={
                                              lessonForm.isPublished
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setLessonForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  isPublished:
                                                    event
                                                      .target
                                                      .checked,
                                                }),
                                              )
                                            }
                                          />

                                          <span>
                                            Publish immediately
                                          </span>
                                        </label>
                                      </div>

                                      <div className="admin-units__lesson-form-actions">
                                        <button
                                          type="button"
                                          onClick={
                                            closeLessonForm
                                          }
                                          disabled={
                                            isCreatingLesson
                                          }
                                        >
                                          Cancel
                                        </button>

                                        <button
                                          type="submit"
                                          className="admin-units__create-lesson"
                                          disabled={
                                            isCreatingLesson
                                          }
                                        >
                                          {isCreatingLesson
                                            ? 'Creating...'
                                            : 'Create Lesson'}
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {lessons.length === 0 ? (
                                    <div className="admin-units__empty">
                                      No lessons in this
                                      section.
                                    </div>
                                  ) : (
                                    <div className="admin-units__lessons">
                                      {lessons.map(
  (lesson, lessonIndex) => (
    <div
      className="admin-units__lesson"
      key={lesson.id}
    >
      <div>
        <strong>
          {lesson.title}
        </strong>

        <span>
          {lesson.estimated_minutes || 0}{' '}
          min
          {' · '}
          {lesson.is_published
            ? 'Published'
            : 'Draft'}
        </span>
      </div>

      <div className="admin-units__lesson-actions">
        <button
          type="button"
          className="admin-units__move-button"
          disabled={lessonIndex === 0}
          onClick={() =>
            handleMoveLesson(
              section.id,
              lesson.id,
              -1,
            )
          }
          aria-label="Move lesson up"
          title="Move up"
        >
          ↑
        </button>

        <button
          type="button"
          className="admin-units__move-button"
          disabled={
            lessonIndex ===
            lessons.length - 1
          }
          onClick={() =>
            handleMoveLesson(
              section.id,
              lesson.id,
              1,
            )
          }
          aria-label="Move lesson down"
          title="Move down"
        >
          ↓
        </button>

        <button
  type="button"
  className="admin-units__delete-lesson"
  onClick={() =>
    handleDeleteLesson(
      section.id,
      lesson,
    )
  }
>
  Delete lesson
</button>

<Link
          to={`/admin/lessons/${lesson.id}/edit`}
        >
          Edit lesson
        </Link>
      </div>
    </div>
  ),
)}
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminUnitsPage
