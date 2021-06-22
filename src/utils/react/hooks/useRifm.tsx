import * as tb from 'ts-toolbelt'
import * as React from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
import useEventCallback from './useEventCallback'
import {
  removeAt,
  insertChar,
  acceptOnly,
  extractNumberWithoutLeadingZeros,
  splitByFirst,
  extractNumbers,
  normalizeJpEra,
  pipe,
  setMyDebugMethodToConsole,
} from 'src/utils/common'

setMyDebugMethodToConsole()
const _flow = 'rifm flow'
const _debug = 'rifm debug'
// console.setKey(_flow)
// console.setKey(_debug)

const summarizeInputInfo = (
  value: string,
  originalValue: string,
  cursorPosition: number,
  isDeleleteButtonDown: boolean,
  isBackspaceButtonDown: boolean
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (originalValue === value) {
      console.error('please return before calling this function if originalValue === value') // prettier-ignore
    }
  }
  const isSizeIncreaseOperation = originalValue.length < value.length
  const isSizeDecreaseOperation = !isSizeIncreaseOperation
  let isAcceptCharInputted: boolean | undefined
  let isIntact: boolean | undefined
  let isAcceptCharRemovedByKey: boolean | undefined
  return {
    value,
    eventValue: value,
    originalValue,
    cursorPosition,
    isSizeIncreaseOperation,
    isSizeDecreaseOperation,
    isBackspaceButtonDown,
    isDeleleteButtonDown,
    isBackspaceOrDelete: isBackspaceButtonDown || isDeleleteButtonDown,
    isAcceptCharInputted,
    isIntact,
    isAcceptCharRemovedByKey,
  } as const
}
export type InputInfo = tb.O.Writable<
  ReturnType<typeof summarizeInputInfo>,
  'value' | 'cursorPosition' | 'isAcceptCharInputted' | 'isIntact' | 'isAcceptCharRemovedByKey'
>

type RifmProps<E extends HTMLInputElement = HTMLInputElement> = {
  value: string
  format: (infoOrValue: InputInfo) => InputInfo
} & (
  | {
      onChange: (value: string) => void
      passValue: true
    }
  | {
      onChange: (e: React.ChangeEvent<E>) => void
      passValue?: false
    }
)

interface RifmReturn<E> {
  value: string
  onChange: React.ChangeEventHandler<E>
}

/*
  flow

  1. rifm onChange -> set valueRef -> refresh
  2. render user component -> render useRifm -> return valueRef.current.value
  3. useIsomorphicLayoutEffect -> clear valueRef -> format & calculate cursor position ->
      props.onChange(formatted value) -> refresh -> set clean up
  4. render user component -> render useRifm -> return props.value(formatted value)
  5. clean up (change cursor position)
  6. useIsomorphicLayoutEffect -> skip
*/
const useRifm = <E extends HTMLInputElement = HTMLInputElement>(
  props: RifmProps<E>
): RifmReturn<E> => {
  console.condlog(_flow, '2. or 4. render useRifm', props.value)
  const [, refresh] = React.useReducer((c) => c + 1, 0)
  const eventRef = React.useRef<React.ChangeEvent<E> | null>(null)

  const isDeleleteButtonDownRef = React.useRef(false)
  const isBackspaceButtonDownRef = React.useRef(false)

  const onChange: React.ChangeEventHandler<E> = useEventCallback((evt) => {
    console.condlog(_flow, '1. rifm onChange')
    if (process.env.NODE_ENV !== 'production') {
      if (evt.target.type === 'number') {
        console.error('Rifm does not support input type=number, use type=tel instead.')
        return
      }
      if (evt.target.type === 'date') {
        console.error('Rifm does not support input type=date.')
        return
      }
    }

    eventRef.current = evt

    refresh()
  })

  useIsomorphicLayoutEffect(() => {
    if (eventRef.current == null) {
      console.condlog(_flow, '6. skip')
      return
    }
    console.condlog(_flow, '3. useIsomorphicLayoutEffect') // prettier-ignore

    const event = eventRef.current
    const input = eventRef.current.target
    eventRef.current = null

    if (props.value === input.value) {
      console.condlog(_flow, 'nothing has changed (props.value === input.value)') // prettier-ignore
      return
    }
    const cursorPosition = input.selectionStart
    if (cursorPosition === null) {
      console.condlog(_flow, 'cursorPosition === null') // prettier-ignore
      return
    }
    let info = summarizeInputInfo(
      input.value,
      props.value,
      cursorPosition,
      isDeleleteButtonDownRef.current,
      isBackspaceButtonDownRef.current
    )

    info = props.format(info)
    event.target.value = info.value
    if (props.passValue) {
      props.onChange(info.value)
    } else {
      props.onChange(event)
    }
    refresh() // string に変化がないと rerender が発生しないため, 強制的に render

    // clean up (props.onChange 後, cursor 位置がズレるので, 調整する)
    return () => {
      console.condlog(_flow, '5. clean up') // prettier-ignore
      if (info.cursorPosition === null) return
      console.before(_debug, '[tweak cursor position]', info.cursorPosition)
      input.selectionStart = input.selectionEnd = info.cursorPosition
      console.after(_debug, info.cursorPosition)
    }
  })

  // Delete が押されているかどうかの情報を isDeleleteButtonDownRef.current に入力するための useEffect
  React.useEffect(() => {
    // until https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType will be supported
    // by all major browsers (now supported by: +chrome, +safari, ?edge, !firefox)
    // there is no way I found to distinguish in onChange
    // backspace or delete was called in some situations
    // firefox track https://bugzilla.mozilla.org/show_bug.cgi?id=1447239
    // copy & paste を使われると, 文字数減少だけで Backspace かどうかを判定できないので念のため backspace も追加
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.code === 'Delete') {
        isDeleleteButtonDownRef.current = true
      }
      if (evt.code === 'Backspace') {
        isBackspaceButtonDownRef.current = true
      }
    }

    const handleKeyUp = (evt: KeyboardEvent) => {
      if (evt.code === 'Delete') {
        isDeleleteButtonDownRef.current = false
      }
      if (evt.code === 'Backspace') {
        isBackspaceButtonDownRef.current = false
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return {
    value: eventRef.current != null ? eventRef.current.target.value : props.value,
    onChange,
  }
}
export default useRifm

export const Rifm = <E extends HTMLInputElement = HTMLInputElement>(
  props: RifmProps<E> & {
    children: (args: RifmReturn<E>) => JSX.Element
  }
): JSX.Element => {
  const renderProps = useRifm<E>(props)

  return props.children(renderProps)
}

export const MASK_USER_INPUT_SYMBOL = '_'

export const printWithCursor = (i: Pick<InputInfo, 'value' | 'cursorPosition'>) =>
  insertChar(i.value, '|', i.cursorPosition)

export type InputInfoPipable = (i: InputInfo) => InputInfo

/**
 * clean 関数を使って InputInfo を編集する関数を作成する.
 * clean 関数によって削除された文字を考慮した, カーソル位置の移動等も行う.
 * @param clean 許容しない文字（ delimiter を含む）を除去する関数
 */
export const createCleaner =
  (clean: (str: string) => string) =>
  (i: InputInfo): InputInfo => {
    console.before(_debug, '[clean]', printWithCursor(i))

    const strBeforeCursor = i.value.slice(0, i.cursorPosition)
    const deleteCountBeforeCursor = strBeforeCursor.length - clean(strBeforeCursor).length

    const cleanedValue = clean(i.value)
    const cleanedOriginal = clean(i.originalValue)

    i.value = cleanedValue
    i.cursorPosition = i.cursorPosition - deleteCountBeforeCursor
    i.isAcceptCharInputted = cleanedValue.length > cleanedOriginal.length
    i.isIntact = cleanedValue.length === cleanedOriginal.length
    i.isAcceptCharRemovedByKey = !i.isIntact && i.isBackspaceOrDelete

    console.after(_debug, printWithCursor(i))
    return i
  }

// clean対象でない文字が入力された場合, 上書きモードのような振る舞いにする
export const ifAcceptCharHasInputtedThenOverwrite = (i: InputInfo) => {
  if (i.isAcceptCharInputted) {
    console.before(_debug, '[ifAcceptCharHasInputtedThenOverwrite]', printWithCursor(i)) // prettier-ignore
    i.value = removeAt(i.cursorPosition)(i.value)
    console.after(_debug, printWithCursor(i))
  }
  return i
}

// clean対象でない文字が, backspace or delete によって消去された場合, “_” を挿入
export const ifAcceptCharHasRemovedThenInsert =
  (maskChar = MASK_USER_INPUT_SYMBOL) =>
  (i: InputInfo) => {
    if (i.isAcceptCharRemovedByKey && i.value.length !== 0) {
      // ※ cleanedValue.length !== 0 の時は全データ消去時であるため, 文字を追加しない
      console.before(_debug, '[ifAcceptCharHasRemovedThenInsert]', printWithCursor(i)) // prettier-ignore
      i.value = insertChar(i.value, maskChar, i.cursorPosition)
      console.after(_debug, printWithCursor(i))
    }
    return i
  }

/**
 * @param mask 例) '____/__/__'
 * @param append 例) if true 202110 -> 2021/10/, if false 202110 -> 2021/10
 */
export const createFormatter =
  (mask: string, append = true) =>
  (i: InputInfo): InputInfo => {
    let valueIdx = 0

    console.before(_debug, '[createFormatter]', printWithCursor(i))
    i.value = mask
      .split('')
      .map((maskChar, maskIdx) => {
        if (valueIdx > i.value.length - (append ? 0 : 1)) {
          return ''
        }

        // pick value
        if (maskChar === MASK_USER_INPUT_SYMBOL) {
          return i.value[valueIdx++]
        }

        // set delimiter & tweak cursor
        // ※ 「delimiter挿入」と「カーソル移動」は同一関数内で行った方が挙動を理解しやすいと考えた
        // 19911|0 -> 1991/1|0 (delimiter追加分, 右に移動)
        if (maskIdx < i.cursorPosition) {
          i.cursorPosition++
        }
        // 1991|/10 -> 1991/|10 ( "/" を跨いで右に移動)
        if (maskIdx === i.cursorPosition && (i.isAcceptCharInputted || i.isDeleleteButtonDown)) {
          i.cursorPosition++
        }
        return maskChar
      })
      .join('')
    console.after(_debug, printWithCursor(i))
    return i
  }

/*
    DateWithMask
*/
export const dateWithMaskFormatter = pipe(
  createCleaner(acceptOnly(/[\d_]/g)),
  ifAcceptCharHasInputtedThenOverwrite,
  ifAcceptCharHasRemovedThenInsert('_'),
  createFormatter('____/__/__')
)

/*
    JapaneseDateWithMask
*/
/**
 * 元号に対して, backspace or delete が使用された場合, “_” を挿入し, clean関数によって数値部分の先頭が削除されるのを防止する
 */
const preventCleanerFromRemovingFirstNumber = (i: InputInfo) => {
  if (i.isBackspaceOrDelete && i.cursorPosition === 0 && i.value.length >= 2) {
    console.before(_debug, '[preventRemovingFirstNumber]', printWithCursor(i))
    i.value = insertChar(i.value, MASK_USER_INPUT_SYMBOL, i.cursorPosition)
    console.after(_debug, printWithCursor(i))
  }
  return i
}

export const japaneseDateWithMaskFormatter = pipe(
  preventCleanerFromRemovingFirstNumber,
  createCleaner((s: string) => {
    if (!s) return ''

    const _ = MASK_USER_INPUT_SYMBOL
    const [maybeGengou, maybeNumbers] = splitAt1(s)

    // 元号
    const normalizedGengou = normalizeJpEra(maybeGengou)
    const gengou = maybeGengou === _ ? _ : normalizedGengou

    // 数値
    const numbers = acceptOnly(/[\d_]/g)(maybeNumbers)

    return gengou + numbers
  }),
  ifAcceptCharHasInputtedThenOverwrite,
  ifAcceptCharHasRemovedThenInsert('_'),
  createFormatter('___.__.__') // 日本 (JIS X 0301)
)

// test(splitAt1('H3/1/1')).toEqual(['H','3/1/1'])
const splitAt1 = (s: string): [string, string] => {
  const [first, ...tail] = s.split('')
  return [first, tail.join('')]
}

/*
    Number
*/
const fixCursorPositionWhenInitialCharInputIsNonAcceptableNumber: InputInfoPipable = (i) => {
  if (
    i.isSizeIncreaseOperation &&
    i.cursorPosition === 1 &&
    i.value.length >= 2 // not accept '01', but do '0'
  ) {
    if (extractNumbers(i.value[0]).length === 0 || i.value[0] === '0') {
      i.cursorPosition = 0
    }
  }
  return i
}
export const numberFormatter = pipe(
  fixCursorPositionWhenInitialCharInputIsNonAcceptableNumber,
  createCleaner((s: string) => {
    if (s === '') return s // accept empty string
    return extractNumberWithoutLeadingZeros(s)
  })
)

/*
    Fraction
*/
const replaceSlashPosition: InputInfoPipable = (i) => {
  const originalSlashIndex = i.originalValue.indexOf('/')
  const newSlashIndex = i.cursorPosition - 1
  if (i.isSizeIncreaseOperation && i.value[newSlashIndex] === '/' && originalSlashIndex !== -1) {
    if (originalSlashIndex < newSlashIndex) {
      i.value = i.value.replace('/', '')
      i.cursorPosition--
    } else {
      i.value = i.value.replace(/\//g, '')
      i.value = insertChar(i.value, '/', i.cursorPosition - 1)
    }
  }
  return i
}

export const fractionFormatter = pipe(
  fixCursorPositionWhenInitialCharInputIsNonAcceptableNumber,
  replaceSlashPosition,
  createCleaner((s: string) => {
    if (!s) return ''

    if (s.indexOf('/') === -1) return extractNumberWithoutLeadingZeros(s)

    const [dividend, divisor] = splitByFirst('/')(s).map(extractNumberWithoutLeadingZeros)

    const forceGreaterThanZero = (s: string) => {
      const num = Number(s)
      return num > 0 ? String(num) : ''
    }

    return dividend + '/' + forceGreaterThanZero(divisor)
  })
)
