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

### Long-Term Retention Intelligence — 2026-08-18

Completed and integrated across the student learning flow.

#### Study Intelligence v3

Current authoritative function:

`get_student_study_intelligence_v3()`

It extends Vocabulary intelligence with long-term retention signals:

- started items
- due items
- fragile due items
- building items
- stable items
- mastered items
- average retention
- average stability days
- next scheduled review
- retention state and student guidance

Current states:

- `not_started`
- `fragile_due`
- `review_due`
- `building`
- `stable`

Important rule:

Low retention by itself does not mean the student should review immediately.
Scheduled due time remains the primary review signal.

#### Study Plan retention integration

The Vocabulary recommendation card now shows:

- memory stability state
- due items
- fragile items
- average retention
- average stability days
- retention guidance
- next review only when no review is currently due

#### Dashboard retention integration

The main Dashboard Vocabulary recommendation now prefers the retention-aware summary when available.

It can distinguish between:

- fragile memory that needs review now
- review due now
- memory currently building
- stable memory

#### Vocabulary answer feedback

`VocabularyMasteryPanel.jsx` now shows a Memory State after each submitted answer.

Possible student-facing states:

- `مستحق الآن`
- `ذاكرة هشة`
- `قيد التثبيت`
- `ذاكرة مستقرة`

The result view also keeps the footer Mastery value synchronized with the latest submitted result instead of showing the stale session value.

This UI does not change the Mastery engine or spaced-review scheduling logic.

#### Stable Git milestones

- `3ae4380` — integrate long-term vocabulary retention intelligence
- `912f4f0` — surface vocabulary retention intelligence in Study Plan
- `70e4c35` — surface vocabulary retention summary on Dashboard
- `01da20b` — add vocabulary memory state feedback

### Server-Side Vocabulary Completion Protection — 2026-08-18

Completed and verified on Supabase.

`public.update_lesson_progress(...)` now includes a server-side guard for Vocabulary lessons.

Current behavior:

- normal lessons keep the existing progress behavior
- Vocabulary lessons are detected by published rows in `public.vocabulary_items`
- when a Vocabulary lesson requests 100% progress, the function checks:
  - `public.get_student_vocabulary_lesson_summary_v2(...)`
  - `completion_ready`
- if `completion_ready = false`, the server rejects completion
- no Mastery or Retention calculations are duplicated inside `update_lesson_progress`
- the existing Vocabulary summary remains the source of truth
- Vocabulary completion therefore requires all published Vocabulary items to be mastered

Current protected lesson:

- Unit 1 Vocabulary — Getting Started
- 25 published Vocabulary items
- Lesson ID: `0414ad4f-3ca6-401b-8f87-77b5d743e4f6`

Verification:

`vocabulary_completion_guard_installed = true`

### Study Intelligence v4 — Smarter Daily Vocabulary Recommendations

Completed and connected to the student learning flow.

Current authoritative frontend RPC:

`get_student_study_intelligence_v4()`

Study Intelligence v4 extends v3 without replacing the stable earlier engines.

Main behavior:

- keeps Study Intelligence v3 as the complete intelligence base
- preserves the original non-Vocabulary recommendation engine
- prevents premature Vocabulary review
- Vocabulary weakness, previous mistakes, or low retention alone do not force early repetition
- Vocabulary review is allowed to become urgent only when review is actually due
- scheduled review time remains the primary memory signal

New Vocabulary daily recommendation states:

- `review_fragile_now`
- `review_due_now`
- `wait_for_review`
- `maintain_spacing`
- `learn_new`
- `continue_learning`

The new `vocabularyDailyRecommendation` signal includes:

- recommendation type
- priority
- student-facing message
- retention state
- due item count
- fragile due item count
- early-review protection

Important design rule:

Vocabulary recommendations must support the student's full study plan and must not dominate other priorities without real evidence.

The general Study Intelligence recommendation system still preserves:

- lesson continuity
- unresolved mistakes
- spaced review
- weak-area review
- next lesson progression

Frontend integration:

`src/features/student/services/studentStudyPlanService.js`

now calls:

`get_student_study_intelligence_v4()`

Verification:

- v4 function installed on Supabase
- `vocabularyDailyRecommendation` verified
- premature-review guard verified
- Dashboard loaded successfully
- Study Plan loaded successfully
- `npm run lint` passed

Stable Git milestone:

- `d151d84` — enable Study Intelligence v4 recommendations

### Definition Retrieval Rule — 2026-08-18

Vocabulary session question selection now supports three-way retrieval when a published Vocabulary item contains both a non-empty `meaning_ar` and `definition_en`.

Current behavior:

- `word_family` items keep the dedicated word-family retrieval flow
- bilingual items with both `meaning_ar` and `definition_en` rotate through:
  1. English word → Arabic meaning (`meaning_en_ar`)
  2. Arabic meaning → English word (`meaning_ar_en`)
  3. English definition → English word (`definition`)
- definition-only items use:
  - English definition → English word
- bilingual items without `definition_en` continue alternating:
  - English → Arabic
  - Arabic → English
- rotation is driven by `attempt_count`
- this behavior is implemented in `get_student_vocabulary_session_v2(...)`
- `VocabularyMasteryPanel.jsx` already supports all required question types
- Word Family logic was not changed
- Mastery scoring, Retention scheduling, interleaving, and Study Intelligence were not changed

Example for `frankness`:

1. `frankness` → `الصراحة`
2. `الصراحة` → `frankness`
3. `the quality of being honest and direct` → `frankness`

Verification:

- three-way rotation rule installed on Supabase
- definition question type still installed
- frontend testing confirmed all three retrieval directions work successfully

### Unit 1 Vocabulary Exams — 2026-08-18

Unit 1 Vocabulary assessment is now complete.

Published exams:

- Unit 1 - Lesson 1A Vocabulary Exam
  - 20 MCQ
  - answer distribution: A5 / B5 / C5 / D5
- Unit 1 - Lesson 2A Vocabulary Exam
  - 16 MCQ
  - answer distribution: A4 / B4 / C4 / D4
- Unit 1 - Lesson 3A Vocabulary Exam
  - 16 MCQ
  - answer distribution: A4 / B4 / C4 / D4
- Unit 1 - Comprehensive Vocabulary Exam
  - 30 questions
  - answer distribution: A8 / B8 / C7 / D7

Source policy:

- official 2026 Student's Book and Workbook are the primary sources
- supplementary vocabulary material may support Arabic meanings and compiled vocabulary
- official material takes priority whenever sources differ
- exams are created lesson by lesson before the comprehensive Unit exam

Important audit correction:

- Lesson 3A `disposition` = character or personality
- Lesson 3A `trait` = a particular characteristic or way of behaving
- the two affected questions were corrected and verified
- the Comprehensive Exam reuses the same Question Bank rows, so the corrections propagate automatically

Exam grading semantics:

- Exam Score = earned points / total exam points
- unanswered questions receive zero exam points after submission
- Answered counts only questions actually attempted
- Needs Attention after submission = wrong + unanswered
- unanswered questions are not evidence of vocabulary weakness
- weakness / skill analysis uses only actually answered questions

### Exam Arena Unit Grouping — 2026-08-18

The student Exam Arena is now organized by Unit instead of one flat exam list.

Implementation:

- `student_list_available_exams()` now returns:
  - `unit_id`
  - `unit_title`
  - `unit_number`
  - `unit_sort_order`
- Unit metadata is resolved from the database relationship:
  - exam_items
  - questions
  - lessons
  - unit_sections
  - units
- exam titles are not used to infer Unit membership
- Student Dashboard groups exam cards under expandable Unit sections
- Unit headers show:
  - exam count
  - available count
  - in-progress count
  - completed count
- existing exam cards, result navigation, retry behavior, and attempt logic were preserved

Verified Unit 1 metadata:

