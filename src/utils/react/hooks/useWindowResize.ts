import { useEffect } from 'react'
import { isBrowser, off, on } from './utils'

const useWindowResize = (fn: () => void) => {
  useEffect((): (() => void) | void => {
    if (isBrowser) {
      on(window, 'resize', fn)
      return () => {
        off(window, 'resize', fn)
      }
    }
  }, [fn])
}
export default useWindowResize
