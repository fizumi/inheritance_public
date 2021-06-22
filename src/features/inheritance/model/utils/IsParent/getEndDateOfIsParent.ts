import {
  function as F,
  option as O,
  readonlyNonEmptyArray as NEA,
  readonlyRecord as RR,
} from 'fp-ts'
import { record2arrayBy } from 'src/utils/fp/common'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import { ID } from '../../../shared/types'
import { selector } from '../../index'
import { IsParent, IP, RID } from '../../relation'
import { getKeyValueTupleThatHasLatestStartDate, JAs, IPs } from '../../relations'
import { Store } from '../../types'
import { modifyIPDate, modifyIPDateAndXformIntoTuple } from './utils'

setMyDebugMethodToConsole()
const debug = false

export const getEndDateOfIsParentForTest = (
  s: Store,
  inheriteeID: ID,
  childID: ID
): ReturnType<typeof getEndDateOfIsParent> => {
  const maybeRIDAndRel = IPs.safeGetWithIndex(inheriteeID, childID)(selector.isParent(s))
  if (O.isNone(maybeRIDAndRel)) throw new Error()

  return getEndDateOfIsParent(s, inheriteeID, childID, ...maybeRIDAndRel.value)
}

/**
 * 特別養子縁組により, 親子関係が終了している場合は, その最新の特別養子縁組の開始日を関係終了日として取得する.
 * 前提: NOTE を参照
 */
export const getEndDateOfIsParent: (
  s: Store,
  inheriteeID: ID, // 死亡した親
  childID: ID, // 死亡した親の子
  curRID: RID.DirectedRelID, // parentID->childID
  curRel: IsParent
) => string | null = (s, inheriteeID, childID, curRID, _curRel) => {
  const jaRels = selector.jointAdoption(s)
  const curRel = modifyIPDate('startDate', jaRels, childID)(curRID, _curRel)
  return F.pipe(
    selector.isParent(s),

    // 被相続人 (inheriteeID) の子 (childID) の, 被相続人以外の親（親子関係）を取得
    IPs.filterByChildID(childID), // filterByChildID は memo化されているので積極利用

    RR.filterWithIndex((rID, rel) => IP.isSpecial(rel) && rID !== curRID), // 特別養親子関係に絞り, ( NOTE curRel が特別養子縁組である場合, 特別養子縁組は他に１つ以上存在するので, curRel を除外しても 必ず【A】ロジックに入る )
    (xs) => xs as RR.ReadonlyRecord<RID.DirectedRelID, IsParent>, // type assertion
    record2arrayBy(modifyIPDateAndXformIntoTuple('startDate', jaRels, childID)), // 開始日の修正(共同縁組データの優先), KVタプル配列への変換 を行う
    NEA.fromReadonlyArray,

    // 【A】child が特別養子縁組をしている場合, 最新の特別養子縁組開始日において, 他の親子関係は終了しているので, 最新特別養子縁組開始日を終了日とする.
    O.chain(
      F.flow(getKeyValueTupleThatHasLatestStartDate, ([rID, latestStartDateOfSpecialRel]) => {
        console.logIf(debug, 'A1', rID, latestStartDateOfSpecialRel)
        //
        // 最新の特別養子縁組 が parent との 共同縁組の場合( 第８１７条の３第２項ただし書の場合を含む ) を除く
        const otherParent = RID.getTheOtherID(childID)(rID)
        if (
          (curRel.type === '実親子' || curRel.type === '特別養親子') &&
          JAs.has(inheriteeID, otherParent, childID)(jaRels)
        ) {
          console.logIf(debug, 'A2')
          return O.none
        }
        if (curRel.startDate == null) {
          console.logIf(debug, 'A3', latestStartDateOfSpecialRel.startDate)
          return O.some(latestStartDateOfSpecialRel.startDate) // 特別養子縁組存在時において, startDate が null なのは 実親子関係の場合
        }
        console.logIf(debug, 'A4', latestStartDateOfSpecialRel.startDate)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return curRel.startDate > latestStartDateOfSpecialRel.startDate! // 特別養子縁組は startDate 必須のため assertion してしまっている
          ? O.none // 最新の特別養子縁組より後の縁組は８１７条の９本文による親子関係終了の効力を受けない
          : O.some(latestStartDateOfSpecialRel.startDate)
      })
    ),

    // 【B】特別養子縁組が無い, または, 有っても最新の特別養子縁組よりも curRel の方が開始日が新しい 場合
    O.getOrElseW(() => {
      if (curRel.type === '実親子') return null // 特別養子縁組以外に実親子関係を消滅させる制度はない

      return curRel.endDate
    })
  )
}
//
// curParent が actual なら 子 が自分以外の親と特別養子縁組をしており, かつ, その curParent が 特別JA を有していない場合 終了
// curParent が !actual なら 子 が自分以外の親と特別養子縁組をしており, かつ, その rel
// export const getLatestSpectialRel: (
