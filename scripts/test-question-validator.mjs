import assert from 'node:assert/strict'

import {
  normalizeQuestionDraft,
} from '../src/features/questions/core/normalizeQuestion.js'

import {
  validateCanonicalQuestion,
} from '../src/features/questions/core/validateQuestion.js'

const cases = []

function add(
  name,
  rawInput,
  expectedValid,
  expectedCode = null,
) {
  cases.push({
    name,
    rawInput,
    expectedValid,
    expectedCode,
  })
}

add(
  '01 Valid MCQ letters',
  {
    type: 'MCQ',
    question: 'Choose the correct answer.',
    options: [
      'A. go',
      'B. goes',
      'C. went',
      'D. going',
    ],
    answer: 'B',
  },
  true,
)

add(
  '02 Valid MCQ numeric answer',
  {
    type: 'multiple choice',
    prompt: 'Choose.',
    choices: ['one', 'two', 'three', 'four'],
    correctAnswer: 3,
  },
  true,
)

add(
  '03 Valid MCQ answer text',
  {
    type: 'mcq',
    questionText: 'Choose.',
    options: ['has worked', 'has been working'],
    answer: 'has been working',
  },
  true,
)

add(
  '04 Reject empty prompt',
  {
    type: 'mcq',
    prompt: '',
    options: ['A', 'B'],
    answer: 'A',
  },
  false,
  'EMPTY_PROMPT',
)

add(
  '05 Reject one option',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['Only option'],
    answer: 'Only option',
  },
  false,
  'MCQ_TOO_FEW_OPTIONS',
)

add(
  '06 Reject duplicate option text',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['A. Same', 'B. same'],
    answer: 'A',
  },
  false,
  'MCQ_DUPLICATE_OPTION_TEXT',
)

add(
  '07 Reject missing correct answer',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['A. One', 'B. Two'],
  },
  false,
  'MCQ_CORRECT_OPTION_REQUIRED',
)

add(
  '08 Reject answer not in options',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['A. One', 'B. Two'],
    answer: 'C',
  },
  false,
  'MCQ_CORRECT_OPTION_REQUIRED',
)

add(
  '09 Valid TF boolean',
  {
    type: 'true_false',
    prompt: 'English is a language.',
    answer: true,
  },
  true,
)

add(
  '10 Valid TF Arabic',
  {
    type: 'tf',
    prompt: 'The statement is correct.',
    answer: 'صح',
  },
  true,
)

add(
  '11 Valid TF zero',
  {
    type: 't/f',
    prompt: 'The statement is false.',
    answer: 0,
  },
  true,
)

add(
  '12 Reject TF unknown answer',
  {
    type: 'true_false',
    prompt: 'Statement.',
    answer: 'maybe',
  },
  false,
  'TF_CORRECT_ANSWER_NOT_BOOLEAN',
)

add(
  '13 Reject block without lesson',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['A. One', 'B. Two'],
    answer: 'A',
    blockId: 'block-1',
  },
  false,
  'BLOCK_WITHOUT_LESSON',
)

add(
  '14 Valid block with lesson',
  {
    type: 'mcq',
    prompt: 'Choose.',
    options: ['A. One', 'B. Two'],
    answer: 'A',
    lessonId: 'lesson-1',
    blockId: 'block-1',
  },
  true,
)

let passed = 0

for (const item of cases) {
  const canonical = normalizeQuestionDraft(
    item.rawInput,
  )

  const report = validateCanonicalQuestion(
    canonical,
  )

  try {
    assert.equal(
      report.valid,
      item.expectedValid,
    )

    if (item.expectedCode) {
      assert.ok(
        report.errors.some(
          (error) =>
            error.code === item.expectedCode,
        ),
        `Expected error code ${item.expectedCode}, got: ${report.errors
          .map((error) => error.code)
          .join(', ')}`,
      )
    }

    passed += 1
    console.log(`PASS  ${item.name}`)
  } catch (error) {
    console.error(`FAIL  ${item.name}`)
    console.error(
      JSON.stringify(
        {
          canonical,
          report,
        },
        null,
        2,
      ),
    )
    console.error(error)
  }
}

console.log('')
console.log(
  `JAK Semantic Validator v1: ${passed}/${cases.length} tests passed`,
)

if (passed !== cases.length) {
  process.exitCode = 1
}
