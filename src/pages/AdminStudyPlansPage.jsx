import {
  useEffect,
  useState,
} from 'react'

import {
  getAdminStudyPlanSettings,
  updateAdminStudyPlanSettings,
} from '../features/admin/services/adminStudyPlansService'

import './AdminStudyPlansPage.css'

function AdminStudyPlansPage() {
  const [settings, setSettings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingCourseId, setSavingCourseId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')


  useEffect(() => {
    let isMounted = true

    async function loadInitialSettings() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getAdminStudyPlanSettings()

        if (isMounted) {
          setSettings(data)
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

    loadInitialSettings()

    return () => {
      isMounted = false
    }
  }, [])

  function handleFieldChange(
    courseId,
    field,
    value,
  ) {
    setSettings((current) =>
      current.map((item) =>
        item.courseId === courseId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    )
  }

  async function handleSave(item) {
    try {
      setSavingCourseId(item.courseId)
      setErrorMessage('')
      setSuccessMessage('')

      const updated =
        await updateAdminStudyPlanSettings({
          courseId: item.courseId,
          dailyStudyMinutes:
            Number(item.dailyStudyMinutes),
          dailyLessonCount:
            Number(item.dailyLessonCount),
          upcomingLessonCount:
            Number(item.upcomingLessonCount),
          isActive: item.isActive,
        })

      setSettings((current) =>
        current.map((setting) =>
          setting.courseId === item.courseId
            ? {
                ...setting,
                ...updated,
              }
            : setting,
        ),
      )

      setSuccessMessage(
        'Study plan settings saved successfully.',
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSavingCourseId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="admin-study-plans">
        <p>Loading study plan settings...</p>
      </section>
    )
  }

  return (
    <section className="admin-study-plans">
      <header className="admin-study-plans__header">
        <div>
          <span>Learning Management</span>
          <h1>Study Plans</h1>
          <p>
            Control the daily study goals and upcoming
            lesson count for each course.
          </p>
        </div>
      </header>

      {errorMessage && (
        <div className="admin-study-plans__message admin-study-plans__message--error">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="admin-study-plans__message admin-study-plans__message--success">
          {successMessage}
        </div>
      )}

      {settings.length === 0 ? (
        <div className="admin-study-plans__empty">
          No study plan settings found.
        </div>
      ) : (
        <div className="admin-study-plans__grid">
          {settings.map((item) => (
            <article
              className="admin-study-plans__card"
              key={item.courseId}
            >
              <div className="admin-study-plans__card-header">
                <div>
                  <span>
                    {item.cohort ||
                      'Cohort not set'}
                  </span>

                  <h2>
                    {item.courseTitle}
                  </h2>

                  <p>
                    {item.gradeLevel ||
                      'Grade not set'}
                  </p>
                </div>

                <label className="admin-study-plans__active">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(event) =>
                      handleFieldChange(
                        item.courseId,
                        'isActive',
                        event.target.checked,
                      )
                    }
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="admin-study-plans__fields">
                <label>
                  <span>
                    Daily study minutes
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={
                      item.dailyStudyMinutes
                    }
                    onChange={(event) =>
                      handleFieldChange(
                        item.courseId,
                        'dailyStudyMinutes',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Daily lesson goal
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={
                      item.dailyLessonCount
                    }
                    onChange={(event) =>
                      handleFieldChange(
                        item.courseId,
                        'dailyLessonCount',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Upcoming lessons
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={
                      item.upcomingLessonCount
                    }
                    onChange={(event) =>
                      handleFieldChange(
                        item.courseId,
                        'upcomingLessonCount',
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <button
                type="button"
                className="admin-study-plans__save"
                onClick={() =>
                  handleSave(item)
                }
                disabled={
                  savingCourseId ===
                  item.courseId
                }
              >
                {savingCourseId ===
                item.courseId
                  ? 'Saving...'
                  : 'Save Settings'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminStudyPlansPage



