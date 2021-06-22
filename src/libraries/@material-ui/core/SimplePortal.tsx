import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { setRef } from '@material-ui/core/utils' // https://github.com/mui-org/material-ui/blob/next/packages/material-ui-utils/src/setRef.ts
import useEnhancedEffect from 'src/utils/react/hooks/useIsomorphicLayoutEffect'

export interface PortalProps {
  /**
   * The children to render into the `container`.
   */
  // children?: React.ReactNode
  children?: React.ReactElement // React.forwardRef の引数（関数）の戻り値に合わせる。
  /**
   * A HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container?: Element | (() => Element | null) | null
  /**
   * The `children` will be inside the DOM hierarchy of the parent component.
   * @default false
   */
}

function getContainer(container: Element | (() => Element | null) | null | undefined) {
  return typeof container === 'function' ? container() : container
}

/**
 * Portals provide a first-class way to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 */
const Portal = React.forwardRef<Element, PortalProps>(function Portal(
  { children, container },
  ref
): React.ReactElement | null {
  const [mountNode, setMountNode] = React.useState<Element | null>(null)

  useEnhancedEffect(() => {
    setMountNode(getContainer(container) || document.body)
  }, [container])

  // ref prop に mountNode を set する。
  useEnhancedEffect(() => {
    if (mountNode) {
      setRef(ref, mountNode)
      return () => {
        setRef(ref, null)
      }
    }
    return undefined
  }, [ref, mountNode])

  // DOMツリーにおいて、children を mountNode 配下に render させる。
  // https://reactjs.org/docs/portals.html
  return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode
})

export default Portal
