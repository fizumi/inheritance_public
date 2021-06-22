/* eslint-disable @typescript-eslint/ban-types */
// https://qiita.com/tyoukan__/items/33caad937ab88bbc2384
import React from 'react'

type Component = React.ComponentType // Component that has only children prop
type AtLeast2 = [Component, Component, ...Component[]] // https://stackoverflow.com/a/59980296

export const partial =
  <P extends object>(Component: React.ComponentType<P>, props: P): Component =>
  ({ children }) =>
    React.createElement(Component, props, [children])

export const pipeComponents = (...components: AtLeast2): Component => {
  return components.reduce((Acc, Cur) => {
    return ({ children }) => (
      <Acc>
        <Cur>{children}</Cur>
      </Acc>
    )
  })
}
