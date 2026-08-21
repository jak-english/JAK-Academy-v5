-- JAK Academy v5
-- Student progress semantics migration
-- Generated from current Supabase function definitions on 2026-08-21.
-- CREATE OR REPLACE only; existing base functions remain intact.

-- ============================================================
-- get_student_dashboard_v2
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_student_dashboard_v2()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_dashboard jsonb;
  v_units jsonb;
  v_statistics jsonb;
begin

  ------------------------------------------------------------
  -- 1. KEEP CURRENT STABLE DASHBOARD
  ------------------------------------------------------------

  v_dashboard :=
    public.get_student_dashboard();


  ------------------------------------------------------------
  -- 2. ADD TRUE COMPLETION % TO EVERY UNIT
  ------------------------------------------------------------

  select
    coalesce(
      jsonb_agg(
        unit_item
        ||
        jsonb_build_object(
          'completionPercent',
          case
            when coalesce(
              (unit_item ->> 'lessonCount')::integer,
              0
            ) <= 0
            then 0

            else least(
              100,
              round(
                (
                  coalesce(
                    (
                      unit_item
                      ->> 'completedLessonCount'
                    )::numeric,
                    0
                  )
                  /
                  (
                    unit_item
                    ->> 'lessonCount'
                  )::numeric
                )
                * 100
              )::integer
            )
          end
        )
        order by
          coalesce(
            (unit_item ->> 'sortOrder')::integer,
            0
          )
      ),
      '[]'::jsonb
    )
  into v_units
  from jsonb_array_elements(
    coalesce(
      v_dashboard -> 'units',
      '[]'::jsonb
    )
  ) as unit_item;


  v_dashboard :=
    jsonb_set(
      v_dashboard,
      '{units}',
      v_units,
      true
    );


  ------------------------------------------------------------
  -- 3. ADD TRUE COURSE COMPLETION %
  ------------------------------------------------------------

  v_statistics :=
    coalesce(
      v_dashboard -> 'statistics',
      '{}'::jsonb
    );


  v_statistics :=
    v_statistics
    ||
    jsonb_build_object(
      'overallCourseCompletionPercent',
      case
        when coalesce(
          (
            v_statistics
            ->> 'totalCourseLessons'
          )::integer,
          0
        ) <= 0
        then 0

        else least(
          100,
          round(
            (
              coalesce(
                (
                  v_statistics
                  ->> 'completedCourseLessons'
                )::numeric,
                0
              )
              /
              (
                v_statistics
                ->> 'totalCourseLessons'
              )::numeric
            )
            * 100
          )::integer
        )
      end
    );


  v_dashboard :=
    jsonb_set(
      v_dashboard,
      '{statistics}',
      v_statistics,
      true
    );


  ------------------------------------------------------------
  -- 4. VERSION
  ------------------------------------------------------------

  return
    v_dashboard
    ||
    jsonb_build_object(
      'dashboardEngineVersion',
      'v2'
    );

end;
$function$;

-- ============================================================
-- get_student_study_plan_v3
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_student_study_plan_v3()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_plan jsonb;
  v_grammar_journey jsonb;

  v_recommended_lesson jsonb;
  v_vocabulary_summary jsonb;

  v_recommended_lesson_id uuid;
  v_section_type text;
begin

  ------------------------------------------------------------
  -- 1. KEEP THE CURRENT STABLE V2 PLAN
  ------------------------------------------------------------

  v_plan :=
    public.get_student_study_plan_v2();


  ------------------------------------------------------------
  -- 2. GET GRAMMAR INTELLIGENCE JOURNEY
  ------------------------------------------------------------

  v_grammar_journey :=
    public.get_student_grammar_journey_v1();


  ------------------------------------------------------------
  -- 3. READ RECOMMENDED LESSON
  ------------------------------------------------------------

  v_recommended_lesson :=
    v_plan -> 'recommendedLesson';


  ------------------------------------------------------------
  -- 4. ENHANCE VOCABULARY SUMMARY WITH V3 METRIC
  ------------------------------------------------------------

  if v_recommended_lesson is not null
     and v_recommended_lesson <> 'null'::jsonb
  then

    v_recommended_lesson_id :=
      nullif(
        v_recommended_lesson ->> 'id',
        ''
      )::uuid;

    v_section_type :=
      v_recommended_lesson
        -> 'section'
        ->> 'sectionType';


    if v_recommended_lesson_id is not null
       and v_section_type = 'vocabulary'
    then

      v_vocabulary_summary :=
        public.get_student_vocabulary_lesson_summary_v3(
          v_recommended_lesson_id
        );


      v_recommended_lesson :=
        jsonb_set(
          v_recommended_lesson,
          '{vocabularySummary,averageMasteryStarted}',
          to_jsonb(
            coalesce(
              (
                v_vocabulary_summary
                ->> 'average_mastery_started'
              )::integer,
              0
            )
          ),
          true
        );


      v_plan :=
        jsonb_set(
          v_plan,
          '{recommendedLesson}',
          v_recommended_lesson,
          true
        );

    end if;

  end if;


  ------------------------------------------------------------
  -- 5. RETURN V3 PLAN
  ------------------------------------------------------------

  return
    v_plan
    ||
    jsonb_build_object(
      'grammarJourney',
      v_grammar_journey,
      'studyPlanEngineVersion',
      'v3'
    );

