import assert from 'node:assert/strict'

import {
  prepareAdminQuestionSave,
} from '../src/features/admin/services/questionSavePayload.js'

function testMcqCreate() {
  const result = prepareAdminQuestionSave({
    type: 'MCQ',
    question: 'Choose the correct answer.',
    options: [
      'A. go',
      'B. goes',
      'C. went',
      'D. going',
    ],
    answer: 'B',
    difficulty: 'HARD',
    status: 'DRAFT',
    tags: 'grammar, unit-1',
    lessonId: 'lesson-123',
  })

  assert.equal(
    result.canonicalQuestion.question_type,
    'mcq',
  )

  assert.equal(
    result.canonicalQuestion
      .answer_config.correctOptionId,
    'b',
  )

  assert.equal(
    result.rpcPayload.target_question_id,
    null,
  )

  assert.equal(
    result.rpcPayload.new_question_type,
    'mcq',
  )

  assert.equal(
    result.rpcPayload.new_source_lesson_id,
    'lesson-123',
  )

  assert.equal(
    result.rpcPayload.new_difficulty,
    'hard',
  )

  assert.equal(
    result.rpcPayload.new_version,
    1,
  )
}

function testTfCreateArabic() {
  const result = prepareAdminQuestionSave({
    type: 'tf',
    prompt: 'This statement is correct.',
    answer: 'صح',
  })

  assert.equal(
    result.rpcPayload.new_question_type,
    'true_false',
  )

  assert.equal(
    result.rpcPayload
      .new_answer_config.correctAnswer,
    true,
  )
}

function testUpdateIdentity() {
  const result = prepareAdminQuestionSave(
    {
      type: 'mcq',
      prompt: 'Updated question',
      options: [
        '1) First',
        '2) Second',
      ],
      answer: 2,
    },
    'question-abc',
  )

  assert.equal(
    result.rpcPayload.target_question_id,
    'question-abc',
  )

  assert.equal(
    result.rpcPayload
      .new_answer_config.correctOptionId,
    'b',
  )
}

function testRejectInvalidBeforeRpc() {
  assert.throws(
    () =>
      prepareAdminQuestionSave({
        type: 'mcq',
        prompt: '',
        options: ['A. One'],
        answer: 'A',
      }),
    (error) => {
      assert.equal(
        error.name,
        'QuestionValidationError',
      )

      assert.ok(
        error.validation.errors.some(
          (item) =>
            item.code === 'EMPTY_PROMPT',
        ),
      )

      assert.ok(
        error.validation.errors.some(
          (item) =>
            item.code ===
            'MCQ_TOO_FEW_OPTIONS',
        ),
      )

      return true
    },
  )
}

const tests = [
  ['01 MCQ create payload', testMcqCreate],
  ['02 Arabic TF payload', testTfCreateArabic],
  ['03 Update keeps question ID', testUpdateIdentity],
  ['04 Invalid rejected before RPC', testRejectInvalidBeforeRpc],
]

let passed = 0

for (const [name, fn] of tests) {
  try {
    fn()
    passed += 1
    console.log(`PASS  ${name}`)
  } catch (error) {
    console.error(`FAIL  ${name}`)
    console.error(error)
  }
}

console.log('')
console.log(
  `JAK Admin Question Service v1: ${passed}/${tests.length} tests passed`,
)

if (passed !== tests.length) {
  process.exitCode = 1
}
