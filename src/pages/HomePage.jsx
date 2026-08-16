import Header from '../shared/components/Header'
import UnitsSection from '../features/units/UnitsSection'
import StudyPlansSection from '../features/study-plans/StudyPlansSection'
import FoundationSection from '../features/foundations/FoundationSection'
import GamesSection from '../features/games/GamesSection'
import SubscriptionsSection from '../features/subscriptions/SubscriptionsSection'
import LeaderboardSection from '../features/leaderboard/LeaderboardSection'
import heroImage from '../assets/hero.png'
import './HomePage.css'
import Footer from '../shared/components/Footer'

function HomePage() {
  return (
    <div className="site-page" dir="ltr">
      <Header />

      <main id="main-content">
      <section id="home" className="home-hero">
  <div className="home-hero__background" aria-hidden="true">
    <span className="home-hero__glow home-hero__glow--blue" />
    <span className="home-hero__glow home-hero__glow--gold" />
    <span className="home-hero__grid" />
  </div>

  <div className="page-container home-hero__container">
    <div className="home-hero__content">
      <div className="home-hero__badge">
        <span className="home-hero__badge-dot" />
        The smarter way to master English
      </div>

      <h1 className="home-hero__title">
        Build stronger English.
        <span>Unlock real confidence.</span>
      </h1>

      <p className="home-hero__description">
        A complete learning experience with structured units, interactive
        exams, intelligent practice, and clear progress tracking—all in one
        modern platform.
      </p>

      <div className="home-hero__actions">
        <a className="home-hero__primary-button" href="#units">
          <span>Start Learning</span>
          <span aria-hidden="true">→</span>
        </a>

        <a className="home-hero__secondary-button" href="#foundations">
          Explore Foundations
        </a>
      </div>

      <div className="home-hero__trust">
        <div className="home-hero__trust-avatars" aria-hidden="true">
          <span>JA</span>
          <span>SA</span>
          <span>OK</span>
          <span>+</span>
        </div>

        <div className="home-hero__trust-content">
          <div className="home-hero__trust-stars" aria-label="Five stars">
            ★★★★★
          </div>

          <p>Designed for focused, measurable learning</p>
        </div>
      </div>

      <div className="home-hero__statistics">
        <div className="home-hero__statistic">
          <strong>10</strong>
          <span>Complete Units</span>
        </div>

        <div className="home-hero__statistic">
          <strong>6</strong>
          <span>Core Skills</span>
        </div>

        <div className="home-hero__statistic">
          <strong>24/7</strong>
          <span>Learning Access</span>
        </div>
      </div>
    </div>

    <div className="home-hero__visual">
      <div className="home-hero__visual-shell">
        <div className="home-hero__visual-topbar">
          <div className="home-hero__window-controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <span className="home-hero__visual-label">
            Student Dashboard
          </span>

          <span className="home-hero__visual-status">
            <span />
            Online
          </span>
        </div>

        <div className="home-hero__image-frame">
          <img
            className="home-hero__image"
            src={heroImage}
            alt="Student learning English with JAK Academy"
          />

          <div className="home-hero__image-overlay">
            <span>Today’s learning goal</span>

            <strong>Complete Unit 1 Grammar</strong>

            <div className="home-hero__goal-progress">
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="home-hero__floating-card home-hero__floating-card--progress">
        <div className="home-hero__progress-ring">
          <span>82%</span>
        </div>

        <div>
          <small>Weekly progress</small>
          <strong>Excellent pace</strong>
        </div>
      </div>

      <div className="home-hero__floating-card home-hero__floating-card--achievement">
        <span className="home-hero__achievement-icon" aria-hidden="true">
          ★
        </span>

        <div>
          <small>Achievement unlocked</small>
          <strong>Grammar Master</strong>
        </div>
      </div>

      <div className="home-hero__floating-card home-hero__floating-card--streak">
        <span aria-hidden="true">🔥</span>

        <div>
          <strong>7-day streak</strong>
          <small>Keep learning</small>
        </div>
      </div>

      <div className="home-hero__floating-card home-hero__floating-card--score">
        <small>Latest exam</small>
        <strong>94%</strong>
        <span>Top performance</span>
      </div>
    </div>
  </div>

  <div className="home-hero__bottom-strip">
    <div className="page-container home-hero__bottom-strip-content">
      <span>Vocabulary</span>
      <span>Grammar</span>
      <span>Reading</span>
      <span>Writing</span>
      <span>Speaking</span>
      <span>Interactive Exams</span>
    </div>
  </div>
</section>
        <FoundationSection />
       <UnitsSection /> 
       <StudyPlansSection />
       <GamesSection />
       <SubscriptionsSection />
       <LeaderboardSection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage