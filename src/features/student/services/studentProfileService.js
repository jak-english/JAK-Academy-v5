import { supabase } from '../../../lib/supabase'

function normalizeProfile(data) {
  return {
    id: data?.id ?? null,
    fullName: data?.fullName ?? '',
    role: data?.role ?? 'student',
    gradeLevel: data?.gradeLevel ?? '',
    cohort: data?.cohort ?? '',
    avatarUrl: data?.avatarUrl ?? null,
    isPremium: data?.isPremium ?? false,
    premiumUntil: data?.premiumUntil ?? null,
    premiumStartedAt: data?.premiumStartedAt ?? null,
    subscriptionPlan: data?.subscriptionPlan ?? null,
    subscriptionPrice: data?.subscriptionPrice ?? null,
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  }
}

async function getStudentProfile() {
  const { data, error } = await supabase.rpc(
    'get_student_profile',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Student profile could not be loaded.',
    )
  }

  return normalizeProfile(data?.profile)
}

async function updateStudentProfile({
  fullName,
  avatarUrl,
}) {
  const { data, error } = await supabase.rpc(
    'update_student_profile',
    {
      target_full_name: fullName,
      target_avatar_url: avatarUrl || null,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
      'Student profile could not be updated.',
    )
  }

  return normalizeProfile(data?.profile)
}

async function uploadStudentAvatar(file) {
  if (!file) {
    throw new Error('Please choose an image.')
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('The selected file must be an image.')
  }

  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error(
      'The image must be smaller than 5 MB.',
    )
  }

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !userData?.user?.id) {
    throw new Error(
      'Authentication is required.',
    )
  }

  const userId = userData.user.id
  const objectPath = `${userId}/avatar`

  const {
    error: uploadError,
  } = await supabase.storage
    .from('avatars')
    .upload(
      objectPath,
      file,
      {
        upsert: true,
        contentType:
          file.type || 'image/jpeg',
        cacheControl: '3600',
      },
    )

  if (uploadError) {
    throw new Error(
      uploadError.message ||
      'Avatar upload failed.',
    )
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from('avatars')
    .getPublicUrl(objectPath)

  const publicUrl =
    publicUrlData?.publicUrl

  if (!publicUrl) {
    throw new Error(
      'Avatar URL could not be created.',
    )
  }

  return `${publicUrl}?v=${Date.now()}`
}

export {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentAvatar,
}
