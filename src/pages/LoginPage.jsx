import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

const initialFormData = {
  email: '',
  password: '',
  remember: false,
}

const roleDestinations = {
  super_admin: '/admin',
  teacher: '/',
  student: '/student',
}

function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))

    setMessage('')
  }

  function validateForm() {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      nextErrors.password =
        'Password must contain at least 6 characters.'
    }

    return nextErrors
  }

  async function getUserRole(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data?.role || 'student'
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setMessage('')
      return
    }

    setErrors({})
    setMessage('')
    setIsSubmitting(true)

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        })

      if (error) {
        setMessage('The email or password is incorrect.')
        return
      }

      const userId = data.user?.id

      if (!userId) {
        setMessage(
          'The account was signed in, but the user profile could not be identified.',
        )
        return
      }

      const role = await getUserRole(userId)
      const destination = roleDestinations[role] || '/'

      navigate(destination, { replace: true })
    } catch (error) {
      console.error('Login error:', error)

      setMessage(
        'Your account was signed in, but your profile could not be loaded.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page" dir="ltr">
      <div
        className="login-page__background"
        aria-hidden="true"
      >
        <span className="login-page__glow login-page__glow--blue" />
        <span className="login-page__glow login-page__glow--gold" />
        <span className="login-page__grid" />
      </div>

      <section className="login-page__layout">
        <div className="login-page__intro">
          <Link
            className="login-page__brand"
            to="/"
            aria-label="Return to JAK Academy home"
          >
            <img src={logo} alt="JAK Academy" />
          </Link>

          <span className="login-page__eyebrow">
            Welcome back
          </span>

          <h1>
            Continue your English
            <span> learning journey.</span>
          </h1>

          <p>
            Access your lessons, exams, study plans,
            achievements, and personal progress from one
            organized dashboard.
          </p>

          <div className="login-page__benefits">
            <div>
              <strong>10</strong>
              <span>Complete units</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Learning access</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Clear learning path</span>
            </div>
          </div>
        </div>

        <div className="login-page__panel">
          <div className="login-card">
            <div className="login-card__header">
              <span>Secure account access</span>

              <h2>Log in to your account</h2>

              <p>
                Enter your account details to continue.
              </p>
            </div>

            <form
              className="login-card__form"
              noValidate
              onSubmit={handleSubmit}
            >
              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="student@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? 'login-email-error'
                    : undefined
                }
                onChange={handleChange}
              />

              {errors.email && (
                <p
                  className="login-card__error"
                  id="login-email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}

              <div className="login-card__password-heading">
                <label htmlFor="login-password">
                  Password
                </label>

                <Link
                    className="login-card__forgot-link"
                    to="/forgot-password"
                  >
                    Forgot password?
                  </Link>
              </div>

              <input
                id="login-password"
                name="password"
                type="password"
                value={formData.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? 'login-password-error'
                    : undefined
                }
                onChange={handleChange}
              />

              {errors.password && (
                <p
                  className="login-card__error"
                  id="login-password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}

              <label className="login-card__remember">
                <input
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                />

                <span>Remember me</span>
              </label>

              <button
                className="login-card__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Logging in...'
                  : 'Log in'}

                {!isSubmitting && (
                  <span aria-hidden="true">→</span>
                )}
              </button>

              {message && (
                <p
                  className="login-card__message"
                  role="alert"
                >
                  {message}
                </p>
              )}
            </form>

            <p className="login-card__signup">
              Don&apos;t have an account?
              <Link to="/register">Create account</Link>
            </p>

              <Link
                className="login-card__home-link"
                to="/"
              >
                Back to home
              </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
