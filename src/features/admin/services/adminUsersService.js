import { supabase } from '../../../lib/supabase'

const PROFILE_FIELDS = `
  id,
  full_name,
  role,
  grade_level,
  cohort,
  avatar_url,
  is_premium,
  subscription_plan,
  subscription_price,
  premium_started_at,
  premium_until,
  created_at
`

const ALLOWED_ROLES = [
  'student',
  'teacher',
  'super_admin',
]

const ALLOWED_GRADES = [
  'Grade 11',
  'Grade 12',
]

const ALLOWED_COHORTS = [
  '2009',
  '2010',
  '2011',
]

const ALLOWED_SUBSCRIPTION_PLANS = [
  'monthly',
  'five_months',
  'annual',
]

function normalizeNullableText(value) {
  const normalizedValue =
    typeof value === 'string' ? value.trim() : ''

  return normalizedValue || null
}

function validateRole(role) {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid user role.')
  }

  return role
}

function validateGradeLevel(gradeLevel) {
  const normalizedGrade =
    normalizeNullableText(gradeLevel)

  if (
    normalizedGrade &&
    !ALLOWED_GRADES.includes(normalizedGrade)
  ) {
    throw new Error('Invalid grade level.')
  }

  return normalizedGrade
}

function validateCohort(cohort) {
  const normalizedCohort =
    normalizeNullableText(cohort)

  if (
    normalizedCohort &&
    !ALLOWED_COHORTS.includes(normalizedCohort)
  ) {
    throw new Error('Invalid cohort.')
  }

  return normalizedCohort
}

function validateSubscriptionPlan(plan) {
  if (plan === null || plan === '') {
    return null
  }

  if (!ALLOWED_SUBSCRIPTION_PLANS.includes(plan)) {
    throw new Error('Invalid subscription plan.')
  }

  return plan
}

function buildUserUpdatePayload(updates) {
  if (!updates || typeof updates !== 'object') {
    throw new Error('User updates are required.')
  }

  return {
    fullName: normalizeNullableText(
      updates.full_name,
    ),

    role: validateRole(updates.role),

    gradeLevel: validateGradeLevel(
      updates.grade_level,
    ),

    cohort: validateCohort(updates.cohort),

    subscriptionPlan: validateSubscriptionPlan(
      updates.subscription_plan,
    ),

    applySubscriptionChange: Boolean(
      updates.apply_subscription_change,
    ),
  }
}

async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function getUserById(userId) {
  if (!userId) {
    throw new Error('User ID is required.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateUserProfile(userId, updates) {
  if (!userId) {
    throw new Error('User ID is required.')
  }

  const updatePayload =
    buildUserUpdatePayload(updates)

  const { data, error } = await supabase.rpc(
    'admin_update_user_profile',
    {
      target_user_id: userId,
      new_full_name: updatePayload.fullName,
      new_role: updatePayload.role,
      new_grade_level:
        updatePayload.gradeLevel,
      new_cohort: updatePayload.cohort,
      new_subscription_plan:
        updatePayload.subscriptionPlan,
      apply_subscription_change:
        updatePayload.applySubscriptionChange,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateUserAccountDetails(
  userId,
  accountDetails,
) {
  return updateUserProfile(userId, {
    ...accountDetails,

    /*
      Keep the existing subscription unchanged when
      editing name, role, grade or cohort.
    */
    subscription_plan: null,
    apply_subscription_change: false,
  })
}

async function applyUserSubscription(
  userId,
  userProfile,
  subscriptionPlan,
) {
  const normalizedPlan =
    validateSubscriptionPlan(subscriptionPlan)

  return updateUserProfile(userId, {
    full_name: userProfile.full_name,
    role: userProfile.role,
    grade_level: userProfile.grade_level,
    cohort: userProfile.cohort,

    /*
      null means Free when subscription change
      is explicitly enabled.
    */
    subscription_plan: normalizedPlan,
    apply_subscription_change: true,
  })
}

export {
  applyUserSubscription,
  getUserById,
  getUsers,
  updateUserAccountDetails,
  updateUserProfile,
}