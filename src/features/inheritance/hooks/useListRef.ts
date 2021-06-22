import React from 'react'
import constate from 'src/libraries/constate'
import { FixedSizeList } from 'react-window'

// https://react-window.vercel.app/#/examples/list/scroll-to-item

export const [ReactWindowInstanceProvider, useReactWindowInstance] = constate(() => {
  const ref = React.useRef<FixedSizeList<string[]>>(null)
  return ref
})
