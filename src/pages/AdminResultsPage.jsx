import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getAdminExamResults,
} from '../features/admin/services/adminResultsService'

import './AdminResultsPage.css'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}

function AdminResultsPage() {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] =
    useState(true)
  const [errorMessage, setErrorMessage] =
    useState('')
  const [search, setSearch] =
    useState('')
  const [statusFilter, setStatusFilter] =
    useState('all')

  useEffect(() => {
    let isMounted = true

    async function loadResults() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getAdminExamResults()

        if (isMounted) {
          setResults(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Results could not be loaded.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredResults = useMemo(() => {
    const cleanSearch =
      search.trim().toLowerCase()

    return results.filter((item) => {
      const matchesSearch =
        !cleanSearch ||
        String(item.studentName || '')
          .toLowerCase()
          .includes(cleanSearch) ||
        String(item.examTitle || '')
          .toLowerCase()
          .includes(cleanSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [
    results,
    search,
    statusFilter,
  ])

  const completedResults =
    results.filter(
      (item) =>
        item.submittedAt ||
        item.status === 'submitted' ||
        item.status === 'graded',
    )

  const averageScore =
    completedResults.length > 0
      ? Math.round(
          completedResults.reduce(
            (sum, item) =>
              sum +
              Number(
                item.percentage || 0,
              ),
            0,
          ) /
            completedResults.length,
        )
      : 0

  const bestScore =
    completedResults.length > 0
      ? Math.max(
          ...completedResults.map(
            (item) =>
              Number(
                item.percentage || 0,
              ),
          ),
        )
      : 0

  if (isLoading) {
    return (
      <section className="admin-results">
        <div className="admin-results__state">
          Loading exam results...
        </div>
      </section>
    )
  }

  return (
    <section className="admin-results">
      <header className="admin-results__hero">
        <div>
          <span>Performance Center</span>
          <h1>Exam Results</h1>
          <p>
            Review student attempts,
            scores and submission
            history.
          </p>
        </div>
      </header>

      {errorMessage && (
        <div className="admin-results__error">
          {errorMessage}
        </div>
      )}

      {!errorMessage && (
        <>
          <div className="admin-results__stats">
            <article>
              <span>Total Attempts</span>
              <strong>
                {results.length}
              </strong>
            </article>

            <article>
              <span>
                Completed Attempts
              </span>
              <strong>
                {
                  completedResults.length
                }
              </strong>
            </article>

            <article>
              <span>Average Score</span>
              <strong>
                {averageScore}%
              </strong>
            </article>

            <article>
              <span>Best Score</span>
              <strong>
                {bestScore}%
              </strong>
            </article>
          </div>

          <div className="admin-results__toolbar">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search student or exam..."
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                All statuses
              </option>
              <option value="in_progress">
                In progress
              </option>
              <option value="submitted">
                Submitted
              </option>
              <option value="graded">
                Graded
              </option>
            </select>
          </div>

          <div className="admin-results__count">
            Showing{' '}
            {filteredResults.length}{' '}
            of {results.length} attempts
          </div>

          <div className="admin-results__table-wrap">
            <table className="admin-results__table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Answered</th>
                  <th>Started</th>
                  <th>Submitted</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="admin-results__empty"
                    >
                      No matching results.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(
                    (result) => (
                      <tr
                        key={
                          result.attemptId
                        }
                      >
                        <td>
                          <strong>
                            {
                              result.studentName
                            }
                          </strong>

                          <span>
                            {result.gradeLevel ||
                              '—'}
                            {' · '}
                            {result.cohort ||
                              '—'}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {
                              result.examTitle
                            }
                          </strong>

                          <span>
                            Version{' '}
                            {
                              result.examVersion
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-results__status admin-results__status--${result.status}`}
                          >
                            {result.status}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {Number(
                              result.percentage ||
                                0,
                            ).toFixed(1)}
                            %
                          </strong>

                          <span>
                            {
                              result.earnedPoints
                            }
                            {' / '}
                            {
                              result.totalPoints
                            }
                          </span>
                        </td>

                        <td>
                          {
                            result.correctCount
                          }
                        </td>

                        <td>
                          {
                            result.answeredCount
                          }
                        </td>

                        <td>
                          {formatDate(
                            result.startedAt,
                          )}
                        </td>

                        <td>
                          {formatDate(
                            result.submittedAt,
                          )}
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default AdminResultsPage
