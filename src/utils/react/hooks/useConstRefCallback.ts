// https://github.com/formium/formik/blob/master/packages/formik/src/Formik.tsx
import { useCallback, useRef } from 'react'

/*
    useEventCallback の亜種
 */
export default function useConstRefCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn)

  if (ref.current !== fn) {
    ref.current = fn
  }

  return useCallback((...args: any[]) => ref.current(...args), []) as T
}
