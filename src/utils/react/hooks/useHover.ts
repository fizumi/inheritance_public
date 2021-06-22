// https://usehooks-typescript.com/use-hover/
// https://github.com/streamich/react-use/blob/master/src/useHoverDirty.ts
import React from 'react'

export default function useHover<T extends HTMLElement = HTMLElement>(
  mode: 'over-out' | 'enter-leave' = 'over-out'
) {
  const [isHovered, setIsHovered] = React.useState<boolean>(false)
  const hoveredRef = React.useRef<T>(null)

  React.useEffect(() => {
    const element = hoveredRef.current
    if (element) {
      console.log('useHover', element)
      const setTrue = () => setIsHovered(true)
      const setFalse = () => setIsHovered(false)
      element.addEventListener(mode === 'enter-leave' ? 'mouseenter' : 'mouseover', setTrue)
      element.addEventListener(mode === 'enter-leave' ? 'mouseleave' : 'mouseout', setFalse)
      return () => {
        element.removeEventListener(mode === 'enter-leave' ? 'mouseenter' : 'mouseover', setTrue)
        element.removeEventListener(mode === 'enter-leave' ? 'mouseleave' : 'mouseout', setFalse)
      }
    }
  }, [mode])

  return { hoveredRef, isHovered }
}

export function useHoverState<T extends HTMLElement = HTMLElement>(
  mode: 'over-out' | 'enter-leave' = 'enter-leave'
) {
  const [isHovered, setIsHovered] = React.useState<boolean>(false)
  const [element, setElement] = React.useState<T | null>(null)

  React.useEffect(() => {
    if (element) {
      console.log('useHover', element)
      const setTrue = () => setIsHovered(true)
      const setFalse = () => setIsHovered(false)
      element.addEventListener(mode === 'enter-leave' ? 'mouseenter' : 'mouseover', setTrue)
      element.addEventListener(mode === 'enter-leave' ? 'mouseleave' : 'mouseout', setFalse)
      return () => {
        element.removeEventListener(mode === 'enter-leave' ? 'mouseenter' : 'mouseover', setTrue)
        element.removeEventListener(mode === 'enter-leave' ? 'mouseleave' : 'mouseout', setFalse)
      }
    }
  }, [element, mode])

  return { setElement, isHovered }
}
