export const PLATFORM_SECTIONS = [
  {
    id: 'foundations',
    icon: '🔤',
    title: 'English Foundations',
    arabicTitle: 'تأسيس اللغة الإنجليزية',
    description:
      'مسار تدريجي للطالب الذي يريد البدء من الصفر وبناء أساس قوي في النطق والكلمات والقواعد والقراءة.',
    actionLabel: 'ابدأ التأسيس',
  },
  {
    id: 'units',
    icon: '📘',
    title: 'Units 1–10',
    arabicTitle: 'الوحدات التعليمية',
    description:
      'عشر وحدات متكاملة تشمل المفردات والقواعد والقراءة والكتابة والمحادثة والتدريبات.',
    actionLabel: 'استكشف الوحدات',
  },
  {
    id: 'study-plans',
    icon: '📅',
    title: 'Study Plans',
    arabicTitle: 'الجداول الدراسية',
    description:
      'خطط يومية وأسبوعية تساعد الطالب على تنظيم وقته ومتابعة إنجازه بطريقة واضحة.',
    actionLabel: 'عرض الخطط',
  },
  {
    id: 'games',
    icon: '🎮',
    title: 'English Games',
    arabicTitle: 'الألعاب التعليمية',
    description:
      'ألعاب تعليمية لحفظ المعاني والتصريفات والتهجئة بطريقة ممتعة وفعالة.',
    actionLabel: 'ابدأ اللعب',
  },
]

export const UNIT_SECTIONS = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    arabicTitle: 'المفردات',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    arabicTitle: 'القواعد',
  },
  {
    id: 'reading',
    title: 'Reading',
    arabicTitle: 'القراءة',
  },
  {
    id: 'writing',
    title: 'Writing',
    arabicTitle: 'الكتابة',
  },
  {
    id: 'speaking',
    title: 'Speaking',
    arabicTitle: 'المحادثة',
  },
  {
    id: 'extras',
    title: 'Extras',
    arabicTitle: 'متفرقات',
  },
]

export const UNITS = Array.from({ length: 10 }, (_, index) => {
  const unitNumber = index + 1

  return {
    id: `unit-${unitNumber}`,
    slug: `unit-${unitNumber}`,
    number: unitNumber,
    title: `Unit ${unitNumber}`,
    isFree: unitNumber === 1,
    sections: UNIT_SECTIONS,
  }
})

export const FOUNDATION_TOPICS = [
  {
    id: 'letter-sounds',
    icon: 'A',
    title: 'Letter Sounds',
    arabicTitle: 'أصوات الحروف',
  },
  {
    id: 'letter-combinations',
    icon: 'SH',
    title: 'Letter Combinations',
    arabicTitle: 'الحروف المركبة',
  },
  {
    id: 'pronunciation-rules',
    icon: '🔊',
    title: 'Pronunciation Rules',
    arabicTitle: 'قواعد النطق',
  },
  {
    id: 'basic-vocabulary',
    icon: '💬',
    title: 'Basic Vocabulary',
    arabicTitle: 'المفردات الأساسية',
  },
  {
    id: 'basic-grammar',
    icon: '🧩',
    title: 'Basic Grammar',
    arabicTitle: 'القواعد الأساسية',
  },
  {
    id: 'sentence-building',
    icon: '✍️',
    title: 'Sentence Building',
    arabicTitle: 'بناء الجملة',
  },
  {
    id: 'reading-from-zero',
    icon: '📖',
    title: 'Reading from Zero',
    arabicTitle: 'القراءة من الصفر',
  },
  {
    id: 'writing-from-zero',
    icon: '📝',
    title: 'Writing from Zero',
    arabicTitle: 'الكتابة من الصفر',
  },
]

export const GAME_CATEGORIES = [
  {
    id: 'match-meaning',
    icon: '🔗',
    title: 'Match the Meaning',
    arabicTitle: 'طابق الكلمة مع معناها',
    description: 'اربط الكلمة الإنجليزية بالمعنى العربي الصحيح.',
  },
  {
    id: 'flashcards',
    icon: '🃏',
    title: 'Flashcards',
    arabicTitle: 'بطاقات الحفظ',
    description: 'راجع الكلمات والمعاني باستخدام بطاقات تفاعلية.',
  },
  {
    id: 'spelling',
    icon: '⌨️',
    title: 'Spelling Challenge',
    arabicTitle: 'تحدي التهجئة',
    description: 'اكتب الكلمات بصورة صحيحة وارفع مستوى التهجئة.',
  },
  {
    id: 'irregular-verbs',
    icon: '⚡',
    title: 'Irregular Verbs',
    arabicTitle: 'الأفعال غير المنتظمة',
    description: 'تدرب على الفعل وتصريف الماضي والتصريف الثالث.',
  },
]

export const PLATFORM_STATISTICS = [
  {
    value: '10',
    label: 'وحدات تعليمية',
  },
  {
    value: '6',
    label: 'مهارات داخل كل وحدة',
  },
  {
    value: '1',
    label: 'وحدة مجانية بالكامل',
  },
]