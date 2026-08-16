import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (password.length < 6) {
      setMessage(
        'Password must contain at least 6 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        throw error
      }

      setMessage(
        'Your password has been updated successfully.',
      )

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } catch (error) {
      console.error('Password update error:', error)

      setMessage(
        error.message ||
          'Your password could not be updated.',
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
            Secure Recovery
          </span>

          <h1>
            Create your
            <span>new password.</span>
          </h1>

          <p>
            Choose a new password for your JAK Academy
            account and continue your learning journey.
          </p>
        </section>

        <section className="login-page__panel">
          <div className="login-card">
            <header className="login-card__header">
              <span>Account recovery</span>

              <h2>Create a new password</h2>

              <p>
                Enter and confirm your new password below.
              </p>
            </header>

            <form
              className="login-card__form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="new-password">
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                placeholder="Enter new password"
                autoComplete="new-password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                placeholder="Confirm new password"
                autoComplete="new-password"
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
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
                  ? 'Updating...'
                  : 'Update password'}
              </button>
            </form>

            <div className="login-card__signup">
              <span>Return to</span>
              <Link to="/login">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ResetPasswordPage