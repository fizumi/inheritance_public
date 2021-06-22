import React from 'react'
import { IConnector } from '../types'
import * as R from 'ramda'

interface HW {
  width: number
  height: number
}
interface TL {
  top: number
  left: number
}

interface Props extends HW {
  connector: IConnector
}

// width height は 2分割された値
// 1 は width, height の単位
export const Connector: React.FC<Props> = ({ connector, width, height }) => {
  const {
    points: [x1, y1, x2, y2],
    double,
  } = connector

  const props = {
    width: Math.max(1, (x2 - x1) * width + 1),
    height: Math.max(1, (y2 - y1) * height + 1),
    top: y1 * height,
    left: x1 * width,
  }

  return double ? (
    <>
      <Connector_ {...R.over(R.lensProp('top'), R.add(-2), props)} />
      <Connector_ {...props} />
    </>
  ) : (
    <Connector_ {...props} />
  )
}

const Connector_: React.FC<HW & TL> = (props) => {
  return (
    <span
      style={{
        ...props,
        position: 'absolute',
        background: `#999`,
        pointerEvents: 'none',
      }}
    />
  )
}
