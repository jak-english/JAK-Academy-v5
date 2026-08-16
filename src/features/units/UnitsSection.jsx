import { UNITS } from '../../data/homeData'
import SectionHeader from '../../shared/components/SectionHeader'
import './UnitsSection.css'

function UnitsSection() {
  return (
    <section id="units" className="units-section page-section">
      <div className="page-container">
        <SectionHeader
          eyebrow="Complete learning path"
          title="Explore Units 1–10"
          description="Each unit combines vocabulary, grammar, reading, writing, speaking, and extra practice in one organized learning journey."
        />

        <div className="units-grid">
          {UNITS.map((unit) => (
            <article
              className={`unit-card ${
                unit.isFree ? 'unit-card--free' : 'unit-card--locked'
              }`}
              key={unit.id}
            >
              <div className="unit-card__header">
                <span className="unit-card__number">
                  {String(unit.number).padStart(2, '0')}
                </span>

                <span
                  className={`unit-card__status ${
                    unit.isFree
                      ? 'unit-card__status--free'
                      : 'unit-card__status--locked'
                  }`}
                >
                  {unit.isFree ? 'Free' : 'Premium'}
                </span>
              </div>

              <h3 className="unit-card__title">{unit.title}</h3>

              <p className="unit-card__description">
                Complete lessons, exams, practice activities, and progress
                tracking for all essential English skills.
              </p>

              <ul className="unit-card__skills">
                {unit.sections.map((section) => (
                  <li key={`${unit.id}-${section.id}`}>
                    {section.title}
                  </li>
                ))}
              </ul>

              <button
                className="unit-card__button"
                type="button"
              >
                {unit.isFree ? 'Open free unit' : 'Unlock unit'}
                <span aria-hidden="true">
                  {unit.isFree ? '→' : '🔒'}
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UnitsSection
