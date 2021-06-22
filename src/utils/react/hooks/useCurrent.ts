import * as React from 'react'

export default function useCurrent<T>(value: T): React.MutableRefObject<T> {
  const valueRef = React.useRef(value)
  valueRef.current = value

  return valueRef
}
