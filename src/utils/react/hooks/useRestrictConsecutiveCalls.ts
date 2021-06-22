import React from 'react'

export type UseDebounceReturn = [() => boolean | null, () => void]

export default function useRestrictConsecutiveCalls(ms = 200) {
  const lastCallTime = React.useRef(Number(new Date()))

  const debounce = React.useCallback(
    <P extends any[]>(fn: (...xs: P) => void): ((...xs: P) => void) => {
      return (...xs: P) => {
        const now = Number(new Date())
        const elapsedMsec = now - lastCallTime.current
        if (elapsedMsec > ms) {
          lastCallTime.current = now
          fn(...xs)
        }
      }
    },
    [ms]
  )

  return debounce
}
