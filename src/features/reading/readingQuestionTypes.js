const READING_QUESTION_TYPES = Object.freeze({
  MAIN_IDEA: Object.freeze({
    code: 'main_idea',
    labelEn: 'Main Idea',
    labelAr: 'الفكرة الرئيسة',
    descriptionAr:
      'يطلب منك تحديد الفكرة التي تلخص النص أو الفقرة كاملة، وليس تفصيلاً صغيراً.',
    signals: Object.freeze([
      'main idea',
      'mainly about',
      'mostly about',
      'best title',
    ]),
    strategyAr:
      'اقرأ الفكرة المتكررة، وركّز على أول وآخر جملة، ثم استبعد الخيارات الجزئية.',
  }),

  WRITERS_PURPOSE: Object.freeze({
    code: 'writers_purpose',
    labelEn: "Writer's Purpose",
    labelAr: 'هدف الكاتب أو ما يفعله في النص',
    descriptionAr:
      'يسأل عن وظيفة الكاتب داخل النص: هل يشرح، يشير إلى بحث، ينتقد، يقارن، يقنع أو يصف؟',
    signals: Object.freeze([
      'the author',
      'the writer',
      "writer's purpose",
      'purpose',
    ]),
    strategyAr:
      'حدد ما يفعله الكاتب فعلياً في النص، ولا تختَر فكرة لم يذكرها.',
  }),

  REFERENCE: Object.freeze({
    code: 'reference',
    labelEn: 'Reference',
    labelAr: 'عودة الضمير أو الكلمة',
    descriptionAr:
      'يطلب تحديد الكلمة أو الفكرة التي يعود عليها ضمير أو اسم إشارة أو تعبير محدد.',
    signals: Object.freeze([
      'refers to',
      'it',
      'this',
      'that',
      'these',
      'those',
      'something',
    ]),
    strategyAr:
      'ارجع إلى الجملة نفسها والجملة السابقة، وابحث عن أقرب مرجع منطقي يناسب المعنى.',
  }),

  DETAIL: Object.freeze({
    code: 'detail',
    labelEn: 'Detail Question',
    labelAr: 'معلومة مباشرة',
    descriptionAr:
      'يسأل عن معلومة مذكورة بشكل مباشر في النص.',
    signals: Object.freeze([
      'according to the text',
      'according to the passage',
      'states',
      'mentions',
    ]),
    strategyAr:
      'حدد كلمات السؤال ثم ابحث عن الجملة التي تحمل نفس المعلومة أو معناها.',
  }),

  CAUSE_REASON: Object.freeze({
    code: 'cause_reason',
    labelEn: 'Cause / Reason',
    labelAr: 'السبب',
    descriptionAr:
      'يسأل لماذا حدث شيء أو لماذا كان للكاتب أو الشخص موقف معين.',
    signals: Object.freeze([
      'because',
      'reason',
      'why',
      'because of',
    ]),
    strategyAr:
      'ابحث عن علاقة السبب والنتيجة، وليس مجرد جملة قريبة من السؤال.',
  }),

  INFERENCE: Object.freeze({
    code: 'inference',
    labelEn: 'Inference',
    labelAr: 'الاستنتاج',
    descriptionAr:
      'يطلب استنتاج فكرة غير مكتوبة حرفياً لكنها مدعومة بأدلة من النص.',
    signals: Object.freeze([
      'we can infer',
      'it can be inferred',
      'it can be concluded',
      'suggests that',
    ]),
    strategyAr:
      'اجمع الأدلة من النص، ثم اختر الاستنتاج الوحيد الذي تدعمه هذه الأدلة.',
  }),

  VOCABULARY_IN_CONTEXT: Object.freeze({
    code: 'vocabulary_in_context',
    labelEn: 'Vocabulary in Context',
    labelAr: 'معنى الكلمة من السياق',
    descriptionAr:
      'يسأل عن معنى كلمة أو تعبير كما استُخدم داخل النص.',
    signals: Object.freeze([
      'means',
      'synonym',
      'closest in meaning',
      'the word',
      'the phrase',
    ]),
    strategyAr:
      'اقرأ الجملة كاملة وما حولها، ثم اختبر المعنى داخل السياق قبل اختيار الإجابة.',
  }),

  ATTITUDE_TONE: Object.freeze({
    code: 'attitude_tone',
    labelEn: 'Attitude / Tone',
    labelAr: 'موقف الكاتب أو نبرته',
    descriptionAr:
      'يسأل عن شعور الكاتب أو موقفه تجاه الموضوع.',
    signals: Object.freeze([
      'attitude',
      'tone',
      'the writer feels',
      'the author feels',
    ]),
    strategyAr:
      'ركز على الكلمات التي تحمل رأياً أو شعوراً، وليس المعلومات المحايدة.',
  }),

  LITERARY_DEVICE: Object.freeze({
    code: 'literary_device',
    labelEn: 'Literary Device',
    labelAr: 'الأسلوب أو الصورة الأدبية',
    descriptionAr:
      'يطلب التعرف إلى أسلوب أدبي مثل التشبيه أو الاستعارة أو المحاكاة الصوتية.',
    signals: Object.freeze([
      'poetic device',
      'literary device',
      'onomatopoeia',
      'simile',
      'metaphor',
      'personification',
      'alliteration',
    ]),
    strategyAr:
      'حدد أولاً تعريف الأسلوب المطلوب، ثم ابحث عن المثال الذي يطابقه بدقة.',
  }),

  SENSORY_IMAGERY: Object.freeze({
    code: 'sensory_imagery',
    labelEn: 'Sensory Imagery',
    labelAr: 'الحاسة أو الصورة الحسية',
    descriptionAr:
      'يسأل أي حاسة تستثيرها كلمة أو عبارة داخل النص.',
    signals: Object.freeze([
      'which sense',
      'sight',
      'hearing',
      'smell',
      'taste',
      'touch',
    ]),
    strategyAr:
      'اربط الكلمة بالفعل الحسي مباشرة: صوت، منظر، رائحة، طعم أو لمس.',
  }),
})

const READING_QUESTION_TYPE_LIST = Object.freeze(
  Object.values(READING_QUESTION_TYPES),
)

function getReadingQuestionTypeByCode(code) {
  const normalizedCode = String(code || '')
    .trim()
    .toLowerCase()

  return (
    READING_QUESTION_TYPE_LIST.find(
      (item) => item.code === normalizedCode,
    ) || null
  )
}

export {
  READING_QUESTION_TYPES,
  READING_QUESTION_TYPE_LIST,
  getReadingQuestionTypeByCode,
}