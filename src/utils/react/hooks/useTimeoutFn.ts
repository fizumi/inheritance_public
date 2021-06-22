// https://github.com/streamich/react-use/blob/481943247131f71086266228d7876a36fbf68c5f/src/useTimeoutFn.ts#L5
import { useCallback, useEffect, useRef } from 'react'

export type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void]

export default function useTimeoutFn(
  fn: (...any: any[]) => any,
  ms = 0,
  setOnMount = true
): UseTimeoutFnReturn {
  const ready = useRef<boolean | null>(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const callback = useRef(fn)

  const isReady = useCallback(() => ready.current, [])

  const set = useCallback(() => {
    ready.current = false
    timeout.current && clearTimeout(timeout.current)

    timeout.current = setTimeout(() => {
      ready.current = true
      callback.current()
    }, ms)
  }, [ms])

  const clear = useCallback(() => {
    ready.current = null
    timeout.current && clearTimeout(timeout.current)
  }, [])

  // update ref when function changes
  useEffect(() => {
    callback.current = fn
  }, [fn])

  // set on mount, clear on unmount
  useEffect(() => {
    if (!setOnMount) return
    set()

    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, setOnMount])

  return [isReady, clear, set]
}
