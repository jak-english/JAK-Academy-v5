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
