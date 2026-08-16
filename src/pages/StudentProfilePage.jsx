import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'

import {
  getStudentProfile,
  updateStudentProfile,
} from '../features/student/services/studentProfileService'

import './StudentProfilePage.css'

function formatDate(value) {
  if (!value) {
    return 'غير محدد'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد'
  }

  return new Intl.DateTimeFormat(
    'ar-JO',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}

function StudentProfilePage() {
  const navigate = useNavigate()

  const [profile, setProfile] =
    useState(null)

  const [fullName, setFullName] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSaving, setIsSaving] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        setIsLoading(true)

        const data =
          await getStudentProfile()

        if (!isMounted) {
          return
        }

        setProfile(data)
        setFullName(
          data.fullName || '',
        )
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل الملف الشخصي.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSave() {
    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const cleanName =
        fullName.trim()

      if (!cleanName) {
        throw new Error(
          'الاسم الكامل مطلوب.',
        )
      }

      const updated =
        await updateStudentProfile({
          fullName: cleanName,
          avatarUrl:
            profile?.avatarUrl || null,
        })

      setProfile(updated)

      setFullName(
        updated.fullName || '',
      )

      setSuccessMessage(
        'تم تحديث الملف الشخصي بنجاح.',
      )
    } catch (error) {
      setErrorMessage(
        error.message ||
          'تعذر تحديث الملف الشخصي.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main
        className="student-profile-page"
        dir="rtl"
      >
        <div className="student-profile-state">
          <div className="student-profile-loader" />

          <strong>
            جارٍ تحميل ملفك الشخصي
          </strong>

          <span>
            نجهّز معلومات حسابك...
          </span>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main
        className="student-profile-page"
        dir="rtl"
      >
        <div className="student-profile-state">
          <div className="student-profile-error">
            <strong>
              تعذر فتح الملف الشخصي
            </strong>

            <p>
              {errorMessage ||
                'الملف الشخصي غير متاح.'}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/student')
              }
            >
              العودة إلى الرئيسية
            </button>
          </div>
        </div>
      </main>
    )
  }

  const avatar =
    profile.avatarUrl

  const initial =
    profile.fullName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || 'S'

  const academicLabel =
    profile.gradeLevel ||
    profile.cohort
      ? `${
          profile.gradeLevel || ''
        }${
          profile.gradeLevel &&
          profile.cohort
            ? ' / '
            : ''
        }${
          profile.cohort
            ? `جيل ${profile.cohort}`
            : ''
        }`
      : 'طالب JAK Academy'

  return (
    <main
      className="student-profile-page"
      dir="rtl"
    >
      <div className="student-profile-background">
        <span className="student-profile-glow student-profile-glow--blue" />
        <span className="student-profile-glow student-profile-glow--gold" />
      </div>

      <header className="student-profile-navbar">
        <div className="student-profile-navbar__inner">
          <button
            type="button"
            className="student-profile-navbar__brand"
            onClick={() =>
              navigate('/student')
            }
          >
            <img
              src={logo}
              alt="JAK Academy"
            />
          </button>

          <nav className="student-profile-navbar__links">
            <button
              type="button"
              onClick={() =>
                navigate('/student')
              }
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student?section=units',
                )
              }
            >
              الوحدات
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/study-plan',
                )
              }
            >
              خطتي الدراسية
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/achievements',
                )
              }
            >
              الإنجازات
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/results',
                )
              }
            >
              النتائج
            </button>

            <button
              type="button"
              className="is-active"
            >
              الملف الشخصي
            </button>
          </nav>
        </div>
      </header>

      <div className="student-profile-content">
        <section className="student-profile-hero">
          <div className="student-profile-hero__copy">
            <span className="student-profile-hero__eyebrow">
              JAK STUDENT PROFILE
            </span>

            <h1>
              حسابك الدراسي
            </h1>

            <p>
              معلوماتك الأساسية، بياناتك
              الدراسية، وحالة اشتراكك في
              مكان واحد.
            </p>
          </div>

          <div className="student-profile-hero__status">
            <span>
              حالة العضوية
            </span>

            <strong>
              {profile.isPremium
                ? 'Premium'
                : 'Free'}
            </strong>

            <small>
              {profile.isPremium
                ? 'اشتراكك فعال'
                : 'الحساب المجاني'}
            </small>
          </div>
        </section>

        <div className="student-profile-layout">
          <aside className="student-profile-card student-profile-card--identity">
            <div className="student-profile-avatar-shell">
              <div className="student-profile-avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={
                      profile.fullName
                    }
                  />
                ) : (
                  <span>
                    {initial}
                  </span>
                )}
              </div>

              <span className="student-profile-avatar-status" />
            </div>

            <span className="student-profile-identity-label">
              STUDENT ACCOUNT
            </span>

            <h2 dir="auto">
              {profile.fullName}
            </h2>

            <p dir="auto">
              {academicLabel}
            </p>

            <span
              className={
                profile.isPremium
                  ? 'student-profile-badge is-premium'
                  : 'student-profile-badge'
              }
            >
              {profile.isPremium
                ? 'Premium'
                : 'Free'}
            </span>

            <div className="student-profile-identity-meta">
              <div>
                <span>
                  نوع الحساب
                </span>

                <strong>
                  طالب
                </strong>
              </div>

              <div>
                <span>
                  عضو منذ
                </span>

                <strong>
                  {formatDate(
                    profile.createdAt,
                  )}
                </strong>
              </div>
            </div>
          </aside>

          <div className="student-profile-main">
            <section className="student-profile-card">
              <div className="student-profile-card__heading">
                <div>
                  <span>
                    PERSONAL DETAILS
                  </span>

                  <h2>
                    المعلومات الشخصية
                  </h2>
                </div>

                <small>
                  يمكنك تعديل اسمك
                </small>
              </div>

              <label className="student-profile-field">
                <span>
                  الاسم الكامل
                </span>

                <input
                  type="text"
                  value={fullName}
                  maxLength={100}
                  disabled={isSaving}
                  dir="auto"
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                />
              </label>

              {errorMessage && (
                <p className="student-profile-message student-profile-message--error">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="student-profile-message student-profile-message--success">
                  {successMessage}
                </p>
              )}

              <div className="student-profile-save-row">
                <span>
                  يتم حفظ التغييرات على
                  حسابك مباشرة.
                </span>

                <button
                  type="button"
                  className="student-profile-save"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving
                    ? 'جارٍ الحفظ...'
                    : 'حفظ التغييرات'}
                </button>
              </div>
            </section>

            <section className="student-profile-card">
              <div className="student-profile-card__heading">
                <div>
                  <span>
                    ACADEMIC PROFILE
                  </span>

                  <h2>
                    المعلومات الدراسية
                  </h2>
                </div>
              </div>

              <div className="student-profile-info">
                <div>
                  <span>
                    الصف
                  </span>

                  <strong dir="auto">
                    {profile.gradeLevel ||
                      '—'}
                  </strong>
                </div>

                <div>
                  <span>
                    الجيل
                  </span>

                  <strong dir="auto">
                    {profile.cohort ||
                      '—'}
                  </strong>
                </div>

                <div>
                  <span>
                    نوع الحساب
                  </span>

                  <strong>
                    طالب
                  </strong>
                </div>

                <div>
                  <span>
                    تاريخ الانضمام
                  </span>

                  <strong>
                    {formatDate(
                      profile.createdAt,
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="student-profile-card student-profile-card--membership">
              <div className="student-profile-card__heading">
                <div>
                  <span>
                    MEMBERSHIP
                  </span>

                  <h2>
                    الاشتراك
                  </h2>
                </div>

                <span
                  className={
                    profile.isPremium
                      ? 'student-profile-membership-status is-active'
                      : 'student-profile-membership-status'
                  }
                >
                  {profile.isPremium
                    ? 'Active'
                    : 'Free'}
                </span>
              </div>

              <div className="student-profile-info">
                <div>
                  <span>
                    الخطة
                  </span>

                  <strong dir="auto">
                    {profile.subscriptionPlan ||
                      'Free'}
                  </strong>
                </div>

                <div>
                  <span>
                    الحالة
                  </span>

                  <strong>
                    {profile.isPremium
                      ? 'Premium'
                      : 'Free'}
                  </strong>
                </div>

                <div>
                  <span>
                    بداية الاشتراك
                  </span>

                  <strong>
                    {formatDate(
                      profile.premiumStartedAt,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    صالح حتى
                  </span>

                  <strong>
                    {formatDate(
                      profile.premiumUntil,
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export default StudentProfilePage