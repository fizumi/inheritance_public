import tb from 'ts-toolbelt'
import { ID } from 'src/utils/fp/common'

export type { ID }

export type Gender = 'male' | 'female'

export type FamilyType = 'core' | 'child' | 'parent'

export interface ICanvasSize {
  width: number
  height: number
}

export interface FamilyNode {
  id: ID
  parentIDs: ReadonlyArray<ID>
  childIDs: ReadonlyArray<ID>
  siblingIDs: ReadonlyArray<ID>
  spouseIDs: ReadonlyArray<ID>
  name: string // add
}
export type NodeKeys = keyof FamilyNode
export type HasIDKeys = tb.Union.Intersect<
  NodeKeys,
  'parentIDs' | 'childIDs' | 'siblingIDs' | 'spouseIDs'
>

export type ArrangedReason =
  | {
      parentOf: ArrangedNode
    }
  | {
      childOf: ArrangedNode
    }
  | {
      spouseOf: ArrangedNode
    }
  | {
      partnerOf: ArrangedNode
    }
  | 'first root parent'
  | 'root'

export interface ArrangedNode extends FamilyNode {
  generation: number // add -n , 0, n
  index: number // add 0, 1, 2 ...
  arrangedReason?: ArrangedReason
  hasPanent?: boolean
  partner?: FamilyNode
  commonChildren?: ArrangedNode[]
  arangePartner?: boolean
  numberOfPartner?: number
  beforePartner?: ArrangedNode
}
export interface IFamilyExtNode extends ArrangedNode {
  top: number
  left: number
}

export interface IConnector {
  double?: boolean
  points: readonly [number, number, number, number]
}

export interface IFamilyData {
  canvas: ICanvasSize
  nodes: ReadonlyArray<IFamilyExtNode>
  connectors: ReadonlyArray<IConnector>
}