- Unit ID: `a77941f5-a762-40f8-b7c6-3db779efdeb0`
- Unit number: 1
- Unit sort order: 1
- all four current Vocabulary exams resolve to Unit 1

Verification:

- Dashboard visual check passed
- Unit 1 grouping header is visible
- existing four exam cards remain functional
- `npm run lint` passed

Stable Git milestone:

- `05506a9` — group student exams by unit

### Next planned work

1. begin Unit 2 Vocabulary from the official 2026 Student's Book and Workbook
2. build Unit 2 exams lesson by lesson
3. create the Unit 2 comprehensive Vocabulary exam only after the lesson exams are complete
## 2026-08-18 — Unit 1 Grammar Intelligence

- Added dedicated `GrammarLessonRenderer` for Unit 1 Grammar.
- Grammar lesson: `Continuous & Perfect Tenses`.
- Added interactive Grammar Explorer with:
  - tense family theming
  - smart function chips
  - function explanations
  - multiple examples
  - key clues
  - example navigation
- Added Family Tabs so each tense family shows one tense at a time:
  - Continuous
  - Perfect Simple
  - Perfect Continuous
- Added Compare Lab with:
  - Present Perfect vs Present Perfect Continuous
  - Past Perfect vs Past Perfect Continuous
  - Future Perfect vs Future Perfect Continuous
- Added Mini Compare Challenge.
- Unit 1 Grammar content now covers all 9 target tenses.
- Grammar lesson is deployed live on Netlify.
- Production URL:
  `https://jak-academy-jo.netlify.app`
- Production deploy verified working.
- Current frontend snapshot commit:
  `4d6ee8b feat: add unit 1 grammar intelligence lesson`
- Next planned milestone:
  connect grammar interactions and diagnostic evidence to Grammar Intelligence / student grammar evidence.

## Grammar Intelligence Dashboard Integration — 2026-08-19

- Added `getStudentGrammarPrioritiesV2()` to the student study-plan service.
- Connected grammar priorities to `StudentDashboardPage`.
- High grammar priority now overrides normal dashboard recommendations.
- Grammar recommendation uses bilingual student-facing copy from `get_student_grammar_priorities_v2`.
- CTA currently opens Unit 1 Grammar lesson:
  `unit-1-grammar-continuous-perfect-tenses`.
- Added distinct `student-hero--grammar-intelligence` visual state.
- Added RTL/LTR handling for mixed Arabic-English grammar titles.
- Grammar priorities are refreshed after Focus Timer completion.
- `npm run lint` passes.
- `npm run build` passes.
- Git milestone:
  `211bf4f feat: connect grammar intelligence to student dashboard`.

Current verified example:
- Skill: `future_perfect_completed_before_future`
- Priority: high
- Score: 90
- Error signal: `future_completion_vs_duration`
- Recommendation: review Future Perfect vs Future Perfect Continuous.

Next:
- Deploy latest local build to Netlify production.
- Verify production Dashboard and Grammar lesson on desktop and mobile.
- Restore diagnostic exam max attempts from 2 to 1 after testing when appropriate.
## 2026-08-21 — Student progress percentage audit

Completed a semantic audit of student-facing percentages and counters.

Key outcomes:
- Dashboard and Achievements now use real course completion percentage instead of mixed course progress.
- Unit and section cards now use true completionPercent.
- Vocabulary summary upgraded to get_student_vocabulary_lesson_summary_v3.
- Vocabulary UI now shows coverage and "إتقان ما درست" instead of heuristic learningProgress.
- Continue Learning no longer displays mixed lesson progress when semantics are uncertain.
- Study Plan avoids vocabulary progressPercent and uses coverage/mastery metrics instead.
- Mistake Review, Focus Timer, exam percentages, weakness accuracy, achievement unlock percentage, and vocabulary retention were verified as meaningful metrics.
- Vocabulary averageRetention is a real average of retention_score across started vocabulary items only.
- Grammar priorityScore remains internal ranking logic and is not shown as a student mastery percentage.
- npm run lint passed.
- npm run build passed.
