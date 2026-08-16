import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  createAdminFoundationLesson,
  deleteAdminFoundationLesson,
  getAdminFoundationsOverview,
  reorderAdminFoundationLessons,
  updateAdminFoundationLesson,
} from '../features/admin/services/adminFoundationsService'

import './AdminFoundationsPage.css'

function AdminFoundationsPage() {
  const [levels, setLevels] = useState([])
  const [isLoading, setIsLoading] =
    useState(true)
  const [errorMessage, setErrorMessage] =
    useState('')
  const [successMessage, setSuccessMessage] =
    useState('')
  const [activeModuleId, setActiveModuleId] =
    useState(null)
  const [editingLessonId, setEditingLessonId] =
    useState(null)
  const [isSaving, setIsSaving] =
    useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    estimatedMinutes: 15,
    isPublished: false,
  })

  useEffect(() => {
    let isMounted = true

    async function loadFoundations() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getAdminFoundationsOverview()

        if (isMounted) {
          setLevels(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFoundations()

    return () => {
      isMounted = false
    }
  }, [])

  const activeModule = useMemo(() => {
    for (const level of levels) {
      const found = level.modules?.find(
        (module) =>
          module.id === activeModuleId,
      )

      if (found) {
        return found
      }
    }

    return null
  }, [levels, activeModuleId])

  function resetForm() {
    setEditingLessonId(null)
    setForm({
      title: '',
      slug: '',
      summary: '',
      estimatedMinutes: 15,
      isPublished: false,
    })
  }

  async function refreshOverview() {
    const data =
      await getAdminFoundationsOverview()

    setLevels(data)
  }

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function startCreate(moduleId) {
    setActiveModuleId(moduleId)
    resetForm()
    setSuccessMessage('')
    setErrorMessage('')
  }

  function startEdit(moduleId, lesson) {
    setActiveModuleId(moduleId)
    setEditingLessonId(lesson.id)

    setForm({
      title: lesson.title || '',
      slug: lesson.slug || '',
      summary: lesson.summary || '',
      estimatedMinutes:
        lesson.estimatedMinutes || 15,
      isPublished:
        Boolean(lesson.isPublished),
    })

    setSuccessMessage('')
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!activeModuleId) {
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (editingLessonId) {
        await updateAdminFoundationLesson({
          lessonId: editingLessonId,
          ...form,
          estimatedMinutes:
            Number(form.estimatedMinutes),
        })

        setSuccessMessage(
          'Foundation lesson updated successfully.',
        )
      } else {
        await createAdminFoundationLesson({
          moduleId: activeModuleId,
          ...form,
          estimatedMinutes:
            Number(form.estimatedMinutes),
        })

        setSuccessMessage(
          'Foundation lesson created successfully.',
        )
      }

      await refreshOverview()
      resetForm()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(lessonId) {
    const confirmed = window.confirm(
      'Delete this foundation lesson?',
    )

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await deleteAdminFoundationLesson(
        lessonId,
      )

      await refreshOverview()

      setSuccessMessage(
        'Foundation lesson deleted successfully.',
      )
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function moveLesson(
    module,
    lessonIndex,
    direction,
  ) {
    const nextIndex =
      lessonIndex + direction

    if (
      nextIndex < 0 ||
      nextIndex >= module.lessons.length
    ) {
      return
    }

    const nextLessons = [
      ...module.lessons,
    ]

    const currentLesson =
      nextLessons[lessonIndex]

    nextLessons[lessonIndex] =
      nextLessons[nextIndex]

    nextLessons[nextIndex] =
      currentLesson

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await reorderAdminFoundationLessons(
        module.id,
        nextLessons.map(
          (lesson) => lesson.id,
        ),
      )

      await refreshOverview()

      setSuccessMessage(
        'Lesson order updated successfully.',
      )
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  if (isLoading) {
    return (
      <section className="admin-foundations">
        <p>Loading foundations...</p>
      </section>
    )
  }

  return (
    <section className="admin-foundations">
      <header className="admin-foundations__header">
        <span>Learning Management</span>
        <h1>Foundations</h1>
        <p>
          Manage premium foundation levels,
          modules, and lessons.
        </p>
      </header>

      {errorMessage && (
        <div className="admin-foundations__message admin-foundations__message--error">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="admin-foundations__message admin-foundations__message--success">
          {successMessage}
        </div>
      )}

      <div className="admin-foundations__layout">
        <div className="admin-foundations__content">
          {levels.map((level) => (
            <article
              className="admin-foundations__level"
              key={level.id}
            >
              <div className="admin-foundations__level-header">
                <div>
                  <span>
                    Level {level.sortOrder}
                  </span>

                  <h2>{level.title}</h2>

                  <p>
                    {level.description ||
                      'No description'}
                  </p>
                </div>
              </div>

              <div className="admin-foundations__modules">
                {level.modules?.map(
                  (module) => (
                    <section
                      className="admin-foundations__module"
                      key={module.id}
                    >
                      <div className="admin-foundations__module-header">
                        <div>
                          <span>
                            Module{' '}
                            {module.sortOrder}
                          </span>

                          <h3>
                            {module.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            startCreate(
                              module.id,
                            )
                          }
                        >
                          + Add Lesson
                        </button>
                      </div>

                      {module.lessons?.length >
                      0 ? (
                        <div className="admin-foundations__lessons">
                          {module.lessons.map(
                            (
                              lesson,
                              lessonIndex,
                            ) => (
                              <article
                                className="admin-foundations__lesson"
                                key={lesson.id}
                              >
                                <div>
                                  <span>
                                    #
                                    {
                                      lesson.sortOrder
                                    }
                                  </span>

                                  <strong>
                                    {
                                      lesson.title
                                    }
                                  </strong>

                                  <small>
                                    {
                                      lesson.estimatedMinutes
                                    }{' '}
                                    min
                                  </small>
                                </div>

                                <div className="admin-foundations__lesson-actions">
                                  <button
                                    type="button"
                                    disabled={
                                      lessonIndex ===
                                      0
                                    }
                                    onClick={() =>
                                      moveLesson(
                                        module,
                                        lessonIndex,
                                        -1,
                                      )
                                    }
                                  >
                                    ↑
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      lessonIndex ===
                                      module.lessons
                                        .length -
                                        1
                                    }
                                    onClick={() =>
                                      moveLesson(
                                        module,
                                        lessonIndex,
                                        1,
                                      )
                                    }
                                  >
                                    ↓
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEdit(
                                        module.id,
                                        lesson,
                                      )
                                    }
                                  >
                                    Edit Metadata
                                  </button>

                                  <Link
                                    to={'/admin/foundations/lessons/' + lesson.id + '/edit'}
                                    className="admin-foundations__content-link"
                                  >
                                    Edit Content
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        lesson.id,
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </article>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="admin-foundations__empty">
                          No lessons yet.
                        </p>
                      )}
                    </section>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>

        <aside className="admin-foundations__editor">
          <h2>
            {editingLessonId
              ? 'Edit Foundation Lesson'
              : activeModule
                ? 'Create Foundation Lesson'
                : 'Lesson Editor'}
          </h2>

          {!activeModule ? (
            <p>
              Choose a module and click
              Add Lesson.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
            >
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleChange(
                      'title',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Slug</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    handleChange(
                      'slug',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Summary</span>
                <textarea
                  rows="4"
                  value={form.summary}
                  onChange={(event) =>
                    handleChange(
                      'summary',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Estimated Minutes
                </span>

                <input
                  type="number"
                  min="1"
                  max="300"
                  value={
                    form.estimatedMinutes
                  }
                  onChange={(event) =>
                    handleChange(
                      'estimatedMinutes',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="admin-foundations__published">
                <input
                  type="checkbox"
                  checked={
                    form.isPublished
                  }
                  onChange={(event) =>
                    handleChange(
                      'isPublished',
                      event.target.checked,
                    )
                  }
                />

                <span>Published</span>
              </label>

              <div className="admin-foundations__form-actions">
                <button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : editingLessonId
                      ? 'Save Changes'
                      : 'Create Lesson'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminFoundationsPage


