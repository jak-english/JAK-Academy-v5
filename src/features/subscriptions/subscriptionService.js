import { supabase } from '../../lib/supabase'

async function getSubscriptionPlans() {
  const { data, error } = await supabase.rpc(
    'get_subscription_plans',
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  getSubscriptionPlans,
}
