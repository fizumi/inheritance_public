import React, { useRef, useCallback, useMemo } from 'react'
import useControlled from 'src/utils/react/hooks/useControlled'
import { function as F } from 'fp-ts'
import * as R from 'ramda'

const getValue = (e: React.ChangeEvent<HTMLInputElement>) => e.target.value
const getValueFromNullable = (e?: React.ChangeEvent<HTMLInputElement> | null) =>
  e ? e.target.value : ''
const newValueIsNotEmpty = (newValue: string) => newValue !== ''

export default function useInputText(useControlledProps: {
  controlled: string | undefined
  default: string
  name: string
  state: string
}) {
  const inputRef = useRef<HTMLInputElement>()
  const [inputValue, setInputValue] = useControlled<string>(useControlledProps)

  const inputIsChanged = useCallback((newValue: string) => inputValue !== newValue, [inputValue])

  const getAndSetInputValue = F.flow(getValue, R.tap(R.when(inputIsChanged, setInputValue)))

  const clear = () => setInputValue('')

  const getAndClearInputValue = F.flow(getValue, R.tap(R.when(newValueIsNotEmpty, clear)))

  const isEmpty = inputValue === ''
  const isNotEmpty = useMemo(() => !isEmpty, [isEmpty])

  const inputUtils = {
    getValue,
    getValueFromNullable,
    inputIsChanged,
    newValueIsNotEmpty,
    input: {
      isEmpty,
      isNotEmpty,
    },
    dispatcher: {
      getAndSetInputValue,
      getAndClearInputValue,
      clear,
    },
  }
  return {
    ref: inputRef,
    state: [inputValue, setInputValue],
    utils: inputUtils,
  } as const
}
