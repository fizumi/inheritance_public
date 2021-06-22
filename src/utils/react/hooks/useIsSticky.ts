import React from 'react'

// const DEBUG = true
const DEBUG = false

export default function useIsSticky(breakPoint: number | null = 0) {
  const [isSticky, setIsSticky] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (!breakPoint) return
      console.logIf(DEBUG, 'A > B', 'A: ' + window.pageYOffset, 'B: ' + breakPoint)
      setIsSticky(window.pageYOffset > breakPoint)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [breakPoint])

  return { isSticky }
}
