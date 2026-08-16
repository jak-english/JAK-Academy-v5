import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import ExamEditorModal from '../features/admin/components/ExamEditorModal'
import ExamQuestionManagerModal from '../features/admin/components/ExamQuestionManagerModal'

import {
  listAdminExams,
} from '../features/admin/services/adminExamService'

import './AdminExamsPage.css'

const statusLabels = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

function AdminExamsPage() {
  const [exams, setExams] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [status, setStatus] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [isEditorOpen, setIsEditorOpen] =
    useState(false)

  const [editingExam, setEditingExam] =
    useState(null)

  const [managingExam, setManagingExam] =
    useState(null)

  const loadExams = useCallback(
    async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await listAdminExams({
            status: status || null,
            search: search || null,
            limit: 100,
            offset: 0,
          })

        setExams(data)
      } catch (error) {
        setErrorMessage(
          error.message ||
            'Unable to load exams.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      search,
      status,
    ],
  )

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadExams()
      }, 250)

    return () =>
      window.clearTimeout(timer)
  }, [loadExams])

  const totals = useMemo(
    () => ({
      exams: exams.length,

      questions:
        exams.reduce(
          (total, exam) =>
            total +
            Number(
              exam.question_count || 0,
            ),
          0,
        ),

      points:
        exams.reduce(
          (total, exam) =>
            total +
            Number(
              exam.total_points || 0,
            ),
          0,
        ),
    }),
    [exams],
  )

  return (
    <div className="admin-exams-page">
      <header className="admin-exams-hero">
        <div>
          <span className="admin-exams-eyebrow">
            Assessment
          </span>

          <h1>Exams</h1>

          <p>
            Build and manage exams using
            the central Question Bank.
          </p>
        </div>

        <button
          type="button"
          className="admin-exams-primary"
          onClick={() => {
            setEditingExam(null)
            setIsEditorOpen(true)
          }}
        >
          + New Exam
        </button>
      </header>

      <section className="admin-exams-summary">
        <article>
          <span>Exams</span>
          <strong>
            {totals.exams}
          </strong>
        </article>

        <article>
          <span>Questions</span>
          <strong>
            {totals.questions}
          </strong>
        </article>

        <article>
          <span>Total Points</span>
          <strong>
            {totals.points}
          </strong>
        </article>
      </section>

      <section className="admin-exams-toolbar">
        <label>
          <span>Search</span>

          <input
            type="search"
            value={search}
            placeholder="Search exams..."
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          <span>Status</span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>

            <option value="archived">
              Archived
            </option>
          </select>
        </label>
      </section>

      {errorMessage ? (
        <div className="admin-exams-alert">
          {errorMessage}
        </div>
      ) : null}

      <section className="admin-exams-content">
        {isLoading ? (
          <div className="admin-exams-empty">
            Loading exams...
          </div>
        ) : exams.length === 0 ? (
          <div className="admin-exams-empty">
            No exams found.
          </div>
        ) : (
          <div className="admin-exams-grid">
            {exams.map((exam) => (
              <article
                className="admin-exam-card"
                key={exam.id}
              >
                <div className="admin-exam-card__top">
                  <div>
                    <span className="admin-exam-card__label">
                      Exam
                    </span>

                    <h2>
                      {exam.title}
                    </h2>
                  </div>

                  <span
                    className={
                      'admin-exam-card__status ' +
                      'admin-exam-card__status--' +
                      exam.status
                    }
                  >
                    {statusLabels[
                      exam.status
                    ] || exam.status}
                  </span>
                </div>

                <p className="admin-exam-card__description">
                  {exam.description ||
                    'No description.'}
                </p>

                <div className="admin-exam-card__stats">
                  <div>
                    <span>
                      Questions
                    </span>

                    <strong>
                      {Number(
                        exam.question_count ||
                          0,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Points
                    </span>

                    <strong>
                      {Number(
                        exam.total_points ||
                          0,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Duration
                    </span>

                    <strong>
                      {exam.duration_minutes
                        ? exam.duration_minutes +
                          ' min'
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Version
                    </span>

                    <strong>
                      v{exam.version}
                    </strong>
                  </div>
                </div>

                <footer className="admin-exam-card__footer">
                  <span>
                    Source Question Set
                  </span>

                  <code>
                    {exam.source_question_set_id ||
                      'None'}
                  </code>

                  <div className="admin-exam-card__actions">
                    <button
                      type="button"
                      className="admin-exam-card__edit"
                      onClick={() => {
                        setEditingExam(exam)
                        setIsEditorOpen(true)
                      }}
                    >
                      Edit Exam
                    </button>

                    <button
                      type="button"
                      className="admin-exam-card__manage"
                      onClick={() =>
                        setManagingExam(exam)
                      }
                    >
                      Manage Questions
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
      {managingExam ? (
        <ExamQuestionManagerModal
          exam={managingExam}
          onClose={() =>
            setManagingExam(null)
          }
          onSaved={async () => {
            setManagingExam(null)
            await loadExams()
          }}
        />
      ) : null}

      {isEditorOpen ? (
        <ExamEditorModal
          exam={editingExam}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingExam(null)
          }}
          onSaved={async () => {
            setIsEditorOpen(false)
            setEditingExam(null)
            await loadExams()
          }}
        />
      ) : null}
    </div>
  )
}

export default AdminExamsPage



