import { useEffect, useState } from 'react'

import SectionHeader from '../../shared/components/SectionHeader'
import { getSubscriptionPlans } from './subscriptionService'
import './SubscriptionsSection.css'

const planFeatures = [
  'Access to Units 2–10',
  'Interactive exams and activities',
  'Progress and weakness tracking',
  'Study plans and educational games',
]

function formatDuration(months) {
  if (months === 1) {
    return '1 month'
  }

  if (months === 12) {
    return '12 months'
  }

  return `${months} months`
}

function SubscriptionsSection() {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPlans() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const planData =
          await getSubscriptionPlans()

        if (isMounted) {
          setPlans(planData)
        }
      } catch (error) {
        console.error(
          'Subscription plans loading error:',
          error.message,
        )

        if (isMounted) {
          setErrorMessage(
            'Subscription plans are temporarily unavailable.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPlans()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      id="subscriptions"
      className="subscriptions-section page-section"
    >
      <div className="page-container">
        <SectionHeader
          eyebrow="Simple membership options"
          title="Choose the plan that fits your goals"
          description="Start with the free first unit, then unlock the complete JAK Academy learning experience with one clear subscription."
        />

        {isLoading && (
          <p>Loading subscription plans...</p>
        )}

        {!isLoading && errorMessage && (
          <p>{errorMessage}</p>
        )}

        {!isLoading &&
          !errorMessage &&
          plans.length === 0 && (
            <p>No subscription plans are currently available.</p>
          )}

        {!isLoading &&
          !errorMessage &&
          plans.length > 0 && (
            <div className="subscriptions-grid">
              {plans.map((plan) => {
                const isFeatured =
                  plan.id === 'annual'

                return (
                  <article
                    className={`subscription-card ${
                      isFeatured
                        ? 'subscription-card--featured'
                        : ''
                    }`}
                    key={plan.id}
                  >
                    {isFeatured && (
                      <span className="subscription-card__badge">
                        Best value
                      </span>
                    )}

                    <span className="subscription-card__label">
                      {plan.title}
                    </span>

                    <div className="subscription-card__price">
                      <strong>{plan.price}</strong>

                      <div>
                        <span>JOD</span>
                        <small>
                          {formatDuration(
                            plan.durationMonths,
                          )}
                        </small>
                      </div>
                    </div>

                    <p className="subscription-card__description">
                      Full access to the complete learning platform during your
                      subscription period.
                    </p>

                    <ul className="subscription-card__features">
                      {planFeatures.map(
                        (feature) => (
                          <li
                            key={`${plan.id}-${feature}`}
                          >
                            <span aria-hidden="true">
                              ✓
                            </span>
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>

                    <button
                      className="subscription-card__button"
                      type="button"
                    >
                      Choose {plan.title}
                    </button>
                  </article>
                )
              })}
            </div>
          )}

        <div className="subscription-payment">
          <div>
            <span className="subscription-payment__eyebrow">
              Payment methods
            </span>

            <h3>
              Subscribe through CliQ or Zain Cash
            </h3>

            <p>
              Send the payment, then submit your payment information to
              activate the subscription.
            </p>
          </div>

          <div className="subscription-payment__number">
            <span>Payment number</span>
            <strong>0796942353</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubscriptionsSection
