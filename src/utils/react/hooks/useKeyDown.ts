import * as React from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
import useCurrent from './useCurrent'

export type ReactKeyHandlers = Record<string, (event: React.KeyboardEvent) => void>
export type KeyHandlers = Record<string, (event: KeyboardEvent) => void>
export const runKeyHandler =
  <KBEvent extends React.KeyboardEvent | KeyboardEvent>(
    keyHandler: Record<string, (event: KBEvent) => void>
  ) =>
  (event: KBEvent) => {
    // Wait until IME is settled.
    if (event.which !== 229) {
      keyHandler[event.key]?.(event)
    }
  }

export function useKeyDownHandler(keyHandlers: ReactKeyHandlers, active = true) {
  const keyHandlersRef = React.useRef(keyHandlers)
  keyHandlersRef.current = keyHandlers

  return React.useCallback(
    (event: React.KeyboardEvent) => {
      if (active) {
        runKeyHandler(keyHandlersRef.current)(event)
      }
    },
    [active]
  )
}

// https://github.com/mui-org/material-ui-pickers/blob/next/lib/src/_shared/hooks/useKeyDown.ts
// chrome extension によっては動作しない
export function useGlobalKeyDown(keyHandlers: KeyHandlers, active = true) {
  const keyHandlersRef = useCurrent(keyHandlers)

  useIsomorphicLayoutEffect(() => {
    if (active) {
      const handleKeyDown = runKeyHandler(keyHandlersRef.current)
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [active])
}
