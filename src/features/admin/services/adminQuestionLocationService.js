import { supabase } from '../../../lib/supabase'

async function listAdminQuestionLocations() {
  const { data, error } = await supabase.rpc(
    'admin_list_question_locations',
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  listAdminQuestionLocations,
}
