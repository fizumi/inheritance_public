import { function as F, readonlyRecord as RR, option as O } from 'fp-ts'
import {
  RID,
  RID2,
  JA,
  JointAdoption,
  Dates,
  DateKeys,
  getLatestStartDateKVTuple,
} from '../../relation'
import { ID } from '../../../shared/types'
import { R2Store } from '../shared'
import { JointAdoptions } from './types'
import { RelID2to1 } from '../../relation/shared'

// -------------------------------------------------------------------------------------------------
// instance
// -------------------------------------------------------------------------------------------------
const rstore = R2Store.fixType<RelID2to1, JointAdoption>(RID2.createDirected)

// -------------------------------------------------------------------------------------------------
// insert / create
// -------------------------------------------------------------------------------------------------
export const { upsertAt } = rstore

// -------------------------------------------------------------------------------------------------
// create
// read
// -------------------------------------------------------------------------------------------------
export const { filterByIDs } = rstore

export const getOne: (
  s: JointAdoptions,
  ids: readonly ID[]
) => { rID: RelID2to1; rel: JA.JointAdoption; id: ID } | undefined = (rels, ids) => {
  const size = RR.size(rels)
  if (size !== 1) {
    if (size >= 2) {
      console.error('unnoticed logic')
    }
    return undefined
  }
  const [rID, rel] = Object.entries(rels)[0]
  return {
    rID,
    rel,
    id: ids[0],
  } as any
}

export const { has, getWithIndex: safeGetWithIndex, get: safeGet } = rstore

// -------------------------------------------------------------------------------------------------
// update
// -------------------------------------------------------------------------------------------------
export const updateAtAt = rstore.updateAtAt

// -------------------------------------------------------------------------------------------------
// update
// delete
// -------------------------------------------------------------------------------------------------
export const { reject, remove } = rstore

// -------------------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------------------
/**
 * 親P と 子C を含む jaRel が複数存在する場合, その中から startDate が新しい方の jaRel を取得する.
 * 例えば, P が C を A と共同で養子にとり, その後，A と離婚し, 今度は, B と婚姻後, B と共同で C を養子にとった場合を想定.
 * NOTE 現状, 当関数が想定する状況を入力できるフォームは作成されていない.
 */
export const getLatestJARel = (
  id: ID,
  id2: ID
): ((jaRels: JointAdoptions) => O.Option<[RelID2to1, JointAdoption]>) =>
  F.flow(filterByIDs([id, id2]), getLatestStartDateKVTuple)

/**
 * 共同縁組 (jaRel) があれば, その日付データを, なければ, rel の日付データを取得する
 * @param prop
 * @param id
 * @param id2
 * @returns
 */
export const getDatePropOfLatestJARelOrRel = <K extends DateKeys>(
  prop: K,
  id: ID,
  id2: ID,
  rel: Dates
): ((jaRels: JointAdoptions) => Dates[K]) =>
  F.flow(
    getLatestJARel(id, id2),
    O.chain(([_, jsRel]) => O.fromNullable(jsRel[prop])),
    O.getOrElseW(() => rel[prop])
  )

/**
 * 共同縁組データがある場合, そちらを優先する.
 *
 * parent と partner が child を 共同縁組しており, かつ, endDate が登録されている場合, その endDate を返す.
 * そうでない場合, rel.endDate を返す.
 */
export const modifyDate: <K extends DateKeys>(
  prop: K,
  jaRels: JointAdoptions,
  theOtherID: ID
) => <D extends Dates>(rID: RID.RelID, rel: D) => D = (prop, jaRels, theOtherID) => (rID, rel) => {
  const parent = RID.getTheOtherID(theOtherID)(rID)
  const modifiedDate = getDatePropOfLatestJARelOrRel(prop, theOtherID, parent, rel)(jaRels)
  return RR.upsertAt(prop, modifiedDate)(rel) as any
}
