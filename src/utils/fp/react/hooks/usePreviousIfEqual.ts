/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import * as R from 'ramda'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function usePreviousIfEqual<T>(obj: T, equals?: (prev: T, next: T) => boolean) {
  const prev = React.useRef<T>()

  equals = equals || R.equals
  if (prev.current === undefined || !equals(prev.current, obj)) {
    prev.current = obj
  }
  return prev.current
}
