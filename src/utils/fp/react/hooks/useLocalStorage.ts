// import React from 'react'
import { either as E, function as F } from 'fp-ts'
import * as J from 'fp-ts/Json'
import { useCancelAndDelay, useLifecycles, useCurrent } from 'src/utils/react/hooks'
import { getLocalStorageJson, Validator } from 'src/utils/fp/web'
import { removeItem, setItem } from 'fp-ts-local-storage' // https://github.com/gcanti/fp-ts-local-storage/blob/e7842a49b0ccb8784089f7ed8f6a9c9bb2a8f8ac/src/index.ts
import { _remove_me_v3 } from 'src/utils/fp/common'

type CommonProps<V> = {
  key: string
  value: V
}
type CommonOption<V> = {
  removeWhen?: (value: V) => boolean
  onSetOrRemoveError?: (error: unknown) => any
}
type PropsWithValidator<E, V> = CommonProps<V> & {
  validator: Validator<E, V>
  setValue: (value: V) => any
  option?: CommonOption<V> & {
    onGetItemError?: (e: E | Error) => void
  }
}
type PropsWithoutValidator<V> = CommonProps<V> & {
  setValue: (value: J.Json) => any
  option?: CommonOption<V> & {
    onGetItemError?: (e: Error) => void
  }
}
type Props<E, V> = CommonProps<V> & {
  setValue: (value: V | J.Json) => any
  validator?: Validator<E, V | J.Json>
  option?: CommonOption<V> & {
    onGetItemError?: (e: E | Error) => void
  }
}
const orVoid = F.constVoid as () => unknown

const useLocalStorage: {
  <E, V>(props: PropsWithValidator<E, V>): void
  <V>(props: PropsWithoutValidator<V>): void
} = <E, V>({
  key,
  value,
  setValue,
  validator,
  option: { onGetItemError, ...setOrRemove } = {},
}: Props<E, V>) => {
  // get
  useLifecycles({
    onDidMount: () => {
      F.pipe(
        getLocalStorageJson(key),
        validator ? E.chain(validator) : F.identity,
        E.map(setValue),
        E.mapLeft((e) => onGetItemError?.(e))
      )
    },
  })

  // set / remove
  const ref = useCurrent(setOrRemove)
  useCancelAndDelay(() => {
    const { removeWhen, onSetOrRemoveError } = ref.current
    if (removeWhen?.(value)) {
      F.pipe(E.tryCatchK(removeItem(key), onSetOrRemoveError || orVoid))
      return
    }
    F.pipe(
      value,
      J.stringify,
      E.chain((strValue) => E.tryCatch(setItem(key, strValue), _remove_me_v3)),
      E.mapLeft(onSetOrRemoveError || orVoid)
    )
  }, [value])
}

export default useLocalStorage
