import { useNavigate } from 'react-router-dom'
import SectionHeader from '../../shared/components/SectionHeader'
import './LeaderboardSection.css'

const leaderboardStudents = [
  {
    id: 'student-1',
    rank: 1,
    name: 'Sara Ahmad',
    initials: 'SA',
    points: 2480,
    progress: 94,
    badge: 'Champion',
  },
  {
    id: 'student-2',
    rank: 2,
    name: 'Omar Khaled',
    initials: 'OK',
    points: 2315,
    progress: 89,
    badge: 'Excellent',
  },
  {
    id: 'student-3',
    rank: 3,
    name: 'Lina Mohammad',
    initials: 'LM',
    points: 2190,
    progress: 86,
    badge: 'Rising Star',
  },
  {
    id: 'student-4',
    rank: 4,
    name: 'Yousef Ali',
    initials: 'YA',
    points: 1980,
    progress: 81,
    badge: 'Focused',
  },
  {
    id: 'student-5',
    rank: 5,
    name: 'Noor Sami',
    initials: 'NS',
    points: 1840,
    progress: 78,
    badge: 'Consistent',
  },
]

function LeaderboardSection() {
  const navigate = useNavigate()

  return (
    <section
      id="leaderboard"
      className="leaderboard-section page-section"
    >
      <div className="page-container">
        <SectionHeader
          eyebrow="Earn points through real progress"
          title="JAK Academy leaderboard"
          description="Students move up by completing lessons, passing exams, maintaining study streaks, and achieving genuine learning milestones."
        />

        <div className="leaderboard-layout">
          <div className="leaderboard-highlight">
            <span className="leaderboard-highlight__eyebrow">
              Monthly challenge
            </span>

            <h3>Learn, achieve, and reach the top</h3>

            <p>
              The leaderboard rewards consistent learning—not random clicks.
              Every point must come from a verified achievement.
            </p>

            <div className="leaderboard-highlight__reward">
              <span aria-hidden="true">🏆</span>

              <div>
                <small>Top learner reward</small>
                <strong>Monthly recognition and prize</strong>
              </div>
            </div>

            <button
              className="leaderboard-highlight__button"
              type="button"
              onClick={() => navigate('/student')}
            >
              View my progress
            </button>
          </div>

          <div className="leaderboard-table">
            <div className="leaderboard-table__header">
              <span>Rank</span>
              <span>Student</span>
              <span>Progress</span>
              <span>Points</span>
            </div>

            <div className="leaderboard-table__body">
              {leaderboardStudents.map((student) => (
                <article
                  className={`leaderboard-row leaderboard-row--rank-${student.rank}`}
                  key={student.id}
                >
                  <div className="leaderboard-row__rank">
                    {student.rank <= 3 ? (
                      <span aria-label={`Rank ${student.rank}`}>
                        {student.rank === 1
                          ? '🥇'
                          : student.rank === 2
                            ? '🥈'
                            : '🥉'}
                      </span>
                    ) : (
                      <strong>{student.rank}</strong>
                    )}
                  </div>

                  <div className="leaderboard-row__student">
                    <span className="leaderboard-row__avatar">
                      {student.initials}
                    </span>

                    <div>
                      <strong>{student.name}</strong>
                      <small>{student.badge}</small>
                    </div>
                  </div>

                  <div className="leaderboard-row__progress">
                    <div>
                      <span style={{ width: `${student.progress}%` }} />
                    </div>

                    <small>{student.progress}%</small>
                  </div>

                  <strong className="leaderboard-row__points">
                    {student.points.toLocaleString()}
                  </strong>
                </article>
              ))}
            </div>
          </div>
        </div>

        <p className="leaderboard-section__note">
          The names and scores shown here are temporary design examples. Real
          student rankings will later come securely from Supabase.
        </p>
      </div>
    </section>
  )
}

export default LeaderboardSection