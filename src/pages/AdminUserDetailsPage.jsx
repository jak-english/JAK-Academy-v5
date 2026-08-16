import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  applyUserSubscription,
  getUserById,
  updateUserAccountDetails,
} from '../features/admin/services/adminUsersService'
import { getSubscriptionPlans } from '../features/subscriptions/subscriptionService'
import { useAuth } from '../features/auth/AuthProvider'
import './AdminUserDetailsPage.css'

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  super_admin: 'Super Admin',
}

const gradeOptions = [
  {
    value: '',
    label: 'Not set',
  },
  {
    value: 'Grade 11',
    label: 'Grade 11',
  },
  {
    value: 'Grade 12',
    label: 'Grade 12',
  },
]

const cohortOptions = [
  {
    value: '',
    label: 'Not set',
  },
  {
    value: '2009',
    label: '2009',
  },
  {
    value: '2010',
    label: '2010',
  },
  {
    value: '2011',
    label: '2011',
  },
]

const roleOptions = [
  {
    value: 'student',
    label: 'Student',
  },
  {
    value: 'teacher',
    label: 'Teacher',
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
  },
]

const FREE_SUBSCRIPTION_OPTION = {
  value: null,
  label: 'Free',
  price: '0 JOD',
  duration: 'No premium access',
}

function formatSubscriptionDuration(months) {
  if (months === 1) {
    return 'One month'
  }

  if (months === 12) {
    return 'One year'
  }

  return `${months} months`
}

function createSubscriptionOptions(plans) {
  return [
    FREE_SUBSCRIPTION_OPTION,
    ...plans.map((plan) => ({
      value: plan.id,
      label: plan.title,
      price: `${plan.price} JOD`,
      duration: formatSubscriptionDuration(
        plan.durationMonths,
      ),
    })),
  ]
}

const initialFormData = {
  fullName: '',
  role: 'student',
  gradeLevel: '',
  cohort: '',
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Not set'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatPrice(priceValue) {
  if (
    priceValue === null ||
    priceValue === undefined ||
    priceValue === ''
  ) {
    return '0 JOD'
  }

  const numericPrice = Number(priceValue)

  if (Number.isNaN(numericPrice)) {
    return `${priceValue} JOD`
  }

  return `${numericPrice.toFixed(2)} JOD`
}

function createFormData(user) {
  return {
    fullName: user.full_name || '',
    role: user.role || 'student',
    gradeLevel: user.grade_level || '',
    cohort: user.cohort || '',
  }
}

function getSubscriptionLabel(plan, options) {
  const selectedPlan = options.find(
    (option) => option.value === plan,
  )

  return selectedPlan?.label || 'Free'
}

function getPremiumStatus(user) {
  if (!user.is_premium) {
    return {
      label: 'Free account',
      className: 'admin-user-details__status--free',
    }
  }

  if (
    user.premium_until &&
    new Date(user.premium_until) < new Date()
  ) {
    return {
      label: 'Premium expired',
      className: 'admin-user-details__status--expired',
    }
  }

  return {
    label: 'Premium active',
    className: 'admin-user-details__status--premium',
  }
}

