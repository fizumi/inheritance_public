// https://usehooks-typescript.com/use-hover/
import React from 'react'

export default function useSetHover<T extends HTMLElement = HTMLElement>(
  setIsHovered?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const hoveredRef = React.useRef<T>(null)

  React.useEffect(() => {
    if (!setIsHovered) return
    const handleMouseOver = () => setIsHovered(true)
    const handleMouseOut = () => setIsHovered(false)
    const element = hoveredRef.current
    if (element) {
      element.addEventListener('mouseover', handleMouseOver)
      element.addEventListener('mouseout', handleMouseOut)
      return () => {
        element.removeEventListener('mouseover', handleMouseOver)
        element.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [setIsHovered])

  return hoveredRef
}
