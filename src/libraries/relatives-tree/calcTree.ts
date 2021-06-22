import * as FT from 'fp-ts'
import clone from 'lodash/cloneDeep'
import * as R from 'ramda'
import { function as F } from 'fp-ts'
import { type } from 'src/utils/common'
import { applyEach } from 'src/utils/fp/common'
import { add, reset } from 'src/app/hooks/useDebugObject'
import { createStore } from './store'
import { createConnectors, arrangedNodes, getCanvasSize, getExtendedNodes } from './family-tree'

// https://qiita.com/ttatsf/items/68de3795ae3bf35c0228
// const omitInfo = (a: any): any => a
const omitInfo = (a: any): any => {
  const t = type(a)
  return t === 'Array'
    ? FT.array.map(omitInfo)(a)
    : t === 'Map'
    ? FT.map.map(omitInfo)(a)
    : t === 'Object'
    ? FT.record.mapWithIndex((key, v) => {
        const tt = type(v)
        if (key === 'nodes' || key === 'nodesArray') {
          if (tt === 'Map') return 'NODES'
          if (tt === 'Array') return (v as any).map(R.prop('name'))
          return '???'
        }
        if (key == 'arrangedReason') {
          if (tt === 'Object') return R.prop('name', v as any)
        }
        return omitInfo(v)
      })(a)
    : a
}

const omitAndClone = F.flow(omitInfo, clone)
export const addIntoDebugObj =
  (key: string) =>
  <Fn extends (a: any) => any>(fn: Fn): Fn =>
    F.flow(fn, R.tap(F.flow(omitAndClone, add(key)))) as Fn
const _d = addIntoDebugObj

export const calcTree = F.flow(
  createStore,
  R.tap(() => reset()),
  _d('[end arrangedNode]')(arrangedNodes),
  applyEach({
    canvas: _d('[end arrangedNode]')(getCanvasSize),
    nodes: _d('[end arrangedNode]')(getExtendedNodes),
    connectors: _d('[end arrangedNode]')(createConnectors),
  })
)
