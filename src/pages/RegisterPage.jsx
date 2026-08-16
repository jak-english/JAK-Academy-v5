import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

const initialFormData = {
  fullName: '',
  email: '',
  password: '',
}

function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
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

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    } else if (formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Full name must contain at least 3 characters.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must contain at least 8 characters.'
    }

    return nextErrors
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
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
        },
      },
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data.session) {
      setMessage(
        'Account created successfully. Check your email to confirm your account.',
      )
    } else {
      setMessage('Account created successfully.')
    }

    setFormData(initialFormData)
  } catch (error) {
    console.error('Registration error:', error)

    setMessage(
      'An unexpected error occurred. Please try again.',
    )
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <main className="login-page" dir="ltr">
      <div className="login-page__background" aria-hidden="true">
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
            Join JAK Academy
          </span>

          <h1>
            Start building stronger
            <span> English skills.</span>
          </h1>

          <p>
            Create your student account to access lessons, exams, study plans,
            games, achievements, and personal progress tracking.
          </p>

          <div className="login-page__benefits">
            <div>
              <strong>Free</strong>
              <span>Unit 1 access</span>
            </div>

            <div>
              <strong>10</strong>
              <span>Complete units</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Learning access</span>
            </div>
          </div>
        </div>

        <div className="login-page__panel">
          <div className="login-card">
            <div className="login-card__header">
              <span>Student registration</span>

              <h2>Create your account</h2>

              <p>
                Enter your details to begin your learning journey.
              </p>
            </div>

            <form
              className="login-card__form"
              noValidate
              onSubmit={handleSubmit}
            >
              <label htmlFor="register-name">
                Full name
              </label>

              <input
                id="register-name"
                name="fullName"
                type="text"
                value={formData.fullName}
                placeholder="Enter your full name"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? 'register-name-error' : undefined
                }
                onChange={handleChange}
              />

              {errors.fullName && (
                <p
                  className="login-card__error"
                  id="register-name-error"
                  role="alert"
                >
                  {errors.fullName}
                </p>
              )}

              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="student@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'register-email-error' : undefined
                }
                onChange={handleChange}
              />

              {errors.email && (
                <p
                  className="login-card__error"
                  id="register-email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                value={formData.password}
                placeholder="Create a password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'register-password-error' : undefined
                }
                onChange={handleChange}
              />

              {errors.password && (
                <p
                  className="login-card__error"
                  id="register-password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}

             <button
  className="login-card__submit"
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Creating account...' : 'Create account'}

  {!isSubmitting && (
    <span aria-hidden="true">→</span>
  )}
</button>

              {message && (
                <p className="login-card__message" role="status">
                  {message}
                </p>
              )}
            </form>

            <p className="login-card__signup">
              Already have an account?
              <Link to="/login">Log in</Link>
            </p>

            <Link className="login-card__home-link" to="/">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage