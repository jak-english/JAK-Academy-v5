import {
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  RICH_TEXT_COLORS,
  RICH_TEXT_HIGHLIGHTS,
  RICH_TEXT_ROLES,
  RICH_TEXT_SIZES,
  createRichTextContent,
  isRichTextContent,
  richTextToPlainText,
} from '../../content/richTextSchema'

import {
  applyMarkToRange,
  clearMarksFromRange,
  updateRichTextFromPlainText,
} from '../../content/richTextOperations'

import './RichTextEditor.css'

const ROLE_TOOLS = {
  vocabulary: [
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
    ['Definition', RICH_TEXT_ROLES.DEFINITION],
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
  ],
  reading: [
    ['Pronoun', RICH_TEXT_ROLES.PRONOUN],
    ['Evidence', RICH_TEXT_ROLES.ANSWER_EVIDENCE],
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
  ],
  grammar: [
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
    ['Definition', RICH_TEXT_ROLES.DEFINITION],
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
    ['Evidence', RICH_TEXT_ROLES.ANSWER_EVIDENCE],
  ],
  writing: [
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
    ['Definition', RICH_TEXT_ROLES.DEFINITION],
  ],
  notes: [
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
    ['Definition', RICH_TEXT_ROLES.DEFINITION],
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
  ],
  general: [
    ['Key Word', RICH_TEXT_ROLES.KEY_WORD],
    ['Pronoun', RICH_TEXT_ROLES.PRONOUN],
    ['Evidence', RICH_TEXT_ROLES.ANSWER_EVIDENCE],
    ['Important', RICH_TEXT_ROLES.IMPORTANT],
    ['Definition', RICH_TEXT_ROLES.DEFINITION],
  ],
}

function normalizeMode(value) {
  const mode = String(value || '')
    .trim()
    .toLowerCase()

  return ROLE_TOOLS[mode]
    ? mode
    : 'general'
}

function getSegmentClassName(marks = {}) {
  const classes = ['lesson-rich-text__segment']

  if (marks.bold) {
    classes.push('lesson-rich-text__segment--bold')
  }

  if (marks.italic) {
    classes.push('lesson-rich-text__segment--italic')
  }

  if (marks.underline) {
    classes.push('lesson-rich-text__segment--underline')
  }

  if (marks.color && marks.color !== 'default') {
    classes.push(`lesson-rich-text__color--${marks.color}`)
  }

  if (marks.highlight && marks.highlight !== 'none') {
    classes.push(`lesson-rich-text__highlight--${marks.highlight}`)
  }

  if (marks.size && marks.size !== 'normal') {
    classes.push(`lesson-rich-text__size--${marks.size}`)
  }

  if (marks.role && marks.role !== 'none') {
    classes.push(`lesson-rich-text__role--${marks.role}`)
  }

  return classes.join(' ')
}

function getTextOffset(root, node, offset) {
  if (!root || !node) return 0

  const range = document.createRange()
  range.selectNodeContents(root)

  try {
    range.setEnd(node, offset)
  } catch {
    return 0
  }

  return range.toString().length
}

function getSelectionOffsets(root) {
  const selection = window.getSelection()

  if (!root || !selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  ) {
    return null
  }

  const start = getTextOffset(
    root,
    range.startContainer,
    range.startOffset,
  )

  const end = getTextOffset(
    root,
    range.endContainer,
    range.endOffset,
  )

  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  }
}

function findTextPosition(root, targetOffset) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
  )

  let remaining = Math.max(0, targetOffset)
  let node = walker.nextNode()

  while (node) {
    const length = node.textContent?.length || 0

    if (remaining <= length) {
      return {
        node,
        offset: remaining,
      }
    }

    remaining -= length
    node = walker.nextNode()
  }

  return {
    node: root,
    offset: root.childNodes.length,
  }
}

function restoreSelection(root, selectionRange) {
  if (!root || !selectionRange) return

  requestAnimationFrame(() => {
    const selection = window.getSelection()
    if (!selection) return

    const start = findTextPosition(
      root,
      selectionRange.start,
    )

    const end = findTextPosition(
      root,
      selectionRange.end,
    )

    const range = document.createRange()

    try {
      range.setStart(start.node, start.offset)
      range.setEnd(end.node, end.offset)
      selection.removeAllRanges()
      selection.addRange(range)
      root.focus()
    } catch {
      root.focus()
    }
  })
}

