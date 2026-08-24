import { supabase } from '../../../lib/supabase'

async function submitStudentGameResult({
  gameKey,
  score,
  bestStreak,
  correctAnswers,
  totalAnswers,
  weakWordsCount = 0,
  bossCompleted = false,
}) {
  const { data, error } = await supabase.rpc(
    'submit_student_game_result',
    {
      p_game_key: gameKey,
      p_score: score,
      p_best_streak: bestStreak,
      p_correct_answers: correctAnswers,
      p_total_answers: totalAnswers,
      p_weak_words_count: weakWordsCount,
      p_boss_completed: bossCompleted,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Game result could not be saved.',
    )
  }

  return data
}

export {
  submitStudentGameResult,
}