function OptionButtons({
  options,
  selectedValue,
  disabled = false,
  onSelect,
}) {
  return (
    <div className="admin-user-details__option-buttons">
      {options.map((option) => {
        const isSelected =
          selectedValue === option.value

        return (
          <button
            key={option.value || 'not-set'}
            className={[
              'admin-user-details__option-button',
              isSelected
                ? 'admin-user-details__option-button--active'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function AdminUserDetailsPage() {
  const { userId } = useParams()
  const { user: authenticatedUser } = useAuth()

  const [selectedUser, setSelectedUser] =
    useState(null)

  const [
    subscriptionOptions,
    setSubscriptionOptions,
  ] = useState([
    FREE_SUBSCRIPTION_OPTION,
  ])

  const [formData, setFormData] =
    useState(initialFormData)

  const [
    pendingSubscriptionPlan,
    setPendingSubscriptionPlan,
  ] = useState(undefined)

  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [
    isApplyingSubscription,
    setIsApplyingSubscription,
  ] = useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [saveMessage, setSaveMessage] =
    useState('')

  const isCurrentAccount =
    authenticatedUser?.id === selectedUser?.id

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        setSaveMessage('')

        const [
        userData,
        subscriptionPlanData,
      ] = await Promise.all([
        getUserById(userId),
        getSubscriptionPlans(),
      ])

        if (isMounted) {
          setSelectedUser(userData)
          setFormData(createFormData(userData))
          setSubscriptionOptions(
            createSubscriptionOptions(
              subscriptionPlanData,
            ),
          )
          setPendingSubscriptionPlan(undefined)
        }
      } catch (error) {
        console.error(
          'Admin user details loading error:',
          error.message,
        )

        if (isMounted) {
          setErrorMessage(
            'The selected user profile could not be loaded.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [userId])

  const hasAccountChanges = useMemo(() => {
    if (!selectedUser) {
      return false
    }

    const originalData =
      createFormData(selectedUser)

    return (
      formData.fullName.trim() !==
        originalData.fullName.trim() ||
      formData.role !== originalData.role ||
      formData.gradeLevel !==
        originalData.gradeLevel ||
      formData.cohort !== originalData.cohort
    )
  }, [formData, selectedUser])

  function clearMessages() {
    setErrorMessage('')
    setSaveMessage('')
  }

  function updateFormField(fieldName, value) {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }))

    clearMessages()
  }

  function handleNameChange(event) {
    updateFormField(
      'fullName',
      event.target.value,
    )
  }

  function handleStartEditing() {
    setFormData(createFormData(selectedUser))
    clearMessages()
    setIsEditing(true)
  }

  function handleCancelEditing() {
    setFormData(createFormData(selectedUser))
    clearMessages()
    setIsEditing(false)
  }

  async function handleAccountSubmit(event) {
    event.preventDefault()

    const normalizedName =
      formData.fullName.trim()

    if (!normalizedName) {
      setErrorMessage('Full name is required.')
      return
    }

    if (
      isCurrentAccount &&
      formData.role !== 'super_admin'
    ) {
      setErrorMessage(
        'You cannot remove Super Admin access from your own account.',
      )
      return
    }

    setIsSaving(true)
    clearMessages()

    try {
      const updatedUser =
        await updateUserAccountDetails(
          userId,
          {
            full_name: normalizedName,
            role: formData.role,
            grade_level: formData.gradeLevel,
            cohort: formData.cohort,
          },
        )

      setSelectedUser(updatedUser)
      setFormData(createFormData(updatedUser))
      setIsEditing(false)

      setSaveMessage(
        'User account details updated successfully.',
      )
    } catch (error) {
      console.error(
        'Admin user account update error:',
        error.message,
      )

      setErrorMessage(
        error.message ||
          'The user account could not be updated.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleSelectSubscription(plan) {
    setPendingSubscriptionPlan(plan)
    clearMessages()
  }

  function handleCancelSubscriptionSelection() {
    setPendingSubscriptionPlan(undefined)
    clearMessages()
  }

  async function handleApplySubscription() {
    if (pendingSubscriptionPlan === undefined) {
      setErrorMessage(
        'Choose a subscription plan first.',
      )
      return
    }

    setIsApplyingSubscription(true)
    clearMessages()

    try {
      const updatedUser =
        await applyUserSubscription(
          userId,
          selectedUser,
          pendingSubscriptionPlan,
        )

      setSelectedUser(updatedUser)
      setFormData(createFormData(updatedUser))
      setPendingSubscriptionPlan(undefined)

      const appliedPlanLabel =
        getSubscriptionLabel(
          updatedUser.subscription_plan,
          subscriptionOptions,
        )

      setSaveMessage(
        appliedPlanLabel === 'Free'
          ? 'Premium access was removed successfully.'
          : `${appliedPlanLabel} subscription applied successfully.`,
      )
    } catch (error) {
      console.error(
        'Admin subscription update error:',
        error.message,
      )

      setErrorMessage(
        error.message ||
          'The subscription could not be updated.',
      )
    } finally {
      setIsApplyingSubscription(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-user-details__state">
        <span className="admin-user-details__loader" />

        <strong>Loading user profile...</strong>

        <p>
          Reading the latest profile data from
          Supabase.
        </p>
      </div>
    )
  }

  if (errorMessage && !selectedUser) {
    return (
      <div className="admin-user-details__state admin-user-details__state--error">
        <strong>User unavailable</strong>

        <p>{errorMessage}</p>

        <Link to="/admin/users">
          ← Back to users
        </Link>
      </div>
    )
  }

  if (!selectedUser) {
    return null
  }

  const displayName =
    selectedUser.full_name?.trim() ||
    'Unnamed user'

  const premiumStatus =
    getPremiumStatus(selectedUser)

  const currentPlanLabel =
    getSubscriptionLabel(
      selectedUser.subscription_plan,
      subscriptionOptions,
    )

  return (
    <div className="admin-user-details">
      <header className="admin-user-details__header">
        <div>
          <Link
            className="admin-user-details__back"
            to="/admin/users"
          >
            ← Back to users
          </Link>

          <span className="admin-user-details__eyebrow">
            User Management
          </span>

          <h1>{displayName}</h1>

          <p>
            Review and manage this user&apos;s
            account, academic profile, role and
            subscription access.
          </p>
        </div>

        <div className="admin-user-details__header-actions">
          <span
            className={`admin-user-details__status ${premiumStatus.className}`}
          >
            {premiumStatus.label}
          </span>

          {!isEditing && (
            <button
              className="admin-user-details__edit-button"
              type="button"
              onClick={handleStartEditing}
            >
              Edit profile
            </button>
          )}
        </div>
      </header>

      {saveMessage && (
        <div
          className="admin-user-details__message admin-user-details__message--success"
          role="status"
        >
          {saveMessage}
        </div>
      )}

      {errorMessage && selectedUser && (
        <div
          className="admin-user-details__message admin-user-details__message--error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <section className="admin-user-details__profile">
        <div className="admin-user-details__identity">
          <span
            className="admin-user-details__avatar"
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>

          <div>
            <strong>{displayName}</strong>

            <span>
              {roleLabels[selectedUser.role] ||
                selectedUser.role}
            </span>
          </div>
        </div>

        <div className="admin-user-details__id">
          <span>User ID</span>
          <code>{selectedUser.id}</code>
        </div>
      </section>

      {!isEditing ? (
        <section className="admin-user-details__grid">
          <article className="admin-user-details__card">
            <span className="admin-user-details__card-label">
              Account role
            </span>

            <strong>
              {roleLabels[selectedUser.role] ||
                selectedUser.role}
            </strong>

            <p>
              Determines which protected tools and
              routes this user can access.
            </p>
          </article>

          <article className="admin-user-details__card">
            <span className="admin-user-details__card-label">
              Grade level
            </span>

            <strong>
              {selectedUser.grade_level || 'Not set'}
            </strong>

            <p>
              Academic grade currently linked to this
              account.
            </p>
          </article>

          <article className="admin-user-details__card">
            <span className="admin-user-details__card-label">
              Cohort
            </span>

            <strong>
              {selectedUser.cohort || 'Not set'}
            </strong>

            <p>
              Student generation or learning cohort
              assignment.
            </p>
          </article>

          <article className="admin-user-details__card">
            <span className="admin-user-details__card-label">
              Joined
            </span>

            <strong>
              {formatDate(selectedUser.created_at)}
            </strong>

            <p>
              Date this user profile was created.
            </p>
          </article>
        </section>
      ) : (
        <form
          className="admin-user-details__edit-form"
          onSubmit={handleAccountSubmit}
        >
          <div className="admin-user-details__form-heading">
            <div>
              <span className="admin-user-details__eyebrow">
                Secure Editing
              </span>

              <h2>Edit user profile</h2>

              <p>
                Saving account details does not renew
                or change the subscription.
              </p>
            </div>

            {isCurrentAccount && (
              <span className="admin-user-details__self-warning">
                Your own admin account
              </span>
            )}
          </div>

          <div className="admin-user-details__form-grid">
            <label>
              <span>Full name</span>

              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleNameChange}
              />
            </label>

            <div className="admin-user-details__button-field">
              <span>Account role</span>

              <OptionButtons
                options={roleOptions}
                selectedValue={formData.role}
                disabled={isCurrentAccount}
                onSelect={(value) =>
                  updateFormField('role', value)
                }
              />

              {isCurrentAccount && (
                <small>
                  Your own Super Admin role is
                  protected.
                </small>
              )}
            </div>

            <div className="admin-user-details__button-field">
              <span>Grade level</span>

              <OptionButtons
                options={gradeOptions}
                selectedValue={
                  formData.gradeLevel
                }
                onSelect={(value) =>
                  updateFormField(
                    'gradeLevel',
                    value,
                  )
                }
              />
            </div>

            <div className="admin-user-details__button-field">
              <span>Cohort</span>

              <OptionButtons
                options={cohortOptions}
                selectedValue={formData.cohort}
                onSelect={(value) =>
                  updateFormField('cohort', value)
                }
              />
            </div>
          </div>

          <div className="admin-user-details__form-actions">
            <button
              className="admin-user-details__cancel-button"
              type="button"
              disabled={isSaving}
              onClick={handleCancelEditing}
            >
              Cancel
            </button>

            <button
              className="admin-user-details__save-button"
              type="submit"
              disabled={
                isSaving || !hasAccountChanges
              }
            >
              {isSaving
                ? 'Saving changes...'
                : 'Save account details'}
            </button>
          </div>
        </form>
      )}

      <section className="admin-user-details__subscription">
        <div>
          <span className="admin-user-details__eyebrow">
            Subscription Access
          </span>

          <h2>Manage subscription</h2>

          <p>
            Select a plan and apply it explicitly.
            Editing account details never renews the
            subscription.
          </p>
        </div>

        <div className="admin-user-details__subscription-data">
          <div>
            <span>Current access</span>
            <strong>{premiumStatus.label}</strong>
          </div>

          <div>
            <span>Current plan</span>
            <strong>{currentPlanLabel}</strong>
          </div>

          <div>
            <span>Subscription price</span>
            <strong>
              {formatPrice(
                selectedUser.subscription_price,
              )}
            </strong>
          </div>

          <div>
            <span>Start date</span>
            <strong>
              {selectedUser.premium_started_at
                ? formatDate(
                    selectedUser.premium_started_at,
                  )
                : 'Not set'}
            </strong>
          </div>

          <div>
            <span>Expiration date</span>
            <strong>
              {selectedUser.premium_until
                ? formatDate(
                    selectedUser.premium_until,
                  )
                : 'No expiration date'}
            </strong>
          </div>
        </div>

        <div className="admin-user-details__plans">
          {subscriptionOptions.map((plan) => {
            const isPending =
              pendingSubscriptionPlan ===
              plan.value

            const isCurrent =
              selectedUser.subscription_plan ===
                plan.value &&
              pendingSubscriptionPlan ===
                undefined

            return (
              <button
                key={plan.value || 'free'}
                className={[
                  'admin-user-details__plan',
                  isPending
                    ? 'admin-user-details__plan--selected'
                    : '',
                  isCurrent
                    ? 'admin-user-details__plan--current'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                disabled={
                  isApplyingSubscription
                }
                onClick={() =>
                  handleSelectSubscription(
                    plan.value,
                  )
                }
              >
                <span className="admin-user-details__plan-name">
                  {plan.label}
                </span>

                <strong>{plan.price}</strong>

                <small>{plan.duration}</small>

                {isCurrent && (
                  <span className="admin-user-details__plan-badge">
                    Current
                  </span>
                )}

                {isPending && (
                  <span className="admin-user-details__plan-badge">
                    Selected
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {pendingSubscriptionPlan !==
          undefined && (
          <div className="admin-user-details__subscription-confirmation">
            <div>
              <strong>
                Apply{' '}
                {getSubscriptionLabel(
                  pendingSubscriptionPlan,
                  subscriptionOptions,
                )}
              </strong>

              <p>
                {pendingSubscriptionPlan === null
                  ? 'This will remove premium access and clear the subscription dates.'
                  : 'If the current subscription is active, the new period will be added after its current expiration date.'}
              </p>
            </div>

            <div className="admin-user-details__subscription-actions">
              <button
                className="admin-user-details__cancel-button"
                type="button"
                disabled={
                  isApplyingSubscription
                }
                onClick={
                  handleCancelSubscriptionSelection
                }
              >
                Cancel
              </button>

              <button
                className="admin-user-details__save-button"
                type="button"
                disabled={
                  isApplyingSubscription
                }
                onClick={
                  handleApplySubscription
                }
              >
                {isApplyingSubscription
                  ? 'Applying plan...'
                  : pendingSubscriptionPlan ===
                      null
                    ? 'Set as Free'
                    : 'Apply plan'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminUserDetailsPage
