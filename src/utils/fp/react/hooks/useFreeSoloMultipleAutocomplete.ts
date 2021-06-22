/* eslint-disable no-constant-condition */
import * as React from 'react'
import tb from 'ts-toolbelt'
import {
  useControlled,
  useBooleanState,
  useEventCallback,
  useSyncCallBack,
} from 'src/utils/react/hooks/index'
import useInputText from 'src/utils/fp/react/hooks/useInputText'

import { unstable_useId as useId } from '@material-ui/core/utils'
import * as R from 'ramda'
import { function as F } from 'fp-ts'
import { getValueIfThunk } from 'src/utils/fp/common/function'
import useRestrictConsecutiveCalls from 'src/utils/react/hooks/useRestrictConsecutiveCalls'

/**
 * constants
 */
const NO_SEQ_KEYBOARD_NAVI = -1 // not reachable via sequential keyboard navigation
const NOT_HIGHLITED = -1
const NOT_FOUND = -1

/**
 * utils
 */
export type Pred<Opt> = (value: Opt, index: number) => boolean
export const myCreateFilterOptions = <Opt>(
  preds: Pred<Opt>[]
): {
  addPred: (p: Pred<Opt>) => void
  filter: FilterOption<Opt>
} => {
  const _preds = [...preds]
  return {
    addPred: function (p) {
      _preds.push(p)
      return this
    },
    filter: (options, { inputValue, getOptionLabel }) => {
      const labelIs = (p: (label: string) => boolean) => F.flow(getOptionLabel, p)
      const labelIncludeInputValue: Pred<Opt> = labelIs(
        R.isEmpty(inputValue) ? F.constant(true) : R.includes(inputValue)
      )
      const labelIsNotEmpty: Pred<Opt> = labelIs(R.complement(R.equals('')))
      return options.filter(R.allPass([labelIncludeInputValue, labelIsNotEmpty, ..._preds]))
    },
  }
}

const existTabindex = (el: Element | null) => !!el && el.hasAttribute('tabindex')
const isDisabled = (el: (Element & { disabled: boolean }) | null) =>
  el?.disabled || el?.getAttribute('aria-disabled') === 'true'
const shouldSkip: (el: (Element & { disabled: boolean }) | null) => boolean = R.anyPass([
  R.not,
  R.complement(existTabindex),
  isDisabled,
])
// 引数の index の option が disabled の時、
// direction に基づいて一つずらす。
// ずらした先の option について、同様の処理を行う。
const shiftIndexTo = (d: Direction) => (currentIndex: number) =>
  currentIndex + (d === 'next' ? 1 : -1)
const shiftToNotDisabledIndex = (
  index: number,
  direction: Direction,
  listLength: number,
  elementHavingList: Element,
  attributeHavingIndex: string
) => {
  let nextFocus = index
  while (true) {
    // Out of range
    if (
      (direction === 'next' && nextFocus === listLength) ||
      (direction === 'previous' && nextFocus === -1)
    ) {
      return NOT_HIGHLITED
    }

    const item = elementHavingList.querySelector<Element & { disabled: boolean }>(
      `[${attributeHavingIndex}="${nextFocus}"]`
    )

    // c.f. MenuList.js
    if (shouldSkip(item)) {
      // Move to the next element.
      nextFocus = shiftIndexTo(direction)(nextFocus)
    } else {
      return nextFocus
    }
  }
}

/**
 * 指定した方向（direction）にある有効な（Disableになっていない等）element の index を返却する。
 */
const validIndex = (
  index: number,
  direction: Direction,
  listLength: number,
  elementHavingList: Element | undefined,
  attributeHavingIndex: string
) => {
  if (!elementHavingList || index === NOT_HIGHLITED) {
    return NOT_HIGHLITED
  }
  return shiftToNotDisabledIndex(
    index,
    direction,
    listLength,
    elementHavingList,
    attributeHavingIndex
  )
}

// ([box, descEl]: [ Element, HTMLElement ])
const scrollIntoView = (box: Element, descEl: HTMLElement) => {
  // Logic copied from https://www.w3.org/TR/wai-aria-practices/examples/listbox/js/listbox.js
  // Consider this API instead once it has a better browser support:
  // .scrollIntoView({ scrollMode: 'if-needed', block: 'nearest' });
  if (box.scrollHeight > box.clientHeight) {
    const element = descEl

    const scrollBottom = box.clientHeight + box.scrollTop
    const elementBottom = element.offsetTop + element.offsetHeight
    if (elementBottom > scrollBottom) {
      box.scrollTop = elementBottom - box.clientHeight
    } else if (element.offsetTop - element.offsetHeight * 0 < box.scrollTop) {
      box.scrollTop = element.offsetTop - element.offsetHeight * 0
    }
  }
}

/**
 *  useOption
 */
type ListBox = Element & { querySelector: tb.F.Function; parentElement: Element }
type EventOrElement =
  | { currentTarget: { getAttribute: tb.F.Function } }
  | { getAttribute: tb.F.Function; [x: string]: any }
export const DATA_OPTION_ID = 'data-option'
export const getID = (e: EventOrElement) => (e?.currentTarget || e).getAttribute(DATA_OPTION_ID)
export const DATA_OPTION_INDEX = 'data-option-index'
export const getIndex = (e: { currentTarget: { getAttribute: tb.F.Function } }) =>
  Number(e.currentTarget.getAttribute(DATA_OPTION_INDEX))
export const getOptionElement = (lbox: ListBox | undefined, index: number) =>
  lbox?.querySelector<HTMLOptionElement>(`[${DATA_OPTION_INDEX}="${index}"]`)

const getIndexByCommand = (diff: DiffCommands, defaultIndex: number, finalIndex: number) => {
  switch (diff) {
    case 'reset':
      return defaultIndex
    case 'start':
      return 0
    case 'end':
      return finalIndex
  }
}
const getIndexByNumber = (
  diff: number,
  currentIndex: number,
  finalIndex: number,
  disableListWrap: boolean
) => {
  const newIndex = currentIndex + diff

  // list wrap move
  if (newIndex < 0) {
    if (disableListWrap && currentIndex !== -1) {
      return 0
    }
    return finalIndex
  }
  if (finalIndex < newIndex) {
    if (disableListWrap) {
      return finalIndex
    }
    return 0
  }

  // 0 <= newIndex && newIndex <= finalIndex
  return newIndex
}
const getNextIndex = (
  currentIndex: number,
  diff: DiffCommands | number,
  arrayLength: number,
  defaultIndex: number,
  disableListWrap: boolean
) => {
  const finalIndex = arrayLength - 1
  return typeof diff === 'string'
    ? getIndexByCommand(diff, defaultIndex, finalIndex)
    : getIndexByNumber(diff, currentIndex, finalIndex, disableListWrap)
}

/**
 * useTag
 */
const DATA_TAG_INDEX = 'data-tag-index'

/**
 * types
 */
export type OnChangeParams<Option> =
  | {
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
      options: []
      reason: 'clear'
    }
  | {
      event: React.MouseEvent | React.KeyboardEvent
      options: Option[]
      reason: 'select-option' | 'remove-option'
      option: Option
      optionIndex?: number
    }
// | {
//     event: React.KeyboardEvent
//     options: Option[]
//     reason: 'create-option'
//     option: Option
//   }

type DiffCommands = 'reset' | 'start' | 'end'
type Direction = 'next' | 'previous'
export type AutocompleteHighlightChangeReason = 'keyboard' | 'mouse' | 'auto'
export type AutocompleteInputChangeReason = 'input' | 'clear' | 'reset'
export type AutocompleteChangeReason = 'select-option' | 'remove-option' | 'clear' // 'create-option' |
// | 'blur'
export interface AutocompleteChangeDetails {
  option: string
}
export type AutocompleteCloseReason =
  | 'toggleInput'
  | 'escape'
  | 'select-option'
  | 'remove-option'
  | 'blur'

type AutocompleteSelectReason = 'select-option' //| 'create-option'

export const defaultFilterOptions = <Option>(
  options: Option[],
  {
    inputValue,
    getOptionLabel,
  }: {
    inputValue: string
    getOptionLabel: (option: Option) => string
  }
): Option[] =>
  options.filter((option) => {
    const candidate = (JSON.stringify || getOptionLabel)(option)
    return candidate.indexOf(inputValue) > -1
  })

// Number of options to jump in list box when pageup and pagedown keys are used.
const pageSize = 5

export interface UseFreeSoloMultipleAutocompleteProps<Option> {
  id?: string
  /**
   * popup を開いた時に filterOptions prop に渡される
   * thunk を渡すことで popup を開いたときに ref から最新の情報を取得することが出来る
   */
  options: Option[] | (() => Option[]) // ★必須

  optionSelector: (ids: readonly string[]) => (option: Option) => boolean // 追加 ★必須
  idSelector: (option: Option) => string // 追加 ★必須
  equalOption?: (option1: Option) => (option2: Option) => boolean
  componentName?: string

  /*
    コンポーネントには、制御可能な2つの状態があります:
    1. 「value / onChange」。 ユーザーが選択した値。
    2. 「inputValue / onInputChange」。テキストボックスに表示される値。
  */
  inputValue?: string
  onInputChange?: (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>
      | null,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void

  /** 何が選択されているか，という状態 */
  selectedIDs: readonly string[] // ★必須 Option -> ID に変更
  onChange?: (param: OnChangeParams<Option>) => void
  // onChange?: (
  //   event: React.KeyboardEvent | React.MouseEvent,
  //   values: Option[],
  //   reason?: AutocompleteChangeReason,
  //   option?: Option
  // ) => void

  /**
   * @argument options options ﾌﾟﾛｯﾌﾟがそのまま渡される。
   * @argument params getOptionLabel は getOptionLabel ﾌﾟﾛｯﾌﾟが使われる。
   */
  filterOptions?: (
    options: Option[],
    params: {
      inputValue: string
      getOptionLabel: (option: Option) => string
    }
  ) => Option[]

  /*
    boolean
  */
  // key入力関係
  handleHomeEndKeys?: boolean
  disableListWrap?: boolean
  disableClearOnBlur?: boolean // 元: clearOnBlur
  openOnFocus?: boolean
  closeOnSelect?: boolean // 元: disableCloseOnSelect
  // state 周りの追加Props
  open?: boolean
  onOpen?: (event: any) => void
  onClose?: (event: any, reason: AutocompleteCloseReason) => void

  /** filterOptions prop に渡される */ getOptionLabel:
    | ((option: Option) => string)
    | (Option extends string ? undefined : never) // option が string の場合、undefined を許容
  getOptionDisabled?: (option: Option) => boolean

  /*
    【注：自作・独自】
  */
  // createNewOption: ((inputValue: string) => Option) | (Option extends string ? undefined : never) // 必須
  openOnMount?: boolean
  disableResetOnSelect?: boolean
  prefElement?: () => { focus: () => void }
  nextElement?: () => { focus: () => void }
}

/**
 * 下記の props が渡された想定で src を書き換えている
 * freeSolo=true
 * multiple=true
 * options
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useFreeSoloMultipleAutocomplete<Option>(
  props: UseFreeSoloMultipleAutocompleteProps<Option>
) {
  const {
    id: idProp,
    options: optionsProp,
    optionSelector,
    idSelector,
    equalOption = (o1) => (o2) => o1 === o2,
    componentName = 'useAutocomplete',
    inputValue: inputValueProp,
    onInputChange,
    selectedIDs: valueProp, //[valueProp]という名称は流用元の名残
    onChange,

    filterOptions = defaultFilterOptions, // https://material-ui.com/components/autocomplete/#advanced
    open: openProp,
    onOpen,
    onClose,
    closeOnSelect = false, // 元： disableCloseOnSelect
    handleHomeEndKeys = false,
    disableListWrap = false,
    disableClearOnBlur = false, // 元： clearOnBlur
    openOnFocus = false,

    getOptionLabel: getOptionLabelProp,
    getOptionDisabled,
    // createNewOption: createNewOptionProp,

    // 独自
    openOnMount = false,
    disableResetOnSelect = false,
    prefElement,
    nextElement,
  } = props

  /*
      prop or default
  */
  const getOptionLabel = (getOptionLabelProp ? getOptionLabelProp : (x: string) => x) as (
    option: Option
  ) => string

  // const createNewOption = (createNewOptionProp ? createNewOptionProp : (x: string) => x) as (
  //   option: string
  // ) => Option

  // const id = useId(idProp)
  const id = idProp

  // focus
  const [focused, setFocused] = React.useState(false)

  // [default] <ul>
  const listboxRef = React.useRef<ListBox>()

  // [default] <div> (root element)
  const [anchorEl, setAnchorEl] = React.useState<Element>()

  // Tag とは、選択した option (Chilp).
  const NOT_FOCUSED = -1
  const [focusedTag, setFocusedTag] = React.useState(NOT_FOCUSED)
  const focusTag = F.flow(
    R.tap(setFocusedTag as (idx: number) => void),
    useEventCallback((tagToFocus: number) => {
      if (tagToFocus === NOT_FOCUSED && inputRef.current) {
        inputRef.current.focus()
      } else {
        anchorEl
          ?.querySelector<Element & { focus: () => void }>(`[${DATA_TAG_INDEX}="${tagToFocus}"]`)
          ?.focus()
      }
    })
  )

  // 選択中（hover中）の option をハイライトさせる
  const DEFAULT_HIGHLIGHTED_INDEX = -1
  const highlightedIndexRef = React.useRef(DEFAULT_HIGHLIGHTED_INDEX)

  // options の変更を render 毎に取り込むため、useMemo でメモ化しない
  // また、deps array に加えられていたとしても、結局 selectedOptions.length しで判定しているので、メモ化する必要性は getSelectedOptions の計算をスキップする意味くらいしかない
  const getSelectedOptions = () => getValueIfThunk(optionsProp).filter(optionSelector(valueProp))
  const selectedOptions = getSelectedOptions()
  // useControlled は現状不要
  // const [selectedOptions, setSelectedValues] = useControlled({
  //   controlled: selectedOptions_,
  //   default: [] as Option[],
  //   name: componentName,
  // })

  const handleSelectedOptions = (params: OnChangeParams<Option>) => {
    if (
      params.options.length === selectedOptions.length &&
      selectedOptions.every(R.includes(R.__, params.options))
    ) {
      return
    }
    console.condlog('Autocomplete', 'handleSelectedOptions', { params })
    onChange?.(params)
    // setSelectedValues(params.options)
  }

  const {
    ref: inputRef,
    state: [inputValue],
    utils: IU,
  } = useInputText({
    controlled: inputValueProp,
    default: '',
    name: componentName,
    state: 'inputValue',
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.condlog('Autocomplete', 'handleInputChange')
    const changeInput = (newValue: string) => onInputChange?.(event, newValue, 'input')

    F.pipe(
      event,
      IU.dispatcher.getAndSetInputValue,
      R.tap(R.when(IU.inputIsChanged, changeInput)),
      R.when(IU.newValueIsNotEmpty, () => handleOpen(event))
    )
  }

  const resetInputValue = useEventCallback((event?: React.ChangeEvent<HTMLInputElement>) => {
    console.condlog('Autocomplete', 'resetInputValue')
    onInputChange?.(event || null, '', 'reset')

    F.pipe(
      event,
      IU.getValueFromNullable,
      R.when(R.anyPass([IU.newValueIsNotEmpty, F.constant(!event)]), IU.dispatcher.clear)
    )
  })

  const handleClear = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.condlog('Autocomplete', 'handleClear')
    IU.dispatcher.clear()
    onInputChange?.(event, '', 'clear')
    handleSelectedOptions({ event, options: [], reason: 'clear' })
  }

  React.useEffect(() => {
    if (disableResetOnSelect) return
    resetInputValue()
  }, [valueProp, resetInputValue, disableResetOnSelect])

  const {
    state: [popupOpen],
    utils: { dispatcher: popupIsOpen },
  } = useBooleanState({
    controlled: openProp,
    default: openOnMount,
    name: componentName,
    state: 'popupOpen',
  })

  // 稀に発生する onFocus: handleFocus と onMouseDown: handleInputMouseDown の連続呼出しを防止する
  const debounce = useRestrictConsecutiveCalls()

  const handleOpen = debounce((e: any) => {
    popupIsOpen.setTrue()
    onOpen?.(e)
  })
  const handleClose = debounce((e: any, r: AutocompleteCloseReason) => {
    popupIsOpen.setFalse()
    onClose?.(e, r)
  })

  const filteredOptions = popupOpen
    ? filterOptions(
        getValueIfThunk(optionsProp),
        // we use the empty string to manipulate `defaultFilterOptions` to not filter any options
        // i.e. the filter predicate always returns true
        { inputValue: inputValue, getOptionLabel }
      )
    : []
  // console.log({ filteredOptions })

  const listboxAvailable = popupOpen && filteredOptions.length > 0

  // Ensure the focusedTag is never inconsistent
  React.useEffect(() => {
    if (focusedTag >= selectedOptions.length) {
      focusTag(NOT_FOCUSED)
    }
  }, [selectedOptions, focusedTag, focusTag, NOT_FOCUSED])

  /**
   * popup options において、どの index がハイライトされているかを設定する。
   * DOM を直接編集する。deps から分からるように、setState は用いていない。
   */
  const setHighlightedIndex = useEventCallback(
    React.useCallback(
      ({
        index,
        reason = 'auto',
      }: {
        index: number
        reason?: AutocompleteHighlightChangeReason
      }) => {
        console.log('setHighlightedIndex called')
        // ハイライトされているオプションのインデックスを保存
        highlightedIndexRef.current = index

        // 'aria-activedescendant' Attribute 除去・設定
        if (index === NOT_HIGHLITED) {
          inputRef.current?.removeAttribute('aria-activedescendant')
        } else {
          inputRef.current?.setAttribute('aria-activedescendant', makeOptionID(id, index))
        }

        // 前回のフォーカス情報を除去
        if (!listboxRef.current) return
        const prev = listboxRef.current.querySelector('[data-focus]')
        if (prev) {
          prev.removeAttribute('data-focus')
          prev.classList.remove('Mui-focusVisible')
        }

        // index が NOT_HIGHLITED に指定された場合スクロールをトップに戻して抜ける。
        const listboxNode = listboxRef.current?.parentElement.querySelector('[role="listbox"]') // 基本 listboxNode = listboxRef.current
        if (!listboxNode) return // "No results"
        if (index === NOT_HIGHLITED) {
          listboxNode.scrollTop = 0
          return
        }

        // 指定された index に 'data-focus' Attribute を設定
        const option = getOptionElement(listboxRef.current, index)
        if (!option) return
        option.setAttribute('data-focus', 'true')

        if (reason === 'keyboard') {
          option.classList.add('Mui-focusVisible')
        }

        // 子要素に自動スクロール
        if (reason !== 'mouse') {
          scrollIntoView(listboxNode, option)
        }
      },
      [id, inputRef]
    )
  )

  /**
   * 最終的に setHighlightedIndex を呼び出す。
   * 事前にハイライトする index が分からない場合に使用する。
   */
  const changeHighlightedIndex = useEventCallback(
    ({
      diff,
      direction = 'next',
      reason = 'auto',
    }: {
      diff: DiffCommands | number
      reason?: AutocompleteHighlightChangeReason
      direction?: Direction
      event?: any // 一応残しておく
    }) => {
      if (!popupOpen) {
        return
      }

      F.pipe(
        getNextIndex(
          highlightedIndexRef.current,
          diff,
          filteredOptions.length,
          DEFAULT_HIGHLIGHTED_INDEX,
          disableListWrap
        ),
        R.partialRight(validIndex, [
          direction,
          filteredOptions.length,
          listboxRef.current,
          DATA_OPTION_INDEX,
        ]),
        (nextIndex) => ({ index: nextIndex, reason }),
        setHighlightedIndex
      )
    }
  )

  const syncHighlightedIndex = useSyncCallBack(
    () => {
      console.log('syncHighlightedIndex called')
      if (!popupOpen) {
        return
      }

      const initialSelectedValue = selectedOptions[0]

      // The popup is empty, reset
      if (filteredOptions.length === 0 || initialSelectedValue == null) {
        console.log('syncHighlightedIndex, The popup is empty')
        changeHighlightedIndex({ diff: 'reset' }) // defaultIndex
        return
      }

      if (!listboxRef.current) {
        console.log('syncHighlightedIndex, exit because of !listboxRef.current')
        return
      }

      // 自分で追加
      // if (highlightedIndexRef.current !== NOT_HIGHLITED) {
      //   console.log('syncHighlightedIndex, scroll to highlightedIndexRef.current')
      //   setHighlightedIndex({ index: highlightedIndexRef.current })
      //   return
      // }

      // Synchronize the value with the highlighted index
      if (initialSelectedValue != null) {
        // 意図不明につきコメントアウト （これがあると選択されているOptionにフォーカスが移動しないが、これは望む動作ではない）
        // const currentHighlightedOption = filteredOptions[highlightedIndexRef.current]

        // Keep the current highlighted index if possible
        // const currentHighlightedOptionExistsInSelectedValues: boolean =
        //   !!currentHighlightedOption &&
        //   selectedOptions.every(R.partial(equalOption, [currentHighlightedOption]))
        // if (currentHighlightedOptionExistsInSelectedValues) {
        //   console.log('syncHighlightedIndex currentHighlightedOptionExistsInSelectedValues', { 'highlightedIndexRef.current': highlightedIndexRef.current, currentHighlightedOption, selectedOptions, }) // prettier-ignore
        //   return
        // }

        const initialSelectedValueIndexInFilteredOptions = R.findIndex(
          equalOption(initialSelectedValue),
          filteredOptions
        )

        if (initialSelectedValueIndexInFilteredOptions === NOT_FOUND) {
          changeHighlightedIndex({ diff: 'reset' })
        } else {
          setHighlightedIndex({
            index: initialSelectedValueIndexInFilteredOptions,
          })
        }
        console.log('syncHighlightedIndex initialSelectedValue != null end')
        return
      }

      // Prevent the highlighted index to leak outside the boundaries.
      // highlightedIndexRef.current >= filteredOptions.length である状況は
      // setHighlightedIndexに至るまでのロジック的にないと思うが一応ということか。
      if (highlightedIndexRef.current >= filteredOptions.length - 1) {
        console.error('ここには入らないはず')
        setHighlightedIndex({ index: filteredOptions.length - 1 })
        return
      }

      // Restore the focus to the previous index.
      setHighlightedIndex({ index: highlightedIndexRef.current })
    },
    // Don't sync filteredOptions (and  getOptionSelected, selectedValues)
    //  not to break the scroll position
    [
      popupOpen,
      // Only sync the highlighted index when the option switch between empty and not
      // eslint-disable-next-line react-hooks/exhaustive-deps
      filteredOptions.length === 0,
      setHighlightedIndex,
      changeHighlightedIndex,
    ]
  )

  // useEffect 以外で onMount な event callback を使う方法: ref prop を利用する
  const handleListboxRef = useEventCallback((node) => {
    listboxRef.current = node
    if (!node) return

    syncHighlightedIndex()
  })

  const selectNewValue = (
    event: any,
    option: Option,
    reasonProp: AutocompleteSelectReason,
    optionIndex: number,
    origin: 'input' | 'options' = 'options'
  ) => {
    // 選択した option が selectedOptions 内で重複したらエラー
    if (process.env.NODE_ENV !== 'production') {
      const matches = selectedOptions.filter(equalOption(option))

      if (matches.length > 1) {
        console.error(
          [
            `Material-UI: stringhe \`getOptionSelected\` method of ${componentName} do not handle the arguments correctly.`,
            `The component expects a single value to match a given option but found ${matches.length} matches.`,
          ].join('\n')
        )
      }
    }

    const itemIndex = R.findIndex(equalOption(option), selectedOptions)

    let reason: AutocompleteSelectReason | 'remove-option' = reasonProp
    const newSelectedOptions = [...selectedOptions]
    // selected or created
    if (itemIndex === NOT_FOUND) {
      newSelectedOptions.push(option)
    }
    // 再選択されたら削除
    else if (origin === 'options') {
      newSelectedOptions.splice(itemIndex, 1)
      reason = 'remove-option'
    }

    if (!disableResetOnSelect) {
      resetInputValue(event)
    }

    handleSelectedOptions({ event, options: newSelectedOptions, reason, option, optionIndex })
    if (closeOnSelect && !event.ctrlKey && !event.metaKey) {
      handleClose(event, reason)
    }
  }

  const handleFocusTag = (event: React.KeyboardEvent<Element>, direction: Direction) => {
    const selectionStart = inputRef?.current?.selectionStart
    const tagIsFocused = focusedTag !== NOT_FOCUSED
    const goingToFocusLastTag = !tagIsFocused && selectionStart === 0 && direction === 'previous'
    console.condlog('Autocomplete', { goingToFocusLastTag })
    if (!goingToFocusLastTag && !tagIsFocused) return

    let nextTag = goingToFocusLastTag
      ? selectedOptions.length - 1
      : F.pipe(
          focusedTag,
          shiftIndexTo(direction),
          R.max<number>(0),
          R.when(R.equals(selectedOptions.length), () => NOT_FOCUSED)
        )

    nextTag = validIndex(nextTag, direction, selectedOptions.length, anchorEl, DATA_TAG_INDEX)

    nextTag !== NOT_FOCUSED && handleClose(event, 'toggleInput')

    focusTag(nextTag)
  }

  const handleKeyDown =
    (other: { onKeyDown?: React.KeyboardEventHandler }) => (event: React.KeyboardEvent) => {
      if (focusedTag !== NOT_FOCUSED && R.not(R.includes(event.key, ['ArrowLeft', 'ArrowRight']))) {
        focusTag(NOT_FOCUSED)
      }

      // https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/key/Key_Values
      const switchKey: Record<string, () => void | true> = {
        Home: () => {
          if (popupOpen && handleHomeEndKeys) {
            // Prevent scroll of the page
            event.preventDefault()
            changeHighlightedIndex({
              diff: 'start',
              direction: 'next',
              event,
            })
          }
        },
        End: () => {
          if (popupOpen && handleHomeEndKeys) {
            // Prevent scroll of the page
            event.preventDefault()
            changeHighlightedIndex({
              diff: 'end',
              direction: 'previous',
              event,
            })
          }
        },
        PageUp: () => {
          // Prevent scroll of the page
          event.preventDefault()
          changeHighlightedIndex({
            diff: -pageSize,
            direction: 'previous',
            event,
          })
          handleOpen(event)
        },
        PageDown: () => {
          // Prevent scroll of the page
          event.preventDefault()
          changeHighlightedIndex({
            diff: pageSize,
            direction: 'next',
            event,
          })
          handleOpen(event)
        },
        ArrowDown: () => {
          // Prevent cursor move
          event.preventDefault()
          changeHighlightedIndex({
            diff: 1,
            direction: 'next',
            event,
          })
          handleOpen(event)
        },
        ArrowUp: () => {
          // Prevent cursor move
          event.preventDefault()
          changeHighlightedIndex({
            diff: -1,
            direction: 'previous',
            event,
          })
          handleOpen(event)
        },
        ArrowLeft: () => {
          handleFocusTag(event, 'previous')
        },
        ArrowRight: () => {
          handleFocusTag(event, 'next')
        },
        Enter: () => {
          // popup 内の option を選択して Enter
          if (highlightedIndexRef.current !== NOT_HIGHLITED && popupOpen) {
            const option = filteredOptions[highlightedIndexRef.current]
            const disabled = getOptionDisabled ? getOptionDisabled(option) : false

            // Avoid early form validation, let the end-users continue filling the form.
            event.preventDefault()
            if (disabled) return

            selectNewValue(event, option, 'select-option', highlightedIndexRef.current)
          }
          // // input に入力して Enter
          // else if (inputValue !== '') {
          //   // Allow people to add new values before they submit the form.
          //   event.preventDefault()
          //   selectNewValue(event, createNewOption(inputValue), 'create-option', 'input')
          // }
          // inputValue が空の場合
          else {
            if (event.shiftKey) {
              prefElement?.()?.focus()
            } else {
              nextElement?.()?.focus()
            }
          }
          return
        },
        Escape: () => {
          if (popupOpen) {
            // Avoid Opera to exit fullscreen mode.
            event.preventDefault()
            // Avoid the Modal to handle the event.
            event.stopPropagation()
            handleClose(event, 'escape')
          }
        },
        Backspace: () => {
          console.condlog('Autocomplete', 'Backspace')
          if (IU.input.isEmpty && selectedOptions.length > 0) {
            const removeIndex = focusedTag === NOT_FOCUSED ? selectedOptions.length - 1 : focusedTag
            handleSelectedOptions({
              event,
              options: R.remove(removeIndex, 1, selectedOptions),
              reason: 'remove-option',
              option: selectedOptions[removeIndex],
            })
          }
        },
        Delete: () => {
          if (focusedTag !== NOT_FOCUSED && selectedOptions.length > 0) {
            handleSelectedOptions({
              event,
              options: R.remove(focusedTag, 1, selectedOptions),
              reason: 'remove-option',
              option: selectedOptions[focusedTag],
            })
          }
        },
      }
      // Wait until IME is settled.
      if (event.which !== 229) {
        if (switchKey[event.key]?.()) return
      }

      if (other.onKeyDown) {
        other.onKeyDown(event)
      }
    }
  // Prevent input blur when interacting with the combobox
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.currentTarget.getAttribute('id') !== id) {
      event.preventDefault()
    }
  }

  // Focus the input when interacting with the combobox
  const handleClick = () => {
    inputRef.current?.focus()
  }

  const handleFocus = (e: any) => {
    setFocused(true)
    if (openOnFocus) {
      handleOpen(e)
    }
  }

  // const mouseIsInside = React.useRef(false)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // if (mouseIsInside.current) return

    console.condlog('Autocomplete', 'handleBlur')
    // Ignore the event when using the scrollbar with IE 11
    if (
      listboxRef.current !== null &&
      listboxRef.current?.parentElement.contains(document.activeElement)
    ) {
      // inputRef.current?.focus()
      console.condlog('Autocomplete', 'skip handleBlur')
      return
    }

    setFocused(false)

    handleClose(e, 'blur')

    if (!disableClearOnBlur) {
      console.condlog('Autocomplete', 'clearOnBlur')
      resetInputValue()
    }
  }

  const handleOptionMouseOver = (event: React.MouseEvent) => {
    setHighlightedIndex({
      index: getIndex(event),
      reason: 'mouse',
    })
  }

  const handleOptionClick = (event: React.MouseEvent) => {
    const index = getIndex(event)
    console.condlog('Autocomplete', 'handleOptionClick', { index })
    selectNewValue(event, filteredOptions[index], 'select-option', index)
  }

  const handleTagDelete =
    (index: number): React.EventHandler<any> =>
    (event) => {
      const newSelectedOptions = selectedOptions.slice()
      newSelectedOptions.splice(index, 1)
      handleSelectedOptions({
        event,
        options: newSelectedOptions,
        reason: 'remove-option',
        option: selectedOptions[index],
      })
    }

  const handlePopupIndicator = (
    e: React.MouseEvent<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.condlog('Autocomplete', 'handlePopupIndicator')
    if (popupOpen) {
      handleClose(e, 'toggleInput')
    } else {
      handleOpen(e)
    }
  }

  const handleInputMouseDown = (
    e: React.MouseEvent<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (IU.input.isEmpty || !popupOpen) {
      handlePopupIndicator(e)
    }
  }

  const dirty = inputValue.length > 0 || selectedOptions.length > 0

  const groupedOptions = filteredOptions

  return {
    getRootProps: (other: { onKeyDown?: React.KeyboardEventHandler } = {}) => ({
      'aria-owns': listboxAvailable ? `${id}-listbox` : undefined,
      role: 'combobox', // WAI-ARIA
      'aria-expanded': listboxAvailable,
      ...other,
      onKeyDown: handleKeyDown(other),
      onMouseDown: handleMouseDown,
      onClick: handleClick,
    }),
    getInputLabelProps: () => ({
      id: `${id}-label`,
      htmlFor: id,
    }),
    getInputProps: () => ({
      id,
      value: inputValue,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onChange: handleInputChange,
      onMouseDown: handleInputMouseDown,
      // if open then this is handled imperativeley so don't let react override
      // only have an opinion about this when closed
      'aria-activedescendant': popupOpen ? '' : undefined,
      'aria-autocomplete': false ? ('both' as const) : ('list' as const),
      'aria-controls': listboxAvailable ? `${id}-listbox` : undefined,
      // Disable browser's suggestion that might overlap with the popup.
      // Handle autocomplete but not autofill.
      autoComplete: 'off',
      ref: inputRef,
      autoCapitalize: 'none',
      spellCheck: 'false' as const,
    }),
    getClearProps: () => ({
      tabIndex: NO_SEQ_KEYBOARD_NAVI,
      onClick: handleClear,
    }),
    getPopupIndicatorProps: () => ({
      tabIndex: NO_SEQ_KEYBOARD_NAVI,
      onClick: handlePopupIndicator,
    }),
    getTagProps: (index: number) => ({
      [DATA_TAG_INDEX]: index,
      tabIndex: NO_SEQ_KEYBOARD_NAVI,
      onDelete: handleTagDelete(index),
    }),
    getListboxProps: () => ({
      role: 'listbox',
      id: `${id}-listbox`,
      'aria-labelledby': `${id}-label`,
      ref: handleListboxRef,
      onMouseDown: (event: React.MouseEvent) => {
        // Prevent blur
        // if (mouseIsInside.current) {
        event.preventDefault()
        // }
      },
      // onMouseEnter: () => {
      //   console.log('onMouseEnter')
      //   mouseIsInside.current = true
      // },
      // onMouseLeave: () => {
      //   console.log('onMouseLeave')
      //   mouseIsInside.current = false
      // },
    }),
    getOptionProps: ({ index, option }: { index: number; option: Option }) => {
      const selected = selectedOptions.some((value) => value != null && equalOption(option)(value))
      const disabled = getOptionDisabled ? getOptionDisabled(option) : false

      return {
        key: index,
        tabIndex: NO_SEQ_KEYBOARD_NAVI,
        role: 'option',
        id: makeOptionID(id, index),
        onMouseOver: handleOptionMouseOver,
        onClick: handleOptionClick,
        [DATA_OPTION_INDEX]: index,
        [DATA_OPTION_ID]: idSelector(option),
        'aria-disabled': disabled,
        'aria-selected': selected,
      }
    },
    id,
    inputValue,
    selectedOptions,
    dirty,
    popupOpen,
    focused: focused || focusedTag !== NOT_FOCUSED,
    anchorEl,
    setAnchorEl,
    focusedTag,
    groupedOptions,
  }
}

