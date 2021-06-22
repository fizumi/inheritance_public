import * as React from 'react'
import useCurrent from './useCurrent'

export default function useDelayedSet<T>(value: T, ms = 100): T {
  const valueRef = useCurrent(value)

  const [state, setState] = React.useState(value)
  React.useEffect(() => {
    setTimeout(() => {
      setState(valueRef.current)
    }, ms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ms])

  return state
}
