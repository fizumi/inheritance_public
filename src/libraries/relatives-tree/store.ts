import {
  function as F,
  option as O,
  ord,
  readonlyArray as A,
  readonlyMap as M,
  readonlyNonEmptyArray as NEA,
  readonlyTuple as T,
  number,
} from 'fp-ts'
import * as R from 'ramda'
import { toMap, TEO } from 'src/utils/fp/common'
import { ArrangedNode, ArrangedReason, HasIDKeys, FamilyNode, ID } from './types'
import { equalId } from './utils'
// import ts from 'ts-toolbelt'

const byIndex = ord.contramap((x: ArrangedNode) => x.index)(number.Ord)
const lookup = M.lookup(number.Eq)

type ArrangedNodeMap = ReadonlyMap<number, ArrangedNode>
type Generations = ReadonlyMap<number, ArrangedNodeMap>

export interface StoreParams {
  nodes: ReadonlyArray<Readonly<FamilyNode>>
  rootID: ID
  baseOrder: ID[]
}
export const createStore = (args: StoreParams): Store => new Store(args)
class Store {
  nodes: Map<string, FamilyNode>
  generations: Generations
  rootNode: FamilyNode

  constructor(public args: StoreParams) {
    if (!args.nodes.find(equalId(args.rootID))) throw new ReferenceError()

    this.nodes = toMap()(args.nodes)
    this.rootNode = this.getNode(args.rootID)
    this.generations = new Map()
  }

  private findIndex = (id: ID): number => this.args.baseOrder.findIndex((v) => v === id)
  sortIDs = R.sort((a: ID, b: ID) => this.findIndex(a) - this.findIndex(b))

  moveRootIDToHead = (ids: readonly string[]): string[] =>
    ids.includes(this.args.rootID)
      ? [this.args.rootID, ...R.without([this.args.rootID], ids)]
      : [...ids]

  gene = {
    indexes: (): readonly number[] => M.keys(ord.ordNumber)(this.generations),
    max: (): number => F.pipe(this.gene.indexes(), A.reduce(-1, R.max)),
    mim: (): number => F.pipe(this.gene.indexes(), A.reduce(Infinity, R.min)),
  }

  getArrangedNodeMap = (gene: number): O.Option<ArrangedNodeMap> => lookup(gene)(this.generations)
  getArrangedTouple = F.flow(this.getArrangedNodeMap, O.map(M.toReadonlyArray(ord.ordNumber)))
  getArrangedNodes: (gene: number) => readonly ArrangedNode[] = F.flow(
    this.getArrangedTouple,
    O.map(A.map(T.snd)),
    O.getOrElse(F.constant([] as readonly ArrangedNode[]))
  )
  notArrangedIn =
    (gene: number) =>
    (id: string): boolean =>
      F.pipe(
        this.getArrangedNodes(gene),
        A.some((a) => a.id === id),
        R.not
      )

  getMaxIndex = (sign?: '<' | '>=' | '>' | '==' | 'all', gene?: number): number => {
    const keys =
      sign === undefined || gene === undefined
        ? this.gene.indexes()
        : sign === '=='
        ? [gene]
        : sign === '<'
        ? R.range(this.gene.mim(), gene)
        : sign === '>='
        ? R.range(gene, this.gene.max() + 1)
        : R.range(gene + 1, this.gene.max() + 1)

    let maxIndex = -1
    const setMax = (index: number) => index > maxIndex && (maxIndex = index)
    keys.forEach(F.flow(this.getArrangedNodeMap, O.map(getMaxIndex), O.map(setMax)))
    return maxIndex
  }

  getNode = (id: string): FamilyNode => this.nodes.get(id) as FamilyNode
  getArangedNode = (gene: number, index: number): ArrangedNode | undefined =>
    F.pipe(this.getArrangedNodeMap(gene), O.chain(lookup(index)), O.getOrElseW(F.constUndefined))
  getArangedNodeByID = (gene: number, id: string): ArrangedNode | undefined =>
    this.getArrangedNodes(gene).find(R.propEq('id', id))

  getNodes = (ids: ReadonlyArray<string>): ReadonlyArray<FamilyNode> =>
    ids.map((id) => this.getNode(id))

  getArrayOfNodeArray = (): O.Option<
    NEA.ReadonlyNonEmptyArray<NEA.ReadonlyNonEmptyArray<ArrangedNode>>
  > =>
    F.pipe(
      M.collect(number.Ord)((k, a: ArrangedNodeMap) => getSortedNonEmptyArrangedNodeArray(a))(
        this.generations
      ),
      A.sequence(O.Applicative),
      O.chain(NEA.fromReadonlyArray)
    )

  getNonEmptyArangedNodeArray = (): O.Option<NEA.ReadonlyNonEmptyArray<ArrangedNode>> =>
    F.pipe(this.getArrayOfNodeArray(), O.map(NEA.fold(NEA.getSemigroup())))

  insertArrangedNode = (
    gene: number,
    index: number,
    n: FamilyNode,
    r?: ArrangedReason
  ): ArrangedNode => {
    console.log('[insertArrangedNode] start', { gene, index, n, r })
    const an = F.pipe(
      R.assoc('generation', gene, n), // 最初から merge せずに 一度 asocc を挟むことで，prototype properties を値として設定できる
      R.mergeLeft({ index, arrangedReason: r })
    ) as ArrangedNode
    const insert = M.upsertAt(number.Ord)
    const anm = F.pipe(
      this.getArrangedNodeMap(gene),
      O.getOrElse(F.constant(new Map() as ArrangedNodeMap))
    )
    const newArrangedNodeMap = insert(index, an)(anm)
    this.generations = insert(gene, newArrangedNodeMap)(this.generations)
    console.log('inserted', an.name, gene, index)
    return an
  }

  // includesIdInProp
  nodesThatHave = (ids: readonly string[], as: HasIDKeys): readonly Readonly<FamilyNode>[] =>
    F.pipe(
      ids,
      TEO.reduce(
        A.Foldable,
        A.getMonoid<Readonly<FamilyNode>>()
      )(
        F.flow(
          TEO.map((id, acc) =>
            F.pipe(
              this.args.nodes,
              A.filter((n) => n[as].includes(id)),
              (nodes) => nodes.filter((node) => R.findIndex(R.propEq('id', node.id), acc) === -1) // acc に含まれていないもの
            )
          )
        )
      )
    )
}
export default Store

const getSortedNonEmptyArrangedNodeArray = (m: ArrangedNodeMap) =>
  F.pipe(m, M.values(byIndex), NEA.fromReadonlyArray)

const getIndexOfLastNode = (nea: NEA.ReadonlyNonEmptyArray<ArrangedNode>) =>
  F.pipe(nea, NEA.last, R.prop('index'))

const getMaxIndex = F.flow(
  getSortedNonEmptyArrangedNodeArray,
  O.map(getIndexOfLastNode),
  O.getOrElse(F.constant(0))
)
