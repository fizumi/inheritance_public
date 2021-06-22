import React from 'react'

export default function useDragAndDropWithIndex<T = Element>(props: {
  onMouseDown: (index: number) => (e: React.MouseEvent<T, MouseEvent>) => void
  onMouseMove: (index: number) => (e: MouseEvent) => void
  onMouseUp: () => void
  off?: boolean
}) {
  const { onMouseDown, onMouseMove, onMouseUp, off = false } = props

  const removeEventFnArray = React.useRef<Array<() => void>>([])

  const removeEventListeners = () => {
    while (removeEventFnArray.current.length) {
      removeEventFnArray.current.pop()?.()
    }
  }

  const mouseUpHandler = () => {
    removeEventListeners()
    onMouseUp()
  }

  const addEventListeners = (index: number) => {
    const mouseMoveHandler = onMouseMove(index)
    window.addEventListener('mousemove', mouseMoveHandler)
    window.addEventListener('mouseup', mouseUpHandler)
    removeEventFnArray.current.push(() => {
      window.removeEventListener('mousemove', mouseMoveHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    })
  }

  const getMouseDownHandler = React.useCallback(
    (index: number) =>
      (e: React.MouseEvent<T, MouseEvent>): void => {
        if (off) return
        onMouseDown(index)(e)
        addEventListeners(index)
      },
    [props] // eslint-disable-line react-hooks/exhaustive-deps
  )
  return { getMouseDownHandler }
}
