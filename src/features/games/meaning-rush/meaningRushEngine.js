function shuffle(items) {
  const copy = [...items]

  for (
    let index = copy.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    )

    ;[copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ]
  }

  return copy
}

function normalizeText(value) {
  return String(value || '').trim()
}

function hasArabicMeaning(item) {
  return Boolean(
    normalizeText(item?.meaning_ar),
  )
}

function hasEnglishDefinition(item) {
  return Boolean(
    normalizeText(item?.definition_en),
  )
}

function isUsableMeaningItem(item) {
  return Boolean(
    item?.id &&
      normalizeText(item?.term) &&
      (
        hasArabicMeaning(item) ||
        hasEnglishDefinition(item)
      ),
  )
}

function getPlayableItems(session, limit = 10) {
  const items = Array.isArray(session?.items)
    ? session.items.filter(isUsableMeaningItem)
    : []

  return shuffle(items).slice(0, limit)
}

function getAvailableQuestionTypes(item) {
  const suggestedType =
    normalizeText(item?.suggested_question_type)

  if (
    suggestedType === 'definition' &&
    hasEnglishDefinition(item)
  ) {
    return ['definition']
  }

  if (
    suggestedType === 'meaning_en_ar' &&
    hasArabicMeaning(item)
  ) {
    return ['meaning_en_ar']
  }

  if (
    suggestedType === 'meaning_ar_en' &&
    hasArabicMeaning(item)
  ) {
    return ['meaning_ar_en']
  }

  const types = []

  if (hasArabicMeaning(item)) {
    types.push(
      'meaning_en_ar',
      'meaning_ar_en',
    )
  }

  if (hasEnglishDefinition(item)) {
    types.push('definition')
  }

  return types
}

function buildMeaningQuestion(
  item,
  pool,
  direction,
) {
  const reverse =
    direction === 'meaning_ar_en'

  const definitionMode =
    direction === 'definition'

  const correctAnswer =
    reverse || definitionMode
      ? normalizeText(item?.term)
      : normalizeText(item?.meaning_ar)

  const prompt = reverse
    ? normalizeText(item?.meaning_ar)
    : definitionMode
      ? normalizeText(item?.definition_en)
      : normalizeText(item?.term)

  const distractors = shuffle(
    pool
      .filter(
        (candidate) =>
          candidate?.id !== item?.id,
      )
      .map((candidate) => {
        if (reverse || definitionMode) {
          return normalizeText(
            candidate?.term,
          )
        }

        return normalizeText(
          candidate?.meaning_ar,
        )
      })
      .filter(
        (value, index, values) =>
          value &&
          value !== correctAnswer &&
          values.indexOf(value) === index,
      ),
  ).slice(0, 3)

  return {
    id: `${item.id}-${direction}`,
    vocabularyItemId: item.id,
    questionType: direction,
    prompt,
    correctAnswer,
    options: shuffle([
      correctAnswer,
      ...distractors,
    ]),
    sourceItem: item,
  }
}

function buildMeaningRushRound(
  session,
  limit = 10,
) {
  const items =
    getPlayableItems(session, limit)

  return items
    .map((item, index) => {
      const availableTypes =
        getAvailableQuestionTypes(item)

      if (availableTypes.length === 0) {
        return null
      }

      const direction =
        availableTypes[
          index % availableTypes.length
        ]

      return buildMeaningQuestion(
        item,
        items,
        direction,
      )
    })
    .filter(Boolean)
}

function calculateMeaningRushPoints({
  isCorrect,
  responseTimeMs,
  streak,
}) {
  if (!isCorrect) {
    return 0
  }

  const safeResponseTime =
    Number.isFinite(responseTimeMs) &&
    responseTimeMs >= 0
      ? responseTimeMs
      : null

  let points = 100

  if (safeResponseTime !== null) {
    if (safeResponseTime <= 1500) {
      points += 50
    } else if (safeResponseTime <= 3000) {
      points += 25
    }
  }

  if (streak >= 5) {
    points += 75
  } else if (streak >= 3) {
    points += 40
  }

  return points
}

export {
  buildMeaningRushRound,
  calculateMeaningRushPoints,
  getPlayableItems,
}