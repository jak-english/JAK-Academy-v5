const UNIT1_READING_PASSAGE = Object.freeze({
  id: 'unit1-does-language-change-how-you-see-the-world',

  unit: 1,

  lesson: '5A',

  title:
    'Does Language Change How You See the World?',

  source: Object.freeze({
    book:
      'Jordan High Note Grade 12 Student Book Semester 1',
    edition: 'Second Edition Revised and Updated 2026',
    lesson: '5A',
    pages: '10–11',
  }),

  paragraphs: Object.freeze([
    Object.freeze({
      id: 'paragraph-a',

      label: 'A',

      title:
        'Inuit, Snow, and Linguistic Relativity',

      text:
        'Have you heard that the Inuit have hundreds of different words for snow? The theory goes that because snow is so much more present in their lives, and often of vital importance, they actually perceive it differently, and recognise more subtle distinctions between different types of snow and ice than those of us living in warmer climes. In fact, this theory is something of a myth, not least because there isn’t a single Inuit language, but a variety of dialects. However, recent research has shown that there is at least some truth in the idea that these dialects have more ways of distinguishing different types of snow than many other languages do. The key question though, isn’t really whether there are more words to describe frozen water so much as whether this implies that the languages spoken by the Inuit mould the way they conceive of the world. This concept is referred to as linguistic relativity or, more famously, the Sapir-Whorf hypothesis, after two scientists who both wrote, separately, about this idea.',

      learning: Object.freeze({
        mainIdeaAr:
          'تستخدم الفقرة مثال شعب الإنويت وكلمات الثلج لتقديم فكرة النسبية اللغوية: هل تؤثر اللغة في الطريقة التي نرى بها العالم؟',

        purposeAr:
          'يقدم الكاتب النظرية ويشرح مثالًا مشهورًا عليها، ثم يوضح أن جزءًا من قصة كلمات الثلج مبالغ فيه قبل الوصول إلى مفهوم النسبية اللغوية.',

        keyWords: Object.freeze([
          Object.freeze({
            word: 'perceive',
            meaningAr: 'يدرك / يرى ذهنيًا',
          }),
          Object.freeze({
            word: 'recognise',
            meaningAr: 'يميّز / يتعرّف إلى',
          }),
          Object.freeze({
            word: 'distinctions',
            meaningAr: 'فروق / تمييزات',
          }),
          Object.freeze({
            word: 'dialects',
            meaningAr: 'لهجات',
          }),
          Object.freeze({
            word: 'mould',
            meaningAr: 'يشكّل / يؤثر في تكوين',
          }),
          Object.freeze({
            word: 'conceive',
            meaningAr: 'يتصوّر / يدرك',
          }),
          Object.freeze({
            word: 'linguistic relativity',
            meaningAr: 'النسبية اللغوية',
          }),
        ]),

        references: Object.freeze([
          Object.freeze({
            expression: 'this theory',
            refersToAr:
              'الفكرة القائلة إن الإنويت يدركون الثلج بطريقة مختلفة بسبب كثرة الكلمات المستخدمة لوصفه.',
          }),
          Object.freeze({
            expression: 'this concept',
            refersToAr:
              'فكرة أن اللغة قد تشكّل الطريقة التي يتصور بها الإنسان العالم.',
          }),
          Object.freeze({
            expression: 'this idea',
            refersToAr:
              'فكرة النسبية اللغوية أو فرضية Sapir-Whorf.',
          }),
        ]),

        evidence: Object.freeze([
          Object.freeze({
            skill: 'main_idea',
            sentence:
              'The key question though, isn’t really whether there are more words to describe frozen water so much as whether this implies that the languages spoken by the Inuit mould the way they conceive of the world.',
            reasonAr:
              'هذه الجملة تنقل الفقرة من مثال الثلج إلى السؤال المركزي الحقيقي: هل اللغة تشكّل إدراك العالم؟',
          }),
          Object.freeze({
            skill: 'writers_purpose',
            sentence:
              'This concept is referred to as linguistic relativity or, more famously, the Sapir-Whorf hypothesis.',
            reasonAr:
              'هنا يعرّف الكاتب المفهوم الذي كانت الفقرة تمهّد له.',
          }),
        ]),
      }),
    }),
  ]),
})

function getUnit1ReadingParagraph(paragraphId) {
  const cleanId = String(paragraphId || '')
    .trim()
    .toLowerCase()

  return (
    UNIT1_READING_PASSAGE.paragraphs.find(
      (paragraph) =>
        paragraph.id.toLowerCase() === cleanId,
    ) || null
  )
}

export {
  UNIT1_READING_PASSAGE,
  getUnit1ReadingParagraph,
}