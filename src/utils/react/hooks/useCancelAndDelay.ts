import React from 'react'
import { useCurrent } from 'src/utils/react/hooks'

type ApplyToOnlyOneFunction = { (fn: () => void, deps?: any[], extension?: number): void }
type UseCancelAndDelayFunction = {
  (extension?: number, _d?: undefined, _e?: undefined): (fn: () => void) => void
}

const isFirstArgExt = (fnOrExt?: (() => void) | number): fnOrExt is number | undefined =>
  typeof fnOrExt === 'undefined' || typeof fnOrExt === 'number'

/**
 * 複数回連続で call される関数に対して使用する。
 * 引数 fn について、 extension （ミリ秒）の分だけ、call を遅延する。
 * 遅延された fn が呼び出される前にさらに fn が呼び出されようとすると、過去の fn の call を中止する。
 */
const useCancelAndDelay: ApplyToOnlyOneFunction & UseCancelAndDelayFunction = (
  fnOrExt?: (() => void) | number,
  deps?: any[],
  extension = 200
) => {
  const timeoutId = React.useRef<number>()
  const fnRef = useCurrent(isFirstArgExt(fnOrExt) ? undefined : fnOrExt)
  const ext = isFirstArgExt(fnOrExt) ? fnOrExt || extension : extension

  const cancelAndDelay = React.useCallback(
    (fn: () => void) => {
      window.clearTimeout(timeoutId.current)
      timeoutId.current = window.setTimeout(() => {
        fn()
      }, ext)
    },
    [ext]
  )

  React.useEffect(
    () => {
      if (fnRef.current) {
        cancelAndDelay(fnRef.current)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps ? [cancelAndDelay, ...deps] : undefined
  )

  return (isFirstArgExt(fnOrExt) ? cancelAndDelay : undefined) as any
}

export default useCancelAndDelay
