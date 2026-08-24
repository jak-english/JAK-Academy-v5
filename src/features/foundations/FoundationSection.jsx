import { useNavigate } from 'react-router-dom'
import { FOUNDATION_TOPICS } from '../../data/homeData'
import SectionHeader from '../../shared/components/SectionHeader'
import './FoundationSection.css'

function FoundationSection() {
  const navigate = useNavigate()

  return (
    <section id="foundations" className="foundations-section page-section">
      <div className="page-container">
        <SectionHeader
          eyebrow="Start from the basics"
          title="Build a strong English foundation"
          description="Master the essential skills you need before moving to advanced lessons and complete units."
        />

        <div className="foundations-grid">
          {FOUNDATION_TOPICS.map((topic, index) => (
            <article className="foundation-card" key={topic.id}>
              <div className="foundation-card__top">
                <span className="foundation-card__number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="foundation-card__icon" aria-hidden="true">
                  {topic.icon}
                </span>
              </div>

              <h3 className="foundation-card__title">
                {topic.title}
              </h3>

              <p className="foundation-card__description">
                Learn the essential rules and practise them through clear,
                organized activities.
              </p>

              <button
                className="foundation-card__button"
                type="button"
                onClick={() => navigate('/student/foundations')}
              >
                Start lesson
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FoundationSection
