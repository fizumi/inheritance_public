// https://github.com/formium/formik/blob/master/packages/formik/src/Formik.tsx
import { useCallback, useRef } from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

export default function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref: any = useRef(fn)

  // we copy a ref to the callback scoped to the current state/props on each render
  useIsomorphicLayoutEffect(() => {
    if (ref.current !== fn) {
      ref.current = fn
    }
  })

  return useCallback((...args: any[]) => ref.current.apply(null, args), []) as T
}
