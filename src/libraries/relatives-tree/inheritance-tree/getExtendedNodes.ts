import { function as F, option as O, readonlyNonEmptyArray as NEA } from 'fp-ts'
import * as R from 'ramda'
import Store from '../store'
import { ArrangedNode, IFamilyExtNode } from '../types'

const extendNode = (
  nodesArray: NEA.ReadonlyNonEmptyArray<NEA.ReadonlyNonEmptyArray<ArrangedNode>>
): IFamilyExtNode[] =>
  nodesArray
    .map((nodes, top) =>
      nodes.map((node) => ({
        ...node,
        top: top * 2,
        left: node.index * 2,
      }))
    )
    .reduce(R.concat)

export default function getExtendedNodes(store: Store): IFamilyExtNode[] {
  return F.pipe(
    store.getArrayOfNodeArray(),
    O.map(extendNode),
    O.getOrElse(F.constant([] as IFamilyExtNode[]))
  )
}
