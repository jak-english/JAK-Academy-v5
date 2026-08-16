import { GAME_CATEGORIES } from '../../data/homeData'
import SectionHeader from '../../shared/components/SectionHeader'
import './GamesSection.css'

function GamesSection() {
  return (
    <section id="games" className="games-section page-section">
      <div className="page-container">
        <SectionHeader
          eyebrow="Learn through play"
          title="Practise English with interactive games"
          description="Turn revision into a challenge with focused games for vocabulary, spelling, meanings, and irregular verbs."
        />

        <div className="games-grid">
          {GAME_CATEGORIES.map((game, index) => (
            <article className="game-card" key={game.id}>
              <div className="game-card__header">
                <span className="game-card__icon" aria-hidden="true">
                  {game.icon}
                </span>

                <span className="game-card__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="game-card__title">{game.title}</h3>

              <p className="game-card__description">
                {game.description}
              </p>

              <div className="game-card__footer">
                <span className="game-card__label">
                  Quick practice
                </span>

                <button className="game-card__button" type="button">
                  Play now
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GamesSection