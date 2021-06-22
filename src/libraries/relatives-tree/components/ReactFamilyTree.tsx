import React from 'react'
import { calcTree } from '../calcTree'
import { FamilyNode, IFamilyExtNode } from '../types'
import { Connector } from './Connector'

interface Props {
  nodes: ReadonlyArray<FamilyNode>
  rootID: string
  width: number
  height: number
  className?: string
  renderNode: (node: IFamilyExtNode, style: React.CSSProperties, rootID: string) => React.ReactNode
  baseOrder: string[]
}

export default React.memo<Props>((props) => {
  const data = calcTree(props)

  const width = props.width / 2
  const height = props.height / 2
  const canvasStyle = {
    position: 'relative',
    width: data.canvas.width * width,
    height: data.canvas.height * height,
  } as const

  const nodeStyle = (node: IFamilyExtNode) => ({
    width: props.width,
    height: props.height,
    top: node.top * height,
    left: node.left * width,
    position: 'absolute' as const,
  })

  return (
    <div style={canvasStyle} className={props.className}>
      {data.connectors.map((connector, idx) => (
        <Connector key={idx} connector={connector} width={width} height={height} />
      ))}
      {data.nodes.map((node) => props.renderNode(node, nodeStyle(node), props.rootID))}
    </div>
  )
})
