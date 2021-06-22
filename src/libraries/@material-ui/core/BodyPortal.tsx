import * as React from 'react'
import * as ReactDOM from 'react-dom'
import useEnhancedEffect from 'src/utils/react/hooks/useIsomorphicLayoutEffect'

/**
 * Portals provide a first-class way to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 */
const Portal: React.FC = ({ children }): React.ReactElement | null => {
  const [mountNode, setMountNode] = React.useState<Element | null>(null)

  useEnhancedEffect(() => {
    setMountNode(document.body)
  }, [])

  // DOMツリーにおいて、children を mountNode 配下に render させる。
  // https://reactjs.org/docs/portals.html
  return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode
}

export default Portal
