import { useState } from 'react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setMessage('Enter your email address.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const redirectTo =
        `${window.location.origin}/reset-password`

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          { redirectTo },
        )

      if (error) {
        throw error
      }

      setMessage(
        'Password reset instructions have been sent to your email.',
      )
    } catch (error) {
      console.error('Password reset request error:', error)

      setMessage(
        error.message ||
          'Password reset instructions could not be sent.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div
        className="login-page__background"
        aria-hidden="true"
      >
        <span className="login-page__glow login-page__glow--blue" />
        <span className="login-page__glow login-page__glow--gold" />
        <span className="login-page__grid" />
      </div>

      <div className="login-page__layout">
        <section className="login-page__intro">
          <Link
            className="login-page__brand"
            to="/"
            aria-label="JAK Academy home"
          >
            <img src={logo} alt="JAK Academy" />
          </Link>

          <span className="login-page__eyebrow">
            Account Recovery
          </span>

          <h1>
            Recover your
            <span>JAK Academy account.</span>
          </h1>

          <p>
            Enter your registered email address and we will
            send you a secure link to create a new password.
          </p>
        </section>

        <section className="login-page__panel">
          <div className="login-card">
            <header className="login-card__header">
              <span>Password reset</span>

              <h2>Forgot your password?</h2>

              <p>
                Enter the email address linked to your account.
              </p>
            </header>

            <form
              className="login-card__form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="reset-email">
                Email address
              </label>

              <input
                id="reset-email"
                type="email"
                value={email}
                placeholder="Enter your email"
                autoComplete="email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              {message && (
                <p
                  className="login-card__message"
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                className="login-card__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Sending...'
                  : 'Send reset link'}
              </button>
            </form>

            <div className="login-card__signup">
              <span>Remembered your password?</span>
              <Link to="/login">
                Back to login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ForgotPasswordPage