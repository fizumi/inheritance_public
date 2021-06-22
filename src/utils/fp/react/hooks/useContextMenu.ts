import React from 'react'
import { useEventCallback } from 'src/utils/react/hooks'
import { clientXYSubtract, pickClientXY, ClientXY } from 'src/utils/fp/web/clientXY'

export const useContextMenu = () => {
  const [clientXY, setClientXY] = React.useState<ClientXY | null>(null)

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation() // 上流のDOM の ContextMenu を抑制する
    setClientXY(clientXY === null ? pickClientXY(event) : null)
  }

  const handleClose = () => {
    setClientXY(null)
  }

  return { clientXY, handleContextMenu, handleClose }
}

export const getPosition = (clientXY: ClientXY | null) => {
  if (clientXY === null) return undefined
  const tweaked = clientXYSubtract(clientXY, { clientX: 2, clientY: 4 })
  return { top: tweaked.clientY, left: tweaked.clientX }
}

export const useContextMenuWithData = <T>() => {
  const { clientXY, handleContextMenu, handleClose: hc } = useContextMenu()
  const dataRef = React.useRef<T>()

  const createHandleContextMenu = useEventCallback((data: T) => (event: React.MouseEvent) => {
    dataRef.current = data
    handleContextMenu(event)
  })

  const handleClose = useEventCallback(() => {
    hc()
    dataRef.current = undefined
  })

  const contextData = React.useMemo(() => {
    return {
      clientXY,
      data: dataRef.current,
    }
  }, [clientXY])

  const eventHandler = React.useMemo(() => {
    return {
      createHandleContextMenu,
      handleClose,
    }
  }, [createHandleContextMenu, handleClose])

  return { contextData, eventHandler }
}
