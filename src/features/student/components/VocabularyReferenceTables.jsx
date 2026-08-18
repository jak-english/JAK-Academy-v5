import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getStudentVocabularyCatalog,
} from '../services/studentLessonService'

const GROUP_CONFIG = {
  core_words: {
    title: 'Core Words',
    subtitle: 'الكلمات الأساسية',
    background:
      'rgba(167, 243, 208, 0.18)',
    border:
      'rgba(167, 243, 208, 0.48)',
  },

  fixed_expressions: {
    title: 'Fixed Expressions',
    subtitle: 'التعبيرات الثابتة',
    background:
      'rgba(221, 214, 254, 0.18)',
    border:
      'rgba(221, 214, 254, 0.48)',
  },

  additional_personality_adjectives: {
    title: 'Additional Personality Adjectives',
    subtitle: 'صفات شخصية إضافية',
    background:
      'rgba(186, 230, 253, 0.16)',
    border:
      'rgba(186, 230, 253, 0.42)',
  },

  words_definitions: {
    title: 'Words & Definitions',
    subtitle: 'كلمات وتعريفات',
    background:
      'rgba(254, 215, 170, 0.16)',
    border:
      'rgba(254, 215, 170, 0.42)',
  },

  core_word: {
    title: 'Core Words',
    subtitle: 'الكلمات الأساسية',
    background:
      'rgba(167, 243, 208, 0.18)',
    border:
      'rgba(167, 243, 208, 0.48)',
  },

  fixed_expression: {
    title: 'Fixed Expressions',
    subtitle: 'التعبيرات الثابتة',
    background:
      'rgba(167, 243, 208, 0.14)',
    border:
      'rgba(167, 243, 208, 0.42)',
  },

  word_family: {
    title: 'Word Families',
    subtitle: 'عائلات الكلمات',
    background:
      'rgba(254, 215, 170, 0.14)',
    border:
      'rgba(254, 215, 170, 0.42)',
  },

  compound_adjective: {
    title: 'Compound Adjectives',
    subtitle: 'الصفات المركبة',
    background:
      'rgba(221, 214, 254, 0.14)',
    border:
      'rgba(221, 214, 254, 0.42)',
  },

  idiom: {
    title: 'Idioms',
    subtitle: 'التعبيرات الاصطلاحية',
    background:
      'rgba(251, 207, 232, 0.14)',
    border:
      'rgba(251, 207, 232, 0.42)',
  },

  synonym_antonym: {
    title: 'Synonyms & Antonyms',
    subtitle: 'المرادفات والأضداد',
    background:
      'rgba(254, 240, 138, 0.13)',
    border:
      'rgba(254, 240, 138, 0.38)',
  },

  collocation: {
    title: 'Collocations',
    subtitle: 'المتلازمات اللفظية',
    background:
      'rgba(153, 246, 228, 0.13)',
    border:
      'rgba(153, 246, 228, 0.38)',
  },

  phrasal_verb: {
    title: 'Phrasal Verbs',
    subtitle: 'الأفعال المركبة',
    background:
      'rgba(253, 186, 116, 0.13)',
    border:
      'rgba(253, 186, 116, 0.38)',
  },
}

function getGroupConfig(itemType) {
  return (
    GROUP_CONFIG[itemType] || {
      title: itemType
        ?.replaceAll('_', ' ')
        ?.replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        ) || 'Vocabulary',
      subtitle: 'مفردات الدرس',
      background:
        'rgba(226, 232, 240, 0.12)',
      border:
        'rgba(226, 232, 240, 0.30)',
    }
  )
}

