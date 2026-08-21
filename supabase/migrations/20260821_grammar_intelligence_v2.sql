-- JAK Academy v5
-- Grammar Intelligence v2
-- Captured from current Supabase production definitions on 2026-08-21.
--
-- Includes the current production definitions for:
--   recalculate_student_grammar_progress_v2(uuid)
--   update_student_grammar_status_v2(uuid)
--   student_submit_exam_attempt_v3(uuid)
--   get_student_grammar_journey_v2()
--   get_student_study_plan_v4()
--
-- Documentation/reproducibility migration. Existing earlier versions are preserved.

-- ============================================================
-- recalculate_student_grammar_progress_v2
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_student_grammar_progress_v2(p_student_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid;
  affected_rows integer := 0;
begin

  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if current_user_id <> p_student_id then
    raise exception
      'You can only recalculate your own grammar progress.';
  end if;


  insert into public.student_grammar_progress (

    student_id,
    grammar_skill_id,

    status,
    mastery_score,

    function_score,
    form_score,
    context_score,
    contrast_score,
    retention_score,

    evidence_count,
    correct_count,
    wrong_count,

    function_evidence_count,
    form_evidence_count,
    context_evidence_count,
    contrast_evidence_count,
    retention_evidence_count,

    stage,

    first_seen_at,
    last_seen_at,
    last_correct_at,
    last_wrong_at,

    last_reviewed_at,
    next_review_at,

    is_mastered,
    mastered_at,

    updated_at
  )

  select

    e.student_id,
    e.grammar_skill_id,

    --------------------------------------------------------
    -- New rows begin in diagnosing.
    -- Existing status will be preserved in ON CONFLICT.
    --------------------------------------------------------

    'diagnosing'::text,

    --------------------------------------------------------
    -- OVERALL SCORE
    --------------------------------------------------------

    round(
      (
        count(*) filter (
          where e.is_correct = true
        )::numeric
        /
        nullif(count(*), 0)
      ) * 100
    )::integer,


    --------------------------------------------------------
    -- FUNCTION
    --------------------------------------------------------

    coalesce(
      round(
        (
          count(*) filter (
            where e.dimension = 'function'
              and e.is_correct = true
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.dimension = 'function'
            ),
            0
          )
        ) * 100
      )::integer,
      0
    ),


    --------------------------------------------------------
    -- FORM
    --------------------------------------------------------

    coalesce(
      round(
        (
          count(*) filter (
            where e.dimension = 'form'
              and e.is_correct = true
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.dimension = 'form'
            ),
            0
          )
        ) * 100
      )::integer,
      0
    ),


    --------------------------------------------------------
    -- CONTEXT
    --------------------------------------------------------

    coalesce(
      round(
        (
          count(*) filter (
            where e.dimension = 'context'
              and e.is_correct = true
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.dimension = 'context'
            ),
            0
          )
        ) * 100
      )::integer,
      0
    ),


    --------------------------------------------------------
    -- CONTRAST
    --------------------------------------------------------

    coalesce(
      round(
        (
          count(*) filter (
            where e.dimension = 'contrast'
              and e.is_correct = true
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.dimension = 'contrast'
            ),
            0
          )
        ) * 100
      )::integer,
      0
    ),


    --------------------------------------------------------
    -- RETENTION
    --------------------------------------------------------

    coalesce(
      round(
        (
          count(*) filter (
            where e.dimension = 'retention'
              and e.is_correct = true
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.dimension = 'retention'
          ),
          0
        )
      ) * 100
    )::integer,
    0
  ),


    --------------------------------------------------------
    -- EVIDENCE COUNTS
    --------------------------------------------------------

    count(*)::integer,

    count(*) filter (
      where e.is_correct = true
    )::integer,

    count(*) filter (
      where e.is_correct = false
    )::integer,


    count(*) filter (
      where e.dimension = 'function'
    )::integer,

    count(*) filter (
      where e.dimension = 'form'
    )::integer,

    count(*) filter (
      where e.dimension = 'context'
    )::integer,

    count(*) filter (
      where e.dimension = 'contrast'
    )::integer,

    count(*) filter (
      where e.dimension = 'retention'
         or e.is_retention = true
    )::integer,


    --------------------------------------------------------
    -- NEW ROW LIFECYCLE DEFAULTS
    --------------------------------------------------------

    0,

    min(e.created_at),
    max(e.created_at),

    max(e.created_at) filter (
      where e.is_correct = true
    ),

    max(e.created_at) filter (
      where e.is_correct = false
    ),

    null,
    null,

    false,
    null,

    now()

  from public.student_grammar_evidence e

  where e.student_id = p_student_id
    and e.is_answered = true

  group by
    e.student_id,
    e.grammar_skill_id


  ----------------------------------------------------------
  -- Existing lifecycle fields are deliberately untouched.
  ----------------------------------------------------------

  on conflict (student_id, grammar_skill_id)

  do update set

    mastery_score =
      excluded.mastery_score,

    function_score =
      excluded.function_score,

    form_score =
      excluded.form_score,

    context_score =
      excluded.context_score,

    contrast_score =
      excluded.contrast_score,

    retention_score =
      excluded.retention_score,

    evidence_count =
      excluded.evidence_count,

    correct_count =
      excluded.correct_count,

    wrong_count =
      excluded.wrong_count,

    function_evidence_count =
      excluded.function_evidence_count,

    form_evidence_count =
      excluded.form_evidence_count,

    context_evidence_count =
      excluded.context_evidence_count,

    contrast_evidence_count =
      excluded.contrast_evidence_count,

    retention_evidence_count =
      excluded.retention_evidence_count,

    first_seen_at =
      excluded.first_seen_at,

    last_seen_at =
      excluded.last_seen_at,

    last_correct_at =
      excluded.last_correct_at,

    last_wrong_at =
      excluded.last_wrong_at,

    updated_at = now();


  get diagnostics affected_rows = row_count;


  return jsonb_build_object(
    'engineVersion',
      'grammar-progress-v2',

    'studentId',
      p_student_id,

    'progressRowsUpserted',
      affected_rows
  );

