// https://stackoverflow.com/a/65152534
import { useRef, useEffect } from 'react'

export default function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}