end;
$function$;

-- ============================================================
-- get_student_unit_v2
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_student_unit_v2(target_unit_slug text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_result jsonb;
  v_unit jsonb;
  v_sections jsonb;
begin

  ------------------------------------------------------------
  -- 1. KEEP CURRENT STABLE UNIT DATA
  ------------------------------------------------------------

  v_result :=
    public.get_student_unit(
      target_unit_slug
    );

  v_unit :=
    v_result -> 'unit';


  ------------------------------------------------------------
  -- 2. ADD TRUE UNIT COMPLETION %
  -- completed lessons / total published lessons
  ------------------------------------------------------------

  v_unit :=
    jsonb_set(
      v_unit,
      '{statistics,completionPercent}',
      to_jsonb(
        case
          when coalesce(
            (v_unit -> 'statistics' ->> 'lessonCount')::integer,
            0
          ) <= 0
          then 0

          else least(
            100,
            round(
              (
                coalesce(
                  (
                    v_unit
                    -> 'statistics'
                    ->> 'completedLessonCount'
                  )::numeric,
                  0
                )
                /
                (
                  v_unit
                  -> 'statistics'
                  ->> 'lessonCount'
                )::numeric
              )
              * 100
            )::integer
          )
        end
      ),
      true
    );


  ------------------------------------------------------------
  -- 3. ADD TRUE COMPLETION % TO EACH SECTION
  ------------------------------------------------------------

  select
    coalesce(
      jsonb_agg(
        section_item
        ||
        jsonb_build_object(
          'completionPercent',
          case
            when coalesce(
              (section_item ->> 'lessonCount')::integer,
              0
            ) <= 0
            then 0

            else least(
              100,
              round(
                (
                  coalesce(
                    (
                      section_item
                      ->> 'completedLessonCount'
                    )::numeric,
                    0
                  )
                  /
                  (
                    section_item
                    ->> 'lessonCount'
                  )::numeric
                )
                * 100
              )::integer
            )
          end
        )
        order by
          coalesce(
            (section_item ->> 'sortOrder')::integer,
            0
          )
      ),
      '[]'::jsonb
    )
  into v_sections
  from jsonb_array_elements(
    coalesce(
      v_unit -> 'sections',
      '[]'::jsonb
    )
  ) as section_item;


  v_unit :=
    jsonb_set(
      v_unit,
      '{sections}',
      v_sections,
      true
    );


  ------------------------------------------------------------
  -- 4. RETURN V2
  ------------------------------------------------------------

  return
    jsonb_build_object(
      'unit',
      v_unit,
      'generatedAt',
      now(),
      'unitEngineVersion',
      'v2'
    );

end;
$function$;

-- ============================================================
-- get_student_vocabulary_lesson_summary_v3
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_student_vocabulary_lesson_summary_v3(p_lesson_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_base jsonb;

  v_student_id uuid;
  v_started_items integer := 0;
  v_average_mastery_started integer := 0;
begin

  v_student_id := auth.uid();

  if v_student_id is null then
    raise exception 'Authentication is required.';
  end if;

  ------------------------------------------------------------
  -- Keep v2 completely intact
  ------------------------------------------------------------

  v_base :=
    public.get_student_vocabulary_lesson_summary_v2(
      p_lesson_id
    );

  ------------------------------------------------------------
  -- Average mastery ONLY among items with real evidence
  ------------------------------------------------------------

  select
    count(*)::integer,

    coalesce(
      round(
        avg(
          coalesce(
            svp.mastery_score,
            0
          )
        )
      )::integer,
      0
    )

  into
    v_started_items,
    v_average_mastery_started

  from public.vocabulary_items as vi

  join public.student_vocabulary_progress as svp
    on svp.vocabulary_item_id = vi.id
   and svp.student_id = v_student_id

  where vi.lesson_id = p_lesson_id
    and vi.is_published = true
    and (
      coalesce(svp.correct_count, 0) > 0
      or coalesce(svp.wrong_count, 0) > 0
      or coalesce(svp.mastery_score, 0) > 0
    );

  ------------------------------------------------------------
  -- Add truthful metric without breaking old contracts
  ------------------------------------------------------------

  return
    v_base
    ||
    jsonb_build_object(
      'average_mastery_started',
        v_average_mastery_started,

      'average_mastery_started_items',
        v_started_items,

      'summary_version',
        'v3'
    );

end;
$function$;