end;
$function$;

-- ============================================================
-- update_student_grammar_status_v2
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_student_grammar_status_v2(p_student_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid;
  r record;

  v_dimension_count integer;
  v_stage integer;
  v_status text;
  v_is_mastered boolean;
  v_mastered_at timestamptz;
  v_next_review_at timestamptz;
  v_last_reviewed_at timestamptz;

  v_retention_correct boolean;
  v_retention_created_at timestamptz;
  v_has_new_retention boolean;
  v_retention_is_due boolean;

  affected_rows integer := 0;
begin

  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if current_user_id <> p_student_id then
    raise exception
      'You can only update your own grammar status.';
  end if;


  for r in
    select *
    from public.student_grammar_progress
    where student_id = p_student_id
    order by grammar_skill_id
  loop

    --------------------------------------------------------
    -- Learning dimensions with real evidence
    --------------------------------------------------------

    v_dimension_count :=
      (case when coalesce(r.function_evidence_count, 0) > 0 then 1 else 0 end)
      +
      (case when coalesce(r.form_evidence_count, 0) > 0 then 1 else 0 end)
      +
      (case when coalesce(r.context_evidence_count, 0) > 0 then 1 else 0 end)
      +
      (case when coalesce(r.contrast_evidence_count, 0) > 0 then 1 else 0 end);


    v_stage := coalesce(r.stage, 0);
    v_status := coalesce(r.status, 'new');
    v_is_mastered := coalesce(r.is_mastered, false);
    v_mastered_at := r.mastered_at;
    v_next_review_at := r.next_review_at;
    v_last_reviewed_at := r.last_reviewed_at;


    --------------------------------------------------------
    -- Latest retention evidence
    --------------------------------------------------------

    v_retention_correct := null;
    v_retention_created_at := null;

    select
      e.is_correct,
      e.created_at
    into
      v_retention_correct,
      v_retention_created_at
    from public.student_grammar_evidence e
    where e.student_id = p_student_id
      and e.grammar_skill_id = r.grammar_skill_id
      and e.is_answered = true
      and (
        e.is_retention = true
        or e.dimension = 'retention'
      )
    order by e.created_at desc
    limit 1;


    v_has_new_retention :=
      v_retention_created_at is not null
      and (
        v_last_reviewed_at is null
        or v_retention_created_at > v_last_reviewed_at
      );


    --------------------------------------------------------
    -- Retention counts only when its scheduled checkpoint
    -- has actually arrived.
    --------------------------------------------------------

    v_retention_is_due :=
      v_has_new_retention
      and v_next_review_at is not null
      and v_retention_created_at >= v_next_review_at;


    --------------------------------------------------------
    -- MASTERED
    --------------------------------------------------------

    if v_is_mastered then

      v_status := 'mastered';


    --------------------------------------------------------
    -- NEW
    --------------------------------------------------------

    elsif coalesce(r.evidence_count, 0) <= 0 then

      v_status := 'new';
      v_stage := 0;
      v_next_review_at := null;


    --------------------------------------------------------
    -- DIAGNOSING
    --------------------------------------------------------

    elsif r.evidence_count < 2 then

      v_status := 'diagnosing';
      v_stage := 0;
      v_next_review_at := null;


    --------------------------------------------------------
    -- DUE RETENTION RESULT
    --------------------------------------------------------

    elsif v_retention_is_due then

      if v_retention_correct = true then

        v_stage :=
          least(4, v_stage + 1);

        v_last_reviewed_at :=
          v_retention_created_at;


        if
          v_stage >= 4
          and r.mastery_score >= 80
          and v_dimension_count >= 3
          and coalesce(r.retention_score, 0) >= 75
        then

          v_status := 'mastered';
          v_is_mastered := true;

          v_mastered_at :=
            coalesce(v_mastered_at, now());

          v_next_review_at := null;

        else

          v_status := 'fragile';

          v_next_review_at :=
            case v_stage
              when 1 then
                v_retention_created_at + interval '3 days'
              when 2 then
                v_retention_created_at + interval '7 days'
              when 3 then
                v_retention_created_at + interval '14 days'
              else
                v_retention_created_at + interval '14 days'
            end;

        end if;


      else

        v_stage :=
          greatest(0, v_stage - 1);

        v_status := 'fragile';
        v_is_mastered := false;
        v_mastered_at := null;

        v_last_reviewed_at :=
          v_retention_created_at;

        v_next_review_at :=
          v_retention_created_at
          + interval '1 day';

      end if;


    --------------------------------------------------------
    -- STRONG ENOUGH TO ENTER RETENTION CYCLE
    --------------------------------------------------------

    elsif
      r.evidence_count >= 4
      and r.mastery_score >= 80
      and v_dimension_count >= 3
    then

      v_status := 'fragile';

      if v_next_review_at is null then
        v_next_review_at :=
          coalesce(r.last_seen_at, now())
          + interval '1 day';
      end if;


    --------------------------------------------------------
    -- PRACTISING
    --------------------------------------------------------

    elsif
      r.evidence_count >= 3
      and r.mastery_score >= 70
      and v_dimension_count >= 2
    then

      v_status := 'practising';
      v_next_review_at := null;


    --------------------------------------------------------
    -- LEARNING
    --------------------------------------------------------

    else

      v_status := 'learning';
      v_next_review_at := null;

    end if;


    update public.student_grammar_progress
    set
      status = v_status,
      stage = v_stage,
      is_mastered = v_is_mastered,
      mastered_at = v_mastered_at,
      last_reviewed_at = v_last_reviewed_at,
      next_review_at = v_next_review_at,
      updated_at = now()
    where student_id = p_student_id
      and grammar_skill_id = r.grammar_skill_id;


    affected_rows :=
      affected_rows + 1;

  end loop;


  return jsonb_build_object(
    'engineVersion', 'grammar-status-v2',
    'studentId', p_student_id,
    'statusRowsUpdated', affected_rows
  );

end;
$function$;

-- ============================================================
-- student_submit_exam_attempt_v3
-- ============================================================
CREATE OR REPLACE FUNCTION public.student_submit_exam_attempt_v3(p_attempt_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  submit_result jsonb;
  grammar_capture_result jsonb;
  grammar_progress_result jsonb;
  grammar_status_result jsonb;
  current_student_id uuid;
begin

  current_student_id := auth.uid();

  if current_student_id is null then
    raise exception 'Authentication is required.';
  end if;


  ----------------------------------------------------------
  -- 1. NORMAL EXAM SUBMISSION
  ----------------------------------------------------------

  submit_result :=
    public.student_submit_exam_attempt(
      p_attempt_id
    );


  ----------------------------------------------------------
  -- 2. CAPTURE GRAMMAR EVIDENCE
  ----------------------------------------------------------

  grammar_capture_result :=
    public.capture_student_grammar_evidence(
      p_attempt_id
    );


  ----------------------------------------------------------
  -- 3. RECALCULATE GRAMMAR SCORES / EVIDENCE
  ----------------------------------------------------------

  grammar_progress_result :=
    public.recalculate_student_grammar_progress_v2(
      current_student_id
    );


  ----------------------------------------------------------
  -- 4. UPDATE GRAMMAR LIFECYCLE
  ----------------------------------------------------------

  grammar_status_result :=
    public.update_student_grammar_status_v2(
      current_student_id
    );


  ----------------------------------------------------------
  -- 5. REVIEW-SCHEDULE INVARIANT
  --
  -- Only fragile skills may have an active retention date.
  ----------------------------------------------------------

  update public.student_grammar_progress
  set
    next_review_at = null,
    updated_at = now()
  where student_id = current_student_id
    and status <> 'fragile'
    and next_review_at is not null;


  ----------------------------------------------------------
  -- 6. RETURN RESULT
  ----------------------------------------------------------

  return submit_result
    || jsonb_build_object(
      'grammar_intelligence',
      jsonb_build_object(
        'engineVersion',
          'grammar-progress-v2',

        'evidence_capture',
          grammar_capture_result,

        'progress_recalculation',
          grammar_progress_result,

        'status_update',
          grammar_status_result
      )
    );

end;
$function$;

-- ============================================================
-- get_student_grammar_journey_v2
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_student_grammar_journey_v2()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_student_id uuid;

  v_priority record;

  v_exam_id uuid;
  v_exam_title text;

  v_unassessed_count integer := 0;

  v_continuous_ready boolean := false;
  v_perfect_simple_ready boolean := false;
  v_perfect_continuous_ready boolean := false;

  v_continuous_attempted boolean := false;
  v_perfect_simple_attempted boolean := false;
  v_perfect_continuous_attempted boolean := false;

  v_continuous_passed boolean := false;
  v_perfect_simple_passed boolean := false;
  v_perfect_continuous_passed boolean := false;

  v_final_attempted boolean := false;
  v_final_passed boolean := false;

  v_action text;
  v_action_title_ar text;
  v_reason_ar text;

begin

  ------------------------------------------------------------
  -- 1. CURRENT STUDENT
  ------------------------------------------------------------

  v_student_id := auth.uid();

  if v_student_id is null then
    raise exception 'Authentication is required.';
  end if;


  ------------------------------------------------------------
  -- 2. MAIN DIAGNOSTIC MUST EXIST
  ------------------------------------------------------------

  if not exists (
    select 1
    from public.exam_attempts ea
    where ea.student_id = v_student_id
      and ea.exam_id =
        '50788eaa-8400-48f6-9adc-866822d348c9'::uuid
      and ea.status in ('submitted', 'expired')
      and ea.graded_at is not null
  )
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'diagnostic',
      'recommendedAction', 'take_diagnostic',
      'actionTitleAr', 'ابدأ الاختبار التشخيصي',
      'reasonAr',
        'نحتاج أولًا إلى قياس مستواك في مهارات الأزمنة المستمرة والتامة.',
      'exam',
        jsonb_build_object(
          'id',
            '50788eaa-8400-48f6-9adc-866822d348c9',
          'title',
            'اختبار تشخيصي: الأزمنة المستمرة والتامة'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 3. UNASSESSED PUBLISHED SKILLS
  --
  -- Important:
  -- A missing progress row or zero evidence is NOT readiness.
  ------------------------------------------------------------

  select count(*)::integer
  into v_unassessed_count
  from public.grammar_skills gs

  left join public.student_grammar_progress sgp
    on sgp.grammar_skill_id = gs.id
   and sgp.student_id = v_student_id

  where gs.is_published = true
    and (
      sgp.id is null
      or coalesce(sgp.evidence_count, 0) <= 0
    );


  if v_unassessed_count > 0 then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'diagnostic',
      'recommendedAction', 'continue_diagnosis',
      'actionTitleAr', 'أكمل تشخيص مهاراتك',
      'reasonAr',
        'ما زالت هناك مهارات منشورة لم نحصل على دليل كافٍ لتقييمها. السؤال غير المُجاب لا يُعد دليلًا على المعرفة.',
      'unassessedSkillCount',
        v_unassessed_count,
      'exam',
        jsonb_build_object(
          'id',
            '50788eaa-8400-48f6-9adc-866822d348c9',
          'title',
            'اختبار تشخيصي: الأزمنة المستمرة والتامة'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 4. HIGHEST PRIORITY
  --
  -- v2 DOES NOT exclude wait_for_retest.
  ------------------------------------------------------------

  select *
  into v_priority
  from public.get_student_grammar_priorities_v2(
    v_student_id
  )
  order by
    priority_score desc,
    wrong_count desc,
    evidence_count asc,
    skill_code
  limit 1;


  ------------------------------------------------------------
  -- 5. ERROR-SPECIFIC CORRECTIVE ROUTE
  ------------------------------------------------------------

  if v_priority.primary_error_signal =
       'future_completion_vs_duration'
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'corrective',
      'recommendedAction', 'correct_error',

      'skillCode',
        v_priority.skill_code,

      'priorityLevel',
        v_priority.priority_level,

      'priorityScore',
        v_priority.priority_score,

      'actionTitleAr',
        'عالج الخلط بين الإنجاز والمدة',

      'reasonAr',
        coalesce(
          v_priority.reason_ar,
          'النظام اكتشف خلطًا يحتاج إلى تدريب علاجي مباشر.'
        ),

      'exam',
        jsonb_build_object(
          'id',
            '693d556c-d46e-4749-b3f4-984d1abd5bef',
          'title',
            'تدريب علاجي: المستقبل التام — الإنجاز أم المدة؟'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 6. WAIT FOR RETENTION
  --
  -- Critical v2 fix:
  -- Waiting for retention BLOCKS progression.
  ------------------------------------------------------------

  if v_priority.recommended_action = 'wait_for_retest'
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'retention_wait',
      'recommendedAction', 'wait_for_retest',

      'skillCode',
        v_priority.skill_code,

      'skillStatus',
        v_priority.status,

      'masteryScore',
        v_priority.mastery_score,

      'priorityLevel',
        v_priority.priority_level,

      'actionTitleAr',
        coalesce(
          v_priority.action_title_ar,
          'انتظر موعد مراجعة التثبيت'
        ),

      'reasonAr',
        coalesce(
          v_priority.reason_ar,
          'تم تصحيح المهارة، ونحتاج الآن إلى ترك فترة زمنية قبل اختبار ثباتها.'
        ),

      'exam',
        null
    );

  end if;


  ------------------------------------------------------------
  -- 7. MAP ACTIVE SKILL TO ITS MASTERY / RETEST EXAM
  ------------------------------------------------------------

  if v_priority.skill_code is not null then

    case

      when v_priority.skill_code in (
        'present_continuous_now',
        'present_continuous_temporary',
        'present_continuous_change',
        'present_continuous_repeated_unexpected'
      )
      then
        v_exam_title :=
          'إتقان درس: المضارع المستمر';


      when v_priority.skill_code in (
        'past_continuous_in_progress',
        'past_continuous_interrupted'
      )
      then
        v_exam_title :=
          'إتقان درس: الماضي المستمر';


      when v_priority.skill_code in (
        'future_continuous_in_progress',
        'future_continuous_expected',
        'future_continuous_polite_plan'
      )
      then
        v_exam_title :=
          'إتقان درس: المستقبل المستمر';


      when v_priority.skill_code in (
        'present_perfect_unspecified_past',
        'present_perfect_present_result',
        'present_perfect_continues_to_now',
        'present_perfect_result_focus'
      )
      then
        v_exam_title :=
          'إتقان درس: المضارع التام البسيط';


      when v_priority.skill_code in (
        'past_perfect_before_past_time',
        'past_perfect_sequence'
      )
      then
        v_exam_title :=
          'إتقان درس: الماضي التام البسيط';


      when v_priority.skill_code =
        'future_perfect_completed_before_future'
      then
        v_exam_title :=
          'إتقان درس: المستقبل التام البسيط';


      when v_priority.skill_code in (
        'present_perfect_continuous_duration',
        'present_perfect_continuous_activity_focus'
      )
      then
        v_exam_title :=
          'إتقان درس: المضارع التام المستمر';


      when v_priority.skill_code =
        'past_perfect_continuous_before_past'
      then
        v_exam_title :=
          'إتقان درس: الماضي التام المستمر';


      when v_priority.skill_code =
        'future_perfect_continuous_until_future'
      then
        v_exam_title :=
          'إتقان درس: المستقبل التام المستمر';

      else
        v_exam_title := null;

    end case;


    ----------------------------------------------------------
    -- RETEST OR NORMAL MASTERY
    ----------------------------------------------------------

    if v_exam_title is not null then

      select e.id
      into v_exam_id
      from public.exams e
      where e.course_id =
        '1917e4ba-4bc7-45f2-953a-95d40cdb3db7'::uuid
        and e.title = v_exam_title
        and e.status = 'published'
      limit 1;


      if v_priority.recommended_action = 'retest_now'
      then

        v_action := 'retest_now';
        v_action_title_ar :=
          'حان وقت إعادة تثبيت المهارة';
        v_reason_ar :=
          'موعد مراجعة التثبيت لهذه المهارة قد حان.';

      else

        v_action :=
          coalesce(
            v_priority.recommended_action,
            'continue_learning'
          );

        v_action_title_ar :=
          coalesce(
            v_priority.action_title_ar,
            'تابع تعلم القواعد'
          );

        v_reason_ar :=
          coalesce(
            v_priority.reason_ar,
            'هذه هي الخطوة الأنسب لك الآن.'
          );

      end if;


      return jsonb_build_object(
        'engineVersion', 'grammar-journey-v2',

        'journeyStage',
          case
            when v_action = 'retest_now'
              then 'retest'
            else 'mastery'
          end,

        'recommendedAction',
          v_action,

        'skillCode',
          v_priority.skill_code,

        'skillStatus',
          v_priority.status,

        'masteryScore',
          v_priority.mastery_score,

        'priorityLevel',
          v_priority.priority_level,

        'priorityScore',
          v_priority.priority_score,

        'primaryErrorSignal',
          v_priority.primary_error_signal,

        'actionTitleAr',
          v_action_title_ar,

        'reasonAr',
          v_reason_ar,

        'exam',
          jsonb_build_object(
            'id', v_exam_id,
            'title', v_exam_title
          )
      );

    end if;

  end if;


  ------------------------------------------------------------
  -- 8. FAMILY READINESS
  --
  -- Family is ready ONLY when:
  -- - family actually has published skills
  -- - every published skill has progress
  -- - every skill has evidence
  -- - every skill is truly mastered
  ------------------------------------------------------------

  select
    exists (
      select 1
      from public.grammar_skills gs
      where gs.is_published = true
        and gs.tense_family = 'continuous'
    )
    and
    not exists (
      select 1
      from public.grammar_skills gs
      left join public.student_grammar_progress sgp
        on sgp.grammar_skill_id = gs.id
       and sgp.student_id = v_student_id
      where gs.is_published = true
        and gs.tense_family = 'continuous'
        and (
          sgp.id is null
          or coalesce(sgp.evidence_count, 0) <= 0
          or coalesce(sgp.is_mastered, false) = false
        )
    )
  into v_continuous_ready;


  select
    exists (
      select 1
      from public.grammar_skills gs
      where gs.is_published = true
        and gs.tense_family = 'perfect_simple'
    )
    and
    not exists (
      select 1
      from public.grammar_skills gs
      left join public.student_grammar_progress sgp
        on sgp.grammar_skill_id = gs.id
       and sgp.student_id = v_student_id
      where gs.is_published = true
        and gs.tense_family = 'perfect_simple'
        and (
          sgp.id is null
          or coalesce(sgp.evidence_count, 0) <= 0
          or coalesce(sgp.is_mastered, false) = false
        )
    )
  into v_perfect_simple_ready;


  select
    exists (
      select 1
      from public.grammar_skills gs
      where gs.is_published = true
        and gs.tense_family = 'perfect_continuous'
    )
    and
    not exists (
      select 1
      from public.grammar_skills gs
      left join public.student_grammar_progress sgp
        on sgp.grammar_skill_id = gs.id
       and sgp.student_id = v_student_id
      where gs.is_published = true
        and gs.tense_family = 'perfect_continuous'
        and (
          sgp.id is null
          or coalesce(sgp.evidence_count, 0) <= 0
          or coalesce(sgp.is_mastered, false) = false
        )
    )
  into v_perfect_continuous_ready;


  ------------------------------------------------------------
  -- 9. FAMILY MIXED RESULTS
  --
  -- Attempted != Passed
  -- PASS = 80%
  ------------------------------------------------------------

  select
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          '84d518fc-313f-48ae-928a-fc3060027d98'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
    ),
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          '84d518fc-313f-48ae-928a-fc3060027d98'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
        and coalesce(ea.total_points_snapshot, 0) > 0
        and (
          ea.earned_points
          /
          ea.total_points_snapshot
        ) * 100 >= 80
    )
  into
    v_continuous_attempted,
    v_continuous_passed;


  select
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          'b5641895-66f3-4da6-a71b-b056a9c20360'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
    ),
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          'b5641895-66f3-4da6-a71b-b056a9c20360'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
        and coalesce(ea.total_points_snapshot, 0) > 0
        and (
          ea.earned_points
          /
          ea.total_points_snapshot
        ) * 100 >= 80
    )
  into
    v_perfect_simple_attempted,
    v_perfect_simple_passed;


  select
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          'e76d6582-81c5-49d6-bd82-896d82e51bb6'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
    ),
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          'e76d6582-81c5-49d6-bd82-896d82e51bb6'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
        and coalesce(ea.total_points_snapshot, 0) > 0
        and (
          ea.earned_points
          /
          ea.total_points_snapshot
        ) * 100 >= 80
    )
  into
    v_perfect_continuous_attempted,
    v_perfect_continuous_passed;


  ------------------------------------------------------------
  -- 10. CONTINUOUS FAMILY
  ------------------------------------------------------------

  if v_continuous_ready
     and not v_continuous_passed
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'family_mixed',

      'recommendedAction',
        case
          when v_continuous_attempted
            then 'retry_family_mixed'
          else 'take_family_mixed'
        end,

      'actionTitleAr',
        case
          when v_continuous_attempted
            then 'أعد اختبار الأزمنة المستمرة'
          else 'اختبر إتقانك للأزمنة المستمرة'
        end,

      'reasonAr',
        case
          when v_continuous_attempted
            then 'تحتاج إلى 80% على الأقل لاجتياز الاختبار المختلط لهذه المجموعة.'
          else 'أثبتت إتقان المهارات الفردية، وحان وقت الاختبار المختلط لهذه المجموعة.'
        end,

      'passPercent', 80,

      'exam',
        jsonb_build_object(
          'id',
            '84d518fc-313f-48ae-928a-fc3060027d98',
          'title',
            'اختبار شامل: الأزمنة المستمرة'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 11. PERFECT SIMPLE FAMILY
  ------------------------------------------------------------

  if v_perfect_simple_ready
     and not v_perfect_simple_passed
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'family_mixed',

      'recommendedAction',
        case
          when v_perfect_simple_attempted
            then 'retry_family_mixed'
          else 'take_family_mixed'
        end,

      'actionTitleAr',
        case
          when v_perfect_simple_attempted
            then 'أعد اختبار الأزمنة التامة البسيطة'
          else 'اختبر إتقانك للأزمنة التامة البسيطة'
        end,

      'reasonAr',
        case
          when v_perfect_simple_attempted
            then 'تحتاج إلى 80% على الأقل لاجتياز الاختبار المختلط لهذه المجموعة.'
          else 'أثبتت إتقان المهارات الفردية، وحان وقت الاختبار المختلط لهذه المجموعة.'
        end,

      'passPercent', 80,

      'exam',
        jsonb_build_object(
          'id',
            'b5641895-66f3-4da6-a71b-b056a9c20360',
          'title',
            'اختبار شامل: الأزمنة التامة البسيطة'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 12. PERFECT CONTINUOUS FAMILY
  ------------------------------------------------------------

  if v_perfect_continuous_ready
     and not v_perfect_continuous_passed
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'family_mixed',

      'recommendedAction',
        case
          when v_perfect_continuous_attempted
            then 'retry_family_mixed'
          else 'take_family_mixed'
        end,

      'actionTitleAr',
        case
          when v_perfect_continuous_attempted
            then 'أعد اختبار الأزمنة التامة المستمرة'
          else 'اختبر إتقانك للأزمنة التامة المستمرة'
        end,

      'reasonAr',
        case
          when v_perfect_continuous_attempted
            then 'تحتاج إلى 80% على الأقل لاجتياز الاختبار المختلط لهذه المجموعة.'
          else 'أثبتت إتقان المهارات الفردية، وحان وقت الاختبار المختلط لهذه المجموعة.'
        end,

      'passPercent', 80,

      'exam',
        jsonb_build_object(
          'id',
            'e76d6582-81c5-49d6-bd82-896d82e51bb6',
          'title',
            'اختبار شامل: الأزمنة التامة المستمرة'
        )
    );

  end if;


  ------------------------------------------------------------
  -- 13. DO NOT OPEN FINAL UNTIL ALL 3 FAMILIES PASSED
  ------------------------------------------------------------

  if not (
    v_continuous_passed
    and v_perfect_simple_passed
    and v_perfect_continuous_passed
  )
  then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'family_mastery_pending',
      'recommendedAction', 'continue_family_mastery',
      'actionTitleAr', 'أكمل إتقان مجموعات القواعد',
      'reasonAr',
        'لن يفتح الاختبار الشامل النهائي حتى تثبت إتقان المهارات وتجتاز اختبارات المجموعات الثلاث بنسبة 80% على الأقل.',
      'familyStatus',
        jsonb_build_object(
          'continuousPassed',
            v_continuous_passed,
          'perfectSimplePassed',
            v_perfect_simple_passed,
          'perfectContinuousPassed',
            v_perfect_continuous_passed
        )
    );

  end if;


  ------------------------------------------------------------
  -- 14. FINAL MIXED RESULT
  ------------------------------------------------------------

  select
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          '1141d7a4-7b39-4d25-ba0e-0ffd5274f33b'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
    ),
    exists (
      select 1
      from public.exam_attempts ea
      where ea.student_id = v_student_id
        and ea.exam_id =
          '1141d7a4-7b39-4d25-ba0e-0ffd5274f33b'::uuid
        and ea.status in ('submitted', 'expired')
        and ea.graded_at is not null
        and coalesce(ea.total_points_snapshot, 0) > 0
        and (
          ea.earned_points
          /
          ea.total_points_snapshot
        ) * 100 >= 80
    )
  into
    v_final_attempted,
    v_final_passed;


  ------------------------------------------------------------
  -- 15. JOURNEY COMPLETED
  ------------------------------------------------------------

  if v_final_passed then

    return jsonb_build_object(
      'engineVersion', 'grammar-journey-v2',
      'journeyStage', 'completed',
      'recommendedAction', 'grammar_mastery_complete',
      'actionTitleAr', 'أثبتَّ إتقانك للقواعد',
      'reasonAr',
        'اجتزت مراحل الإتقان واختبارات المجموعات والاختبار الشامل النهائي بنجاح.',
      'passPercent', 80,
      'exam', null
    );

  end if;


  ------------------------------------------------------------
  -- 16. FINAL MIXED
  ------------------------------------------------------------

  return jsonb_build_object(
    'engineVersion', 'grammar-journey-v2',
    'journeyStage', 'final_mixed',

    'recommendedAction',
      case
        when v_final_attempted
          then 'retry_final_mixed'
        else 'take_final_mixed'
      end,

    'actionTitleAr',
      case
        when v_final_attempted
          then 'أعد الاختبار الشامل النهائي'
        else 'أثبت إتقانك الكامل للوحدة'
      end,

    'reasonAr',
      case
        when v_final_attempted
          then 'تحتاج إلى 80% على الأقل لاجتياز الاختبار الشامل النهائي.'
        else 'اجتزت اختبارات المجموعات الثلاث، وحان وقت الاختبار الشامل النهائي.'
      end,

    'passPercent', 80,

    'exam',
      jsonb_build_object(
        'id',
          '1141d7a4-7b39-4d25-ba0e-0ffd5274f33b',
        'title',
          'اختبار شامل: الأزمنة المستمرة والتامة'
      )
  );

end;
$function$;

-- ============================================================
-- get_student_study_plan_v4
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_student_study_plan_v4()
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
  -- 2. GET GRAMMAR INTELLIGENCE JOURNEY V2
  ------------------------------------------------------------

  v_grammar_journey :=
    public.get_student_grammar_journey_v2();


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
  -- 5. RETURN V4 PLAN
  ------------------------------------------------------------

  return
    v_plan
    ||
    jsonb_build_object(
      'grammarJourney',
        v_grammar_journey,
      'studyPlanEngineVersion',
        'v4'
    );

end;
$function$;

