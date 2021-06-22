import { ID } from '../../../shared/types'
import { DateKeys, IsParent, RID } from '../../relation'
import { JAs, JointAdoptions } from '../../relations'

export const modifyIPDate: <K extends DateKeys>(
  prop: K,
  jaRels: JointAdoptions,
  theOtherID: ID
) => (rID: RID.DirectedRelID, rel: IsParent) => IsParent =
  (prop, jaRels, theOtherID) => (rID, rel) =>
    rel.type === '実親子' ? rel : JAs.modifyDate(prop, jaRels, theOtherID)(rID, rel)

export const modifyIPDateAndXformIntoTuple: <K extends DateKeys>(
  prop: K,
  jaRels: JointAdoptions,
  theOtherID: ID
) => (rID: RID.DirectedRelID, rel: IsParent) => [RID.DirectedRelID, IsParent] =
  (prop, jaRels, theOtherID) => (rID, rel) => {
    return [rID, modifyIPDate(prop, jaRels, theOtherID)(rID, rel) as any]
  }
