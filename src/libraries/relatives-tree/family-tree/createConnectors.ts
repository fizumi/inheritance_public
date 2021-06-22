import { function as F, option as O, readonlyNonEmptyArray as NEA } from 'fp-ts'
import * as R from 'ramda'
import { isNoNil } from 'src/utils/fp/common'
import Store from '../store'
import { ArrangedNode, IConnector } from '../types'
import { eqArrangedNode } from '../utils'

export default function createConnectors(store: Store): ReadonlyArray<IConnector> {
  return F.pipe(
    store.getArrayOfNodeArray(),
    O.map(createConnectors_),
    O.getOrElse(F.constant([] as IConnector[]))
  )
}

const getChild = R.path(['arrangedReason', 'parentOf']) as (
  n: ArrangedNode
) => ArrangedNode | undefined

const isParentOfTheSamePerson = (n1: ArrangedNode, n2: ArrangedNode): boolean =>
  F.pipe(
    [n1, n2] as const,
    NEA.traverse(O.Applicative)(F.flow(getChild, O.fromNullable)),
    O.map(R.apply(eqArrangedNode.equals)),
    O.getOrElse(F.constFalse)
  )

const isPartner = (n1: ArrangedNode, n2: ArrangedNode): boolean => {
  return n1.id === n2.partner?.id
}

// indexToCoordinate
const i2c = (index: number) => 1 + index * 2

function createConnectors_(
  nodesArray: NEA.ReadonlyNonEmptyArray<NEA.ReadonlyNonEmptyArray<ArrangedNode>>
): IConnector[] {
  return nodesArray
    .map((nodes, yindex) => {
      const y = i2c(yindex)
      return nodes
        .map((node, xindex) => {
          const toParents = new ConnectorCreater()
          const partners = nodes.filter(
            (n, i) => xindex < i && (isParentOfTheSamePerson(node, n) || isPartner(node, n))
          )
          const child = getChild(node)
          const isAncestor = !!child
          const withPartners = partners
            .map((partner) => {
              const pairHorizontal = new ConnectorCreater()
              const pairVertical = new ConnectorCreater()
              const middleHorizontal = new ConnectorCreater()
              const children = child ? [child] : partner?.commonChildren || []
              if (children.length) {
                // pairHorizontal
                pairHorizontal.set.fromTo.x(i2c(node.index), i2c(partner.index))
                pairHorizontal.set.y(y)

                // 配偶者かどうかが意味をなすのは被相続人の視点のみなので, 現時点では, node.arrangedReason === 'root' に限定する
                if (node.arrangedReason === 'root' && partner.spouseIDs.includes(node.id)) {
                  pairHorizontal.linkSpouses = true
                }

                // pairVertical
                const xcenterOfParents =
                  partner.numberOfPartner === 1 || isAncestor
                    ? pairHorizontal.xcenter()
                    : partner.beforePartner
                    ? (i2c(partner.beforePartner?.index) + i2c(partner.index)) / 2
                    : undefined
                pairVertical.set.x(xcenterOfParents)
                pairVertical.set.fromTo.y(y, y + 1)
                console.log({ name: node.name, pairHorizontal, pairVertical })
                console.log({
                  numberOfPartner: partner.numberOfPartner,
                  isAncestor,
                  beforePartner: partner.beforePartner,
                })

                // middleHorizontal
                middleHorizontal.set.y(y + 1)
                if (children.length === 1) {
                  if (partner.numberOfPartner === 1 || isAncestor) {
                    middleHorizontal.set.fromTo.x(i2c(children[0].index), xcenterOfParents)
                  } else {
                    middleHorizontal.set.fromTo.x(xcenterOfParents, i2c(children[0].index))
                  }
                } else {
                  middleHorizontal.set.fromTo.x(
                    i2c(children[0].index),
                    i2c(children[children.length - 1].index)
                  )
                }
              }
              return getConnectors(pairHorizontal, pairVertical, middleHorizontal)
            })
            .reduce(R.concat, [])

          // toParents
          if (node.hasPanent) {
            const x = i2c(node.index)
            toParents.set.x(x)
            toParents.set.fromTo.y(y - 1, y)
          }
          return [...withPartners, ...getConnectors(toParents)]
        })
        .reduce(R.concat, [])
    })
    .reduce(R.concat, [])
}

type Point = {
  x?: number
  y?: number
}
interface ValidConnectorMaterial {
  from: Required<Point>
  to: Required<Point>
  linkSpouses?: boolean
}
class ConnectorCreater {
  private from: Point = {}
  private to: Point = {}
  private x?: number
  private y?: number
  public linkSpouses?: boolean

  set = {
    from: {
      x: (x?: number) => (this.from.x = x),
      y: (y?: number) => (this.from.y = y),
    },
    to: {
      x: (x?: number) => (this.to.x = x),
      y: (y?: number) => (this.to.y = y),
    },
    fromTo: {
      x: (x1?: number, x2?: number) => ((this.from.x = x1), (this.to.x = x2)),
      y: (y1?: number, y2?: number) => ((this.from.y = y1), (this.to.y = y2)),
    },
    x: (x?: number) => ((this.from.x = x), (this.to.x = x), (this.x = x)),
    y: (y?: number) => ((this.from.y = y), (this.to.y = y), (this.y = y)),
  }

  hasGotPoints = (): this is ValidConnectorMaterial => validPoint(this.from) && validPoint(this.to)
  ifHasValidPoints = <R>(fn: (x: ValidConnectorMaterial) => R) => {
    if (this.hasGotPoints()) {
      return fn(this)
    }
  }

  getConnector = () => this.ifHasValidPoints(getConnector)
  setConnector = (connectors: IConnector[]) => {
    const connector = this.getConnector()
    if (connector) connectors.push(connector)
  }

  xcenter = () => this.ifHasValidPoints((m) => (m.from.x + m.to.x) / 2)
}

const getConnector = (m: ValidConnectorMaterial): IConnector => ({
  points: [m.from.x, m.from.y, m.to.x, m.to.y] as const,
  double: m.linkSpouses,
})

const validPoint = (p: Point): p is Required<Point> => isNoNil(p.x, p.y)

const getConnectors = (...ccs: ConnectorCreater[]) => {
  const connectors = [] as IConnector[]
  ccs.forEach((cc) => cc.setConnector(connectors))
  return connectors
}
