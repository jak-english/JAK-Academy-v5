import assert from 'node:assert/strict'
import { normalizeQuestionDraft } from '../src/features/questions/core/normalizeQuestion.js'

const cases = [
  {
    name: 'MCQ letters',
    input: {
      type: 'MCQ',
      question: 'Choose.',
      options: ['A. go', 'B. goes', 'C. went', 'D. going'],
      answer: 'B',
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'b'),
  },
  {
    name: 'MCQ numbers',
    input: {
      questionType: 'multiple choice',
      prompt: 'Pick one.',
      choices: ['1) one', '2) two', '3) three', '4) four'],
      correctAnswer: 3,
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'c'),
  },
  {
    name: 'MCQ answer text',
    input: {
      type: 'choice',
      text: 'Select.',
      answers: ['has worked', 'has been working', 'worked', 'works'],
      correct: 'has been working',
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'b'),
  },
  {
    name: 'MCQ object map',
    input: {
      type: 'mcq',
      stem: 'Select.',
      options: { A: 'Alpha', B: 'Beta', C: 'Gamma', D: 'Delta' },
      correct_option: 'Option C',
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'c'),
  },
  {
    name: 'MCQ canonical objects',
    input: {
      question_type: 'mcq',
      prompt_json: { text: 'Select.' },
      answer_config: {
        options: [
          { id: 'a', text: 'A1' },
          { id: 'b', text: 'B1' },
          { id: 'c', text: 'C1' },
          { id: 'd', text: 'D1' },
        ],
        correctOptionId: 'd',
      },
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'd'),
  },
  {
    name: 'MCQ multiline',
    input: {
      type: 'mcq',
      prompt: 'Select.',
      options: 'A. Red\nB. Blue\nC. Green\nD. Gold',
      answer: 'Choice B',
    },
    verify: (r) => assert.equal(r.answer_config.correctOptionId, 'b'),
  },
  {
    name: 'TF boolean',
    input: {
      type: 'true_false',
      question: 'English is a language.',
      answer: true,
    },
    verify: (r) => assert.equal(r.answer_config.correctAnswer, true),
  },
  {
    name: 'TF TRUE string',
    input: {
      type: 'true/false',
      prompt: 'Statement.',
      correct: 'TRUE',
    },
    verify: (r) => assert.equal(r.answer_config.correctAnswer, true),
  },
  {
    name: 'TF Arabic true',
    input: {
      type: 'tf',
      prompt: 'Statement.',
      answer: 'صح',
    },
    verify: (r) => assert.equal(r.answer_config.correctAnswer, true),
  },
  {
    name: 'TF Arabic false',
    input: {
      type: 't/f',
      prompt: 'Statement.',
      answer: 'خطأ',
    },
    verify: (r) => assert.equal(r.answer_config.correctAnswer, false),
  },
  {
    name: 'TF inferred type',
    input: {
      prompt: 'Statement.',
      correctAnswer: 1,
    },
    verify: (r) => {
      assert.equal(r.question_type, 'true_false')
      assert.equal(r.answer_config.correctAnswer, true)
    },
  },
  {
    name: 'Aliases and metadata',
    input: {
      type: 'MCQ',
      questionText: 'Question',
      options: ['A. X', 'B. Y'],
      correctOption: '2',
      solution: 'Because Y.',
      difficulty: 'HARD',
      status: 'PUBLISHED',
      tags: 'grammar; unit-1, ministry',
      lessonId: 'lesson-x',
      blockId: 'paragraph-x',
    },
    verify: (r) => {
      assert.equal(r.prompt_json.text, 'Question')
      assert.equal(r.explanation_json.text, 'Because Y.')
      assert.equal(r.difficulty, 'hard')
      assert.equal(r.status, 'published')
      assert.deepEqual(r.tags, ['grammar', 'unit-1', 'ministry'])
      assert.equal(r.source_lesson_id, 'lesson-x')
      assert.equal(r.source_block_id, 'paragraph-x')
    },
  },
]

let passed = 0

for (const item of cases) {
  try {
    const result = normalizeQuestionDraft(item.input)
    item.verify(result)
    passed += 1
    console.log(`PASS  ${item.name}`)
  } catch (error) {
    console.error(`FAIL  ${item.name}`)
    console.error(error)
  }
}

console.log('')
console.log(`JAK Question Normalizer v1: ${passed}/${cases.length} tests passed`)

if (passed !== cases.length) {
  process.exitCode = 1
}