export interface CreateFilterOptionsConfig<Option> {
  ignoreAccents?: boolean
  ignoreCase?: boolean
  limit?: number
  matchFrom?: 'any' | 'start'
  stringify?: (option: Option) => string
  trim?: boolean
}

export interface FilterOptionsState<Option> {
  inputValue: string
  getOptionLabel: (option: Option) => string
}

export type FilterOption<Option> = (
  options: Option[],
  state: FilterOptionsState<Option>
) => Option[]

export function createFilterOptions<Option>(
  config: CreateFilterOptionsConfig<Option> = {}
): FilterOption<Option> {
  const {
    ignoreAccents = true,
    ignoreCase = true,
    limit,
    matchFrom = 'any',
    stringify,
    trim = false,
  } = config

  return (options, { inputValue, getOptionLabel }) => {
    let input = trim ? inputValue.trim() : inputValue
    if (ignoreCase) {
      input = input.toLowerCase()
    }
    if (ignoreAccents) {
      input = stripDiacritics(input)
    }

    const filteredOptions = options.filter((option) => {
      let candidate = (stringify || getOptionLabel)(option)
      if (ignoreCase) {
        candidate = candidate.toLowerCase()
      }
      if (ignoreAccents) {
        candidate = stripDiacritics(candidate)
      }

      return matchFrom === 'start' ? candidate.indexOf(input) === 0 : candidate.indexOf(input) > -1
    })

    return typeof limit === 'number' ? filteredOptions.slice(0, limit) : filteredOptions
  }
}

// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
// Give up on IE11 support for this feature
function stripDiacritics(string: string) {
  return typeof string.normalize !== 'undefined'
    ? string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : string
}

export const makeOptionID = (id: string | undefined, index: string | number) =>
  `${id}-option-${index}`