function VocabularyReferenceTables({
  lessonId,
}) {
  const [catalog, setCatalog] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadCatalog() {
      if (!lessonId) {
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getStudentVocabularyCatalog(
            lessonId,
          )

        if (isMounted) {
          setCatalog(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل مفردات الدرس.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      isMounted = false
    }
  }, [lessonId])

  const groups = useMemo(() => {
    const result = new Map()

    for (const item of catalog?.items ?? []) {
      const sectionKey =
        item?.extra_json?.section_key

      const key =
        sectionKey ||
        item.item_type ||
        'other'

      if (!result.has(key)) {
        result.set(key, [])
      }

      result.get(key).push(item)
    }

    return Array.from(result.entries())
  }, [catalog])

  if (isLoading) {
    return (
      <section
        style={{
          padding: '28px',
          textAlign: 'center',
        }}
      >
        جارٍ تحميل مفردات الدرس...
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section
        style={{
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <p role="alert">
          {errorMessage}
        </p>
      </section>
    )
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <section
      style={{
        display: 'grid',
        gap: '28px',
        marginTop: '34px',
        direction: 'rtl',
      }}
    >
      <header
        style={{
          padding: '4px 4px 10px',
        }}
      >
        <p
          style={{
            margin: '0 0 5px',
            opacity: 0.65,
            fontWeight: 800,
          }}
        >
          Vocabulary Reference
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: '30px',
          }}
        >
          مفردات الدرس
        </h2>

        <p
          style={{
            margin: '8px 0 0',
            opacity: 0.65,
          }}
        >
          الكلمات والتعبيرات المطلوبة
          مرتبة حسب نوعها.
        </p>
      </header>

      {groups.map(
        ([itemType, items]) => {
          const config =
            getGroupConfig(itemType)

          return (
            <article
              key={itemType}
              style={{
                overflow: 'hidden',
                borderRadius: '20px',
                border:
                  `1px solid ${config.border}`,
                background:
                  `linear-gradient(180deg, ${config.background}, rgba(4, 20, 35, 0.90) 48%, rgba(4, 20, 35, 0.97))`,
                boxShadow:
                  '0 14px 38px rgba(0, 0, 0, 0.18)',
              }}
            >
              <header
                style={{
                  padding: '17px 22px',
                  background:
                    config.background,
              color: '#f8fafc',
                  borderBottom:
                    `1px solid ${config.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3
                      dir="ltr"
                      style={{
                        margin: 0,
                        fontSize: '21px',
                        textAlign: 'left',
                      }}
                    >
                      {config.title}
                    </h3>

                    <p
                      style={{
                        margin: '4px 0 0',
                        opacity: 0.7,
                      }}
                    >
                      {config.subtitle}
                    </p>
                  </div>

                  <strong
                    style={{
                      padding:
                        '6px 12px',
                      borderRadius: '999px',
                      border:
                        `1px solid ${config.border}`,
                      background:
                        'rgba(255,255,255,0.04)',
                    }}
                  >
                    {items.length}
                  </strong>
                </div>
              </header>

              <div
                style={{
                  overflowX: 'auto',
                  padding: '8px 18px 18px',
                  background:
                    `linear-gradient(180deg, ${config.background}, rgba(4, 20, 35, 0.10) 55%, transparent 100%)`,
                  boxShadow:
                    `inset 0 1px 0 ${config.border}`,
                }}
              >
                {itemType === 'word_families' ? (
                  <table
                    style={{
                      width: '100%',
                      minWidth: '780px',
                      borderCollapse:
                        'separate',
                      borderSpacing: 0,
                    }}
                  >
                    <thead style={{ background: config.background, color: '#f8fafc' }}>
                      <tr>
                        <th
                          dir="ltr"
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'left',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Adjective
                        </th>

                        <th
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'right',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          معنى الصفة
                        </th>

                        <th
                          dir="ltr"
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'left',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Noun
                        </th>

                        <th
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'right',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          معنى الاسم
                        </th>

                        <th
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'center',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Mastery
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td
                            dir="ltr"
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'left',
                              fontWeight: 900,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.term}
                          </td>

                          <td
                            style={{
                              padding:
                                '16px 12px',
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.meaning_ar || '—'}
                          </td>

                          <td
                            dir="ltr"
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'left',
                              fontWeight: 800,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.extra_json
                              ?.noun_form || '—'}
                          </td>

                          <td
                            style={{
                              padding:
                                '16px 12px',
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.extra_json
                              ?.noun_meaning_ar ||
                              '—'}
                          </td>

                          <td
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'center',
                              fontWeight: 900,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                minWidth: '62px',
                                padding:
                                  '6px 10px',
                                borderRadius:
                                  '999px',
                                background:
                                  'rgba(254, 215, 170, 0.10)',
                                border:
                                  '1px solid rgba(254, 215, 170, 0.28)',
                              }}
                            >
                              {item.mastery_score ??
                                0}
                              %
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table
                    style={{
                      width: '100%',
                      minWidth: '720px',
                      borderCollapse:
                        'separate',
                      borderSpacing: 0,
                    }}
                  >
                    <thead style={{ background: config.background, color: '#f8fafc' }}>
                      <tr>
                        <th
                          dir="ltr"
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'left',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Word
                        </th>

                        <th
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'right',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          المعنى
                        </th>

                        <th
                          dir="ltr"
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'left',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Part of Speech
                        </th>

                        <th
                          dir="ltr"
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'left',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Definition
                        </th>

                        <th
                          style={{
                            padding:
                              '16px 12px',
                            textAlign: 'center',
                            opacity: 0.96,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          Mastery
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td
                            dir="ltr"
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'left',
                              fontWeight: 900,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.term}
                          </td>

                          <td
                            style={{
                              padding:
                                '16px 12px',
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.meaning_ar ||
                              '—'}
                          </td>

                          <td
                            dir="ltr"
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'left',
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.part_of_speech ||
                              '—'}
                          </td>

                          <td
                            dir="ltr"
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'left',
                              lineHeight: 1.7,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {item.definition_en ||
                              '—'}
                          </td>

                          <td
                            style={{
                              padding:
                                '16px 12px',
                              textAlign: 'center',
                              fontWeight: 900,
                              borderBottom:
                                '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                minWidth: '62px',
                                padding:
                                  '6px 10px',
                                borderRadius:
                                  '999px',
                                background:
                                  'rgba(167, 243, 208, 0.10)',
                                border:
                                  '1px solid rgba(167, 243, 208, 0.28)',
                              }}
                            >
                              {item.mastery_score ??
                                0}
                              %
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </article>
          )
        },
      )}
    </section>
  )
}

export default VocabularyReferenceTables
