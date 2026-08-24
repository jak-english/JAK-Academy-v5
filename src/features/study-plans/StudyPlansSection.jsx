import { useNavigate } from 'react-router-dom'
import SectionHeader from '../../shared/components/SectionHeader'
import './StudyPlansSection.css'

const studyPlans = [
  {
    id: 'daily',
    icon: '☀️',
    label: 'Daily Plan',
    title: 'Study in 30 minutes a day',
    description:
      'A focused daily routine combining vocabulary, grammar, reading, and quick practice.',
    duration: '30 minutes',
    tasks: 4,
  },
  {
    id: 'weekly',
    icon: '📅',
    label: 'Weekly Plan',
    title: 'Build steady weekly progress',
    description:
      'A balanced seven-day plan designed to keep every English skill active and organized.',
    duration: '7 days',
    tasks: 18,
    featured: true,
  },
  {
    id: 'exam',
    icon: '🎯',
    label: 'Exam Plan',
    title: 'Prepare with a clear target',
    description:
      'A structured revision path with focused lessons, practice exams, and weakness tracking.',
    duration: '4 weeks',
    tasks: 32,
  },
]

function StudyPlansSection() {
  const navigate = useNavigate()

  return (
    <section id="plans" className="study-plans-section page-section">
      <div className="page-container">
        <SectionHeader
          eyebrow="Learn with a clear routine"
          title="Study plans that keep you moving"
          description="Choose a structured plan, complete manageable tasks, and track your progress without feeling lost."
        />

        <div className="study-plans-grid">
          {studyPlans.map((plan) => (
            <article
              className={`study-plan-card ${
                plan.featured ? 'study-plan-card--featured' : ''
              }`}
              key={plan.id}
            >
              {plan.featured && (
                <span className="study-plan-card__badge">
                  Recommended
                </span>
              )}

              <div className="study-plan-card__icon" aria-hidden="true">
                {plan.icon}
              </div>

              <span className="study-plan-card__label">
                {plan.label}
              </span>

              <h3 className="study-plan-card__title">
                {plan.title}
              </h3>

              <p className="study-plan-card__description">
                {plan.description}
              </p>

              <div className="study-plan-card__details">
                <div>
                  <span>Duration</span>
                  <strong>{plan.duration}</strong>
                </div>

                <div>
                  <span>Tasks</span>
                  <strong>{plan.tasks}</strong>
                </div>
              </div>

              <button
                className="study-plan-card__button"
                type="button"
                onClick={() => navigate('/student/study-plan')}
              >
                View plan
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StudyPlansSection