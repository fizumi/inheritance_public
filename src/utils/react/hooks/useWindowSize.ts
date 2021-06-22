import React from 'react'

import useRafState from './useRafState'
import { isBrowser, off, on } from './utils'

// https://github.com/streamich/react-use/blob/master/src/useWindowSize.ts

const useWindowSize = (initialWidth = Infinity, initialHeight = Infinity) => {
  const [state, setState] = useRafState<{ width: number; height: number }>({
    width: isBrowser ? window.innerWidth : initialWidth,
    height: isBrowser ? window.innerHeight : initialHeight,
  })

  React.useEffect(
    () => {
      if (isBrowser) {
        const handler = () => {
          setState({
            width: window.innerWidth,
            height: window.innerHeight,
          })
        }

        on(window, 'resize', handler)

        return () => {
          off(window, 'resize', handler)
        }
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return state
}

export default useWindowSize
