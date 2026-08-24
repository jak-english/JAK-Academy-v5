import './Unit1RemainingSkillsNotes.css'

const compoundPatterns = [
  ['adjective + adjective', 'red-hot', 'صفة + صفة'],
  ['adverb + adjective', 'hard-working / forward-looking', 'حال + صفة'],
  ['noun + adjective', 'lifelong / world-famous', 'اسم + صفة'],
  ['adjective + noun', 'full-time / cutting-edge', 'صفة + اسم'],
  ['adjective + gerund', 'good-looking', 'صفة + ing'],
  ['adverb + past participle', 'highly strung', 'حال + التصريف الثالث'],
  ['noun + gerund', 'eye-catching', 'اسم + ing'],
  ['noun + past participle', 'olive oil-based', 'اسم + التصريف الثالث'],
  ['prefix + adjective', 'underconfident / overcooked', 'بادئة + صفة'],
]

const checkingPhrases = [
  'To put it another way …',
  'In other words …',
  'If I’m hearing you correctly …',
  'So you’re saying (that) …',
  'Let me get this straight …',
]

const summarisingPhrases = [
  'Essentially, …',
  'Simply put, …',
  'In a nutshell, …',
  'So, what it boils down to is that …',
]

const listeningSignals = [
  ['Use a phrase that indicates something important.', 'استخدام عبارة تدل على أن النقطة مهمة.'],
  ['Use a rhetorical question.', 'استخدام سؤال بلاغي.'],
  ['Repeat key words.', 'تكرار الكلمات المفتاحية.'],
  ['Paraphrase to emphasise a point.', 'إعادة صياغة الفكرة للتأكيد عليها.'],
  ['Slow down the pace to emphasise a key point.', 'إبطاء سرعة الكلام عند النقطة المهمة.'],
]

function Unit1RemainingSkillsNotes() {
  return (
    <section className="u1-notes" aria-labelledby="u1-notes-title">
      <header className="u1-notes__hero">
        <p className="u1-notes__eyebrow">UNIT 1 · REMAINING SKILLS</p>
        <h2 id="u1-notes-title">Remaining Skills & Notes</h2>
        <p>المهارات المتبقية من الوحدة الأولى — من كتاب الطالب الرسمي</p>
      </header>

      <article className="u1-notes__card">
        <div className="u1-notes__tag">Lesson 1A · Active Vocabulary</div>
        <h3>Compound Adjectives</h3>
        <p className="u1-notes__lead">
          A compound adjective is made up of more than one word, but describes a single idea.
        </p>
        <p className="u1-notes__ar">
          الصفة المركبة تتكوّن من أكثر من كلمة، لكنها تعبّر عن فكرة وصفية واحدة.
        </p>

        <div className="u1-notes__table-wrap">
          <table className="u1-notes__table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Book example</th>
                <th>المعنى التركيبي</th>
              </tr>
            </thead>
            <tbody>
              {compoundPatterns.map(([pattern, example, ar]) => (
                <tr key={pattern}>
                  <td>{pattern}</td>
                  <td>{example}</td>
                  <td>{ar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="u1-notes__card">
        <div className="u1-notes__tag">Lesson 2A · Speaking</div>
        <h3>Paraphrasing What You Hear</h3>

        <div className="u1-notes__two-col">
          <div>
            <h4>Checking understanding</h4>
            <p className="u1-notes__ar">عبارات للتأكد أنك فهمت كلام المتحدث بشكل صحيح.</p>
            <ul>
              {checkingPhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
            </ul>
          </div>

          <div>
            <h4>Summarising</h4>
            <p className="u1-notes__ar">عبارات لتلخيص الفكرة الأساسية باختصار.</p>
            <ul>
              {summarisingPhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
            </ul>
          </div>
        </div>
      </article>

      <article className="u1-notes__card">
        <div className="u1-notes__tag">Lesson 3A · Pronunciation</div>
        <h3>Syllables with the Main Stress</h3>
        <p className="u1-notes__lead">
          Listen for the syllable that carries the main stress in a word.
        </p>
        <p className="u1-notes__ar">
          ركّز على المقطع الذي يحمل النبر الرئيسي في الكلمة. هذا هو المطلوب في نشاط النطق في Lesson 3A.
        </p>
        <div className="u1-notes__tip">
          <strong>Study tip:</strong> قل الكلمة ببطء، قسّمها إلى مقاطع، ثم حدّد المقطع الأوضح والأقوى في النطق.
        </div>
      </article>

      <article className="u1-notes__card">
        <div className="u1-notes__tag">Lesson 3A · Active Listening</div>
        <h3>Understanding the Main Points of Complex Talks</h3>
        <p className="u1-notes__ar">
          عندما يريد المتحدث إبراز نقطة رئيسية، يعطيك إشارات تساعدك على التقاطها.
        </p>

        <div className="u1-notes__signals">
          {listeningSignals.map(([en, ar], index) => (
            <div className="u1-notes__signal" key={en}>
              <span>{index + 1}</span>
              <div>
                <strong>{en}</strong>
                <p>{ar}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default Unit1RemainingSkillsNotes
