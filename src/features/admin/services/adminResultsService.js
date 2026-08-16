import { supabase } from '../../../lib/supabase'

async function getAdminExamResults() {
  const { data, error } = await supabase.rpc(
    'admin_get_exam_results',
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  getAdminExamResults,
}