function RichTextEditor({
  value,
  onChange,
  label = 'Rich text',
  sectionType = 'general',
}) {
  const editorRef = useRef(null)

  const lastSelectionRef = useRef({
    start: 0,
    end: 0,
  })

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  })

  const mode = normalizeMode(sectionType)
  const roleTools = ROLE_TOOLS[mode]

  const richText = useMemo(
    () =>
      isRichTextContent(value)
        ? value
        : createRichTextContent(
            String(value || ''),
          ),
    [value],
  )

  const plainText = useMemo(
    () => richTextToPlainText(richText),
    [richText],
  )

  const hasSelection =
    selection.start !== selection.end

  function rememberSelection() {
    const nextSelection =
      getSelectionOffsets(editorRef.current)

    if (!nextSelection) return

    lastSelectionRef.current = nextSelection
    setSelection(nextSelection)
  }

  function applyMark(markName, markValue) {
    const activeSelection =
      lastSelectionRef.current

    if (
      activeSelection.start ===
      activeSelection.end
    ) {
      return
    }

    const nextValue = applyMarkToRange(
      richText,
      activeSelection.start,
      activeSelection.end,
      markName,
      markValue,
    )

    onChange?.(nextValue)

    lastSelectionRef.current =
      activeSelection

    setSelection(activeSelection)

    restoreSelection(
      editorRef.current,
      activeSelection,
    )
  }

  function clearFormatting() {
    const activeSelection =
      lastSelectionRef.current

    if (
      activeSelection.start ===
      activeSelection.end
    ) {
      return
    }

    const nextValue = clearMarksFromRange(
      richText,
      activeSelection.start,
      activeSelection.end,
    )

    onChange?.(nextValue)

    restoreSelection(
      editorRef.current,
      activeSelection,
    )
  }

  function handleInput() {
    const root = editorRef.current
    if (!root) return

    const currentSelection =
      getSelectionOffsets(root) ||
      lastSelectionRef.current

    const nextPlainText =
      root.innerText.replace(/\r/g, '')

    const nextValue =
      updateRichTextFromPlainText(
        richText,
        nextPlainText,
      )

    lastSelectionRef.current =
      currentSelection

    setSelection(currentSelection)
    onChange?.(nextValue)

    restoreSelection(
      root,
      currentSelection,
    )
  }

  return (
    <div className={`jak-rich-editor jak-rich-editor--${mode}`}>
      <div className="jak-rich-editor__topbar">
        <div>
          <span className="jak-rich-editor__eyebrow">
            JAK Professional Editor
          </span>

          <strong>{label}</strong>
        </div>

        <span className="jak-rich-editor__mode">
          {mode.toUpperCase()}
        </span>

        <span
          className={`jak-rich-editor__selection ${
            hasSelection
              ? 'jak-rich-editor__selection--active'
              : ''
          }`}
        >
          {hasSelection
            ? `${selection.end - selection.start} characters selected`
            : 'Select text to format'}
        </span>
      </div>

      <div
        className="jak-rich-editor__toolbar"
        onMouseDown={rememberSelection}
      >
        <div className="jak-rich-editor__tool-group">
          <button
            type="button"
            disabled={!hasSelection}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyMark('bold', true)}
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            disabled={!hasSelection}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyMark('italic', true)}
          >
            <em>I</em>
          </button>

          <button
            type="button"
            disabled={!hasSelection}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyMark('underline', true)}
          >
            <u>U</u>
          </button>
        </div>

        <div className="jak-rich-editor__tool-group">
          <label>
            Size
            <select
              disabled={!hasSelection}
              defaultValue={RICH_TEXT_SIZES.NORMAL}
              onMouseDown={rememberSelection}
              onChange={(event) => {
                applyMark('size', event.target.value)
                event.target.value = RICH_TEXT_SIZES.NORMAL
              }}
            >
              <option value={RICH_TEXT_SIZES.NORMAL}>Normal</option>
              <option value={RICH_TEXT_SIZES.LARGE}>Large</option>
              <option value={RICH_TEXT_SIZES.XL}>XL</option>
            </select>
          </label>

          <label>
            Text
            <select
              disabled={!hasSelection}
              defaultValue={RICH_TEXT_COLORS.DEFAULT}
              onMouseDown={rememberSelection}
              onChange={(event) => {
                applyMark('color', event.target.value)
                event.target.value = RICH_TEXT_COLORS.DEFAULT
              }}
            >
              <option value={RICH_TEXT_COLORS.DEFAULT}>Default</option>
              <option value={RICH_TEXT_COLORS.NAVY}>Navy</option>
              <option value={RICH_TEXT_COLORS.GOLD}>Gold</option>
              <option value={RICH_TEXT_COLORS.RED}>Red</option>
              <option value={RICH_TEXT_COLORS.GREEN}>Green</option>
              <option value={RICH_TEXT_COLORS.PURPLE}>Purple</option>
            </select>
          </label>

          <label>
            Highlight
            <select
              disabled={!hasSelection}
              defaultValue={RICH_TEXT_HIGHLIGHTS.NONE}
              onMouseDown={rememberSelection}
              onChange={(event) => {
                applyMark('highlight', event.target.value)
                event.target.value = RICH_TEXT_HIGHLIGHTS.NONE
              }}
            >
              <option value={RICH_TEXT_HIGHLIGHTS.NONE}>None</option>
              <option value={RICH_TEXT_HIGHLIGHTS.YELLOW}>Yellow</option>
              <option value={RICH_TEXT_HIGHLIGHTS.GREEN}>Green</option>
              <option value={RICH_TEXT_HIGHLIGHTS.BLUE}>Blue</option>
              <option value={RICH_TEXT_HIGHLIGHTS.PINK}>Pink</option>
            </select>
          </label>
        </div>

        <div className="jak-rich-editor__tool-group jak-rich-editor__tool-group--roles">
          {roleTools.map(([toolLabel, roleValue]) => (
            <button
              key={roleValue}
              type="button"
              disabled={!hasSelection}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyMark('role', roleValue)}
            >
              {toolLabel}
            </button>
          ))}
        </div>

        <button
          className="jak-rich-editor__clear"
          type="button"
          disabled={!hasSelection}
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearFormatting}
        >
          Clear formatting
        </button>
      </div>

      <div
        ref={editorRef}
        className="jak-rich-editor__surface"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        spellCheck="true"
        onInput={handleInput}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onFocus={rememberSelection}
      >
        {richText.segments.map((segment, index) => (
          <span
            key={`editor-segment-${index}`}
            className={getSegmentClassName(
              segment?.marks || {},
            )}
          >
            {segment?.text || ''}
          </span>
        ))}
      </div>

      <div className="jak-rich-editor__footer">
        <span>Characters: {plainText.length}</span>
        <span>Active lesson mode: {mode}</span>
      </div>
    </div>
  )
}

export default RichTextEditor

