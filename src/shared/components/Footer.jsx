import logo from '../../assets/logo.png'
import './Footer.css'

const footerLinks = [
  {
    title: 'Learn',
    links: [
      { label: 'Foundations', href: '#foundations' },
      { label: 'Units 1–10', href: '#units' },
      { label: 'Study Plans', href: '#plans' },
      { label: 'Games', href: '#games' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Leaderboard', href: '#leaderboard' },
      { label: 'Subscriptions', href: '#subscriptions' },
      { label: 'Log in', href: '#login' },
      { label: 'My Progress', href: '#progress' },
    ],
  },
]

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="page-container site-footer__container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a href="#home" aria-label="JAK Academy home">
              <img
                className="site-footer__logo"
                src={logo}
                alt="JAK Academy"
              />
            </a>

            <p>
              A complete English-learning platform designed to help students
              build strong skills, practise effectively, and track real
              progress.
            </p>

            <div className="site-footer__contact">
              <span>Support and subscriptions</span>

              <a href="tel:+962796942353">
                0796942353
              </a>
            </div>
          </div>

          <div className="site-footer__links">
            {footerLinks.map((group) => (
              <div className="site-footer__link-group" key={group.title}>
                <h3>{group.title}</h3>

                <ul>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="site-footer__action">
            <span>Start learning today</span>

            <h3>Build your English with a clear learning path.</h3>

            <a href="#subscriptions">
              View subscription plans
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {currentYear} JAK Academy. All rights reserved.
          </p>

          <p>
            Created by Jalal Abu Khadra
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer