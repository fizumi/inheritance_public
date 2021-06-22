// https://stackoverflow.com/a/681729
import React from 'react'
import useWindowResize from './useWindowResize'

interface ScrollbarPresence {
  vertical: boolean
  horizontal: boolean
}

export function useDetectScrollbarPresenceWhenWindowResize(): ScrollbarPresence {
  const [isVerticalScrollbar, setVertical] = React.useState<boolean>(false)
  const [isHorizontalScrollbar, setHorizontal] = React.useState<boolean>(false)

  useWindowResize(() => {
    const root = document.scrollingElement || document.documentElement
    setVertical(root.scrollHeight > root.clientHeight)
    setHorizontal(root.scrollWidth > root.clientWidth)
  })

  return { vertical: isVerticalScrollbar, horizontal: isHorizontalScrollbar }
}

export function useDetectScrollbarPresence(deps?: any[]): ScrollbarPresence {
  const [isVerticalScrollbar, setVertical] = React.useState<boolean>(false)
  const [isHorizontalScrollbar, setHorizontal] = React.useState<boolean>(false)
  React.useEffect(
    () => {
      const root = document.scrollingElement || document.documentElement
      setVertical(root.scrollHeight > root.clientHeight)
      setHorizontal(root.scrollWidth > root.clientWidth)
    },
    deps ? [...deps] : undefined // eslint-disable-line react-hooks/exhaustive-deps
  )

  return { vertical: isVerticalScrollbar, horizontal: isHorizontalScrollbar }
}

export function useScrollbarPresence(deps?: any[]): React.MutableRefObject<ScrollbarPresence> {
  const scrollbarPresence = React.useRef<ScrollbarPresence>({
    vertical: false,
    horizontal: false,
  })
  React.useEffect(
    () => {
      const root = document.scrollingElement || document.documentElement
      scrollbarPresence.current.vertical = root.scrollHeight > root.clientHeight
      scrollbarPresence.current.horizontal = root.scrollWidth > root.clientWidth
    },
    deps ? [...deps] : undefined // eslint-disable-line react-hooks/exhaustive-deps
  )

  return scrollbarPresence
}
