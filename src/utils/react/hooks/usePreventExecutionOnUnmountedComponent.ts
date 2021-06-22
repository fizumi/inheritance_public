import React from 'react'
import useIsMounted from './useIsMounted'

/**
 * 下記エラーに対する対策
 * Warning: Can't perform a React state update on an unmounted component. This is a no-op
 */
export default function usePreventExecutionOnUnmountedComponent() {
  const isMounted = useIsMounted()

  const preventExecutionOnUnmountedComponent = React.useCallback(
    (stateUpdator: () => void) => {
      setTimeout(() => {
        if (isMounted.current) {
          stateUpdator()
        }
      })
    },
    [isMounted]
  )

  return { preventExecutionOnUnmountedComponent, isMounted }
}
