# JAK Academy v5 — Project State

Last updated: 2026-08-16

## Current Focus
Vocabulary Mastery System + Vocabulary Reference Tables + planned Unit Vocabulary Exams.

## Core Rules
- Work in small safe changes.
- Inspect existing Supabase schema/functions before changing them.
- Do not create duplicate systems.
- Use original vocabulary PDF as source of truth.
- Do not invent definitions, synonyms, antonyms, collocations, or examples.
- After code changes run: npm run lint
- Update this file after every stable milestone.
- Use Git commits as recovery points.

## Vocabulary Current State
- Adaptive Vocabulary Mastery engine exists.
- Secure answer wrapper v3 verifies:
  - meaning_en_ar
  - meaning_ar_en
- Vocabulary Catalog RPC exists:
  - get_student_vocabulary_catalog(uuid)
- Reference tables are separate from the Mastery engine but on the same lesson page.
- Reference tables are grouped by item_type.
- Current visible group: Core Words.
- Planned pastel headings and borders per vocabulary type.

## Current Unit 1 Vocabulary Lesson
Lesson ID:
0414ad4f-3ca6-401b-8f87-77b5d743e4f6

Current Core Words:
- Spontaneity
- Committed
- Frankness
- Stability
- Tactfulness

## Planned Vocabulary Sections
- Core Words
- Fixed Expressions
- Word Families
- Additional Personality Adjectives
- Words & Definitions
- Compound Adjectives
- Idioms

Do not invent new item_type values before mapping source sections safely to the current schema.

## Planned Vocabulary Exam System
Separate from Mastery training.

Question styles:
- English to English meaning
- English to Arabic
- Arabic to English
- Fill in the blank
- Choose the correct word
- Matching
- True / False
- Context questions
- Synonym / Antonym when source-backed
- Word Family
- Fixed Expressions
- Compound Adjectives
- Idioms
- Mixed Vocabulary Exam

Planned exam layers:
- Quick Check
- Section Test
- Unit Vocabulary Exam
- Mixed Mastery Exam
- Final Vocabulary Review

## Planned Integration
Vocabulary Exam
→ identify weak vocabulary
→ feed weak items back into Mastery
→ update Study Plan
→ update Dashboard recommendations
→ track real study time and achievement

## Workflow
Before work:
1. Read this file.
2. Inspect affected file/function.
3. Make smallest safe change.
4. Run npm run lint.
5. Verify.
6. Update this file.
7. Git commit stable milestone.

---

## Vocabulary Intelligence Integration — 2026-08-17

### Stable milestone

Vocabulary Mastery is now integrated with the main student learning flow.

### Vocabulary lesson

Target lesson:

- Unit 1 Vocabulary — Getting Started
- Lesson ID: `0414ad4f-3ca6-401b-8f87-77b5d743e4f6`
- 25 published vocabulary items

### Vocabulary progress model

Vocabulary lesson progress is no longer controlled by scroll position.

Learning Progress formula:

`40% Coverage + 60% Average Mastery`

Vocabulary completion reaches 100% only when all published items satisfy the mastery requirements.

### Current engine

- `submit_vocabulary_answer_v5`
- `get_student_vocabulary_lesson_summary_v2`
- `sync_student_vocabulary_lesson_progress_v2`

Vocabulary progress is synchronized to:

`student_lesson_progress`

### Student lesson integration

- scroll-based progress is disabled for the Vocabulary Mastery lesson
- manual completion is disabled for Vocabulary
- progress updates immediately after vocabulary answers
- Vocabulary progress header shows:
  - total items
  - started
  - mastered
  - due
  - current mastery
  - coverage
  - learning progress

### Study Plan integration

Study Plan frontend now uses:

`get_student_study_plan_v2`

The recommended Vocabulary lesson receives:

`vocabularySummary`

Study Plan guidance can use:

- Learning Progress
- Coverage
- Average Mastery
- Started Items
- Mastered Items
- Due Items

### Dashboard integration

Dashboard already loads Study Plan, so it receives the same `vocabularySummary`.

The main recommendation card now uses Vocabulary-specific progress and guidance.

### Source-of-truth chain

Vocabulary Items
→ Student Vocabulary Progress
→ Vocabulary Mastery Engine
→ Vocabulary Lesson Summary
→ student_lesson_progress
→ Student Lesson
→ Study Plan
→ Dashboard

Do not create separate Vocabulary progress calculations in Study Plan or Dashboard.

### Vocabulary Study Intelligence v2

Current smart-study integration now includes:

- `get_student_study_intelligence_v2`
- new smart action: `vocabulary_review`
- Vocabulary review decisions remain separate from:
  - exam mistake review
  - general spaced review
- Vocabulary review priority uses its own mastery/review data:
  - due items
  - weak items
  - cumulative wrong answers
  - average mastery
  - average retention

### Study Plan smart recommendation

Study Plan now understands `vocabulary_review` explicitly.

When Vocabulary review is the recommended action, the UI shows:

- Vocabulary-specific recommendation reason
- `راجع مفرداتك`
- Vocabulary review priority score
- direct navigation to the Vocabulary lesson

### Dashboard smart recommendation

Dashboard now understands `vocabulary_review` explicitly.

The main recommendation card can now show:

- `حان وقت مراجعة المفردات`
- `راجع مفرداتك الآن`
- due Vocabulary guidance
- direct navigation to the Vocabulary lesson

### Current smart-learning chain

Vocabulary Items
→ Student Vocabulary Progress
→ Vocabulary Mastery Engine
→ Vocabulary Lesson Summary
→ student_lesson_progress
→ Study Intelligence v2
→ Study Plan
→ Dashboard

### Stable Git milestones

- `f47d8ee` — integrate vocabulary intelligence across student learning flow
- `ae23148` — enable interleaved vocabulary sessions
- `6f0ad45` — integrate vocabulary review into study intelligence
- `b0540cc` — surface vocabulary review on dashboard

### Vocabulary Strength / Weakness Intelligence

Completed and integrated in `VocabularyMasteryPanel.jsx`.

Current behavior:

- uses the authoritative multidimensional scores returned by the Vocabulary mastery engine
- explanations are type-aware:
  - bilingual: meaning, form, retention
  - definition: meaning, retention
  - word family: connections, retention
- `context` is intentionally excluded because it is not part of the current v4 mastery models
- early evidence protection prevents premature strength / weakness judgments when `total_attempts < 3`
- after enough evidence, the student sees:
  - current strongest dimension
  - dimension that needs strengthening
  - targeted JAK review advice
- cumulative `wrong_count` must not be described as unresolved current mistakes
- no Supabase or service changes were required for this feature

Stable commits:

- `c714d1f` — add vocabulary strength / weakness insights
- 3a8e7a8 — avoid premature vocabulary strength judgments

### Next planned work

1. long-term retention intelligence
2. server-side completion protection for Vocabulary
3. smarter daily Vocabulary recommendations
4. then continue expanding Unit 1 vocabulary content
