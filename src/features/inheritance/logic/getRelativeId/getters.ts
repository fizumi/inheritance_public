import {
  function as F,
  option as O,
  readonlyArray as A,
  readonlyRecord as RR,
  readonlyTuple as T,
} from 'fp-ts'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { constant, flow, pipe } from 'fp-ts/lib/function'
import * as R from 'ramda'
import {
  ID,
  memoizeCurriedFn,
  record2arrayBy,
  reduceOWithIndex,
  TEO as BR,
} from 'src/utils/fp/common'
import {
  COLS,
  Dates,
  IP,
  IPs,
  JAs,
  keyAndHasStartDateOrd,
  Marriage,
  Mrrgs,
  RID,
  RID2,
  Row,
  selector,
  Store,
} from '../../model'
import { getEndDateOfIsParent, modifyIPDateAndXformIntoTuple } from '../../model/utils'
import { InheritanceTuple, RecursiveIDs } from '../shared/types'

/*

  [システムの方針]
  NOTE 戸籍データを信用しない場合, 入力データが余計に増えることになり, 望ましくない
  なので, 戸籍データが正しいことを前提として設計にする
 */

// -------------------------------------------------------------------------------------------------
// type
// -------------------------------------------------------------------------------------------------
type Date = Row['deathDate']
type IDs = readonly ID[]

// -------------------------------------------------------------------------------------------------
// util
// -------------------------------------------------------------------------------------------------
// function composers
type GetIDsAtTheDate = (s: Store, t: InheritanceTuple) => readonly ID[]
const toPipable =
  (fn: GetIDsAtTheDate) =>
  (s: Store, inheritanceDate: string) =>
  (inheriteeID: ID): readonly ID[] =>
    fn(s, [inheriteeID, inheritanceDate])

// 一対多 -> 多対多
export const createScanIDs: (
  fn: GetIDsAtTheDate
) => (s: Store, inheritanceDate: string) => (ids: IDs) => IDs =
  (fn) => (s, inheritanceDate) => (ids) =>
    ids.map(toPipable(fn)(s, inheritanceDate)).reduce(R.union, [])

/* ※代襲できるのは甥姪まで */
const createGetThirdPriorityHeirsIDs: (
  getSiblingIDs: GetIDsAtTheDate
) => (s: Store, t: InheritanceTuple) => RecursiveIDs = (getSiblingIDs) => (s, t) => {
  const inheritanceDate = T.snd(t)
  return getSiblingIDs(s, t).map((siblingID) =>
    相続前死亡または同時死亡(s, inheritanceDate)(siblingID)
      ? pipe(
          getChildIDsAtTheDate(s, [siblingID, inheritanceDate]),
          A.filter(相続前死亡でも同時死亡でもない(s, inheritanceDate))
        ) // 存命の甥姪
      : siblingID
  )
}

/**
 * 被相続人より先に死亡 又は 同時死亡 (同時死亡の場合は相続人とならない http://www.souzoku-mado.jp/souzoku49 )
 */
const 相続前死亡または同時死亡 =
  (s: Store, inheriteeDeathDate: string) =>
  (id: ID): boolean => {
    const deathDate = s[COLS].deathDate[id]
    return deathDate !== null && deathDate <= inheriteeDeathDate
  }
const 相続前死亡でも同時死亡でもない = (s: Store, inheriteeDeathDate: string) =>
  R.complement(相続前死亡または同時死亡(s, inheriteeDeathDate))

/**
 * NOTE rel.endDate == null の場合, iDD < rel.endDate と見做す ∵ 離婚日の記載なし -ならば-> 被相続人死亡時に離婚していない
 *
 * 配偶者の情報として必要なのは被相続人と死亡時に配偶者であったかどうか、すなわち以下の条件を判定するのに必要なもの。
 * 婚姻日 < 被相続人死亡日 < 離婚日
 * NOTE 当システムでは, 「婚姻日 < 被相続人死亡日」 は確定事項とする. ∵ 現実において死後に結婚することはできないしできたとしても相続は発生しない
 * そのため、配偶者は endDate だけで良い.
 */
const 被相続人死亡日_lt_関係終了日 =
  (inheriteeDeathDate: string) =>
  (endDate: Date): boolean =>
    endDate == null || inheriteeDeathDate < endDate

/*
    配偶者
*/
export const getSpouseIDs = memoizeCurriedFn((s: Store) => (id: ID): ID[] => {
  return pipe(
    selector.marriage(s),
    Mrrgs.filterByID(id),
    RR.reduceWithIndex([] as ID[], (rID, acc, _rel: Marriage) => {
      const spouseID = RID.getTheOtherID(id)(rID)
      return spouseID ? (acc.push(spouseID), acc) : acc
    })
  )
})

const FWUndirectedRelID = RR.FoldableWithIndex as FoldableWithIndex1< 'ReadonlyRecord', RID.UndirectedRelID > // prettier-ignore
const idsMonoid = A.getMonoid<ID>()
const marriages2ids = [FWUndirectedRelID, idsMonoid] as const

export const getAliveSpouseIDsAtDeathDate: GetIDsAtTheDate = (s, [inheriteeID, inheritanceDate]) =>
  pipe(
    selector.marriage(s),
    reduceOWithIndex(...marriages2ids)((_, rID, rel) => {
      const spouseID = RID.getTheOtherID(inheriteeID)(rID)
      return pipe(
        A.of(spouseID),
        O.fromPredicate(
          constant(
            RID.hasID(inheriteeID)(rID) &&
              相続前死亡でも同時死亡でもない(s, inheritanceDate)(spouseID) &&
              被相続人死亡日_lt_関係終了日(inheritanceDate)(rel.endDate)
          )
        )
      )
    })
  )

/*
    第一順位相続人（子またはその代襲者） 887条
*/
export const getChildIDs = memoizeCurriedFn(
  (s: Store) =>
    (id: ID): readonly ID[] =>
      F.pipe(selector.isParent(s), IPs.getChildIDs(id))
)

/*
  [親子関係]
  相続時においては子としての資格があるかどうかを判定するには, 「相続開始時, 終了していない親子関係」かどうかを判断すればよい.
  親子関係は, 特別養子縁組開始日に終了する可能性があるので, 親子関係を決する場合, startDate も必要.
  （「親子関係の開始日 < 特別養子縁組開始日 < 相続発生日」なら、 相続発生時、その親子関係は終了している）
*/
const FWDirectedRelID = RR.FoldableWithIndex as FoldableWithIndex1< 'ReadonlyRecord', RID.DirectedRelID > // prettier-ignore
const IsParents2IDs = [FWDirectedRelID, idsMonoid] as const
export const getChildIDsAtTheDate: GetIDsAtTheDate = (s, [inheriteeID, inheritanceDate]) =>
  pipe(
    selector.isParent(s),
    IPs.filterByParentID(inheriteeID), // filterByParentID は memo化されているので積極利用
    reduceOWithIndex(...IsParents2IDs)((_, rID, rel) => {
      const childID = RID.getDst(rID)
      return pipe(
        A.of(childID),
        O.fromPredicate(
          constant(
            pipe(
              getEndDateOfIsParent(s, inheriteeID, childID, rID, rel),
              被相続人死亡日_lt_関係終了日(inheritanceDate)
            )
          )
        )
      )
    })
  )

/*
【 被相続人の死亡時に, 相続人が生まれていないというパターンについて /  結論：出生日は不要】
- 子について
親子関係を設定している時点で子が生まれていないということはありえない.
- 孫以降の子孫について
孫が相続人になるのは代襲相続の場合であり, 相続時, 子が死亡していることが前提となるが,
子の死亡後に(その子の子である)孫が生まれていないということはありえない.
また, 死後に縁組をすることもできない.

➡ 出生日は不要
*/

export const scanChildIDsAtTheDate = createScanIDs(getChildIDsAtTheDate)

export const getFirstPriorityHeirsIDs: (s: Store, t: InheritanceTuple) => RecursiveIDs = (s, t) => {
  const inheritanceDate = T.snd(t)
  return pipe(
    getChildIDsAtTheDate(s, t),
    A.map((id) =>
      相続前死亡または同時死亡(s, inheritanceDate)(id)
        ? getFirstPriorityHeirsIDs(s, [id, inheritanceDate])
        : id
    )
  )
}

// ↓ 過去にテストした Error を扱うパターン
// export const getFirstPriorityHeirsIDs: (
//   s: Store
// ) => (t: InheritanceTuple) => E.Either<Error, RecursiveIDs> = (s) =>
//   flow(
//     getChildIDsAtTheDate(s),
//     E.chain(
//       A.traverse(E.Applicative)((id) =>
//         aliveIn(s)(id) ? E.right(id) : (getFirstPriorityHeirsIDs(s)(id) as any)
//       )
//     )
//   )

/*
    第二順位相続人（直系尊属）
*/
export const getParentIDs = memoizeCurriedFn(
  (s: Store) =>
    (id: ID): readonly ID[] =>
      F.pipe(selector.isParent(s), IPs.getParentIDs(id))
)
const toIDArray = [A.Foldable, idsMonoid] as const

/**
 * NOTE 特別養子縁組の場合, 共同で縁組した者 (partnerID) が必ず存在することを前提とする
 * ∵ 法律上そう決まっている（そのため 当関数を使う前に validation が必要）
 */
export const getParentIDsAtTheDate: GetIDsAtTheDate = (s, [inheriteeID, inheritanceDate]) => {
  const rels = selector.isParent(s)
  const jaRels = selector.jointAdoption(s)
  return pipe(
    rels,
    IPs.filterByChildID(inheriteeID), // filterByChildID は memo化されているので積極利用

    // idMapOfRecord2recordArray('rID'), // key を rID プロパティに変更して record を配列化
    record2arrayBy(modifyIPDateAndXformIntoTuple('startDate', jaRels, inheriteeID)), // 共同縁組データに startDate がある場合, そちらを優先する.
    // R.tap((x) => console.log('k1', x)),
    A.sort(keyAndHasStartDateOrd), // startDate が新しい順にソート
    // R.tap((x) => console.log('k2', x)),
    BR.reduce(...toIDArray)((ma, [rID, curRel]) => {
      const parentID = RID.getSrc(rID)
      const endDate = () =>
        JAs.getDatePropOfLatestJARelOrRel('endDate', inheriteeID, parentID, curRel)(jaRels)
      const canBeHeir = (endDateThunk: () => Dates['endDate']) => {
        return flow(endDateThunk, 被相続人死亡日_lt_関係終了日(inheritanceDate))
      }
      return pipe(
        ma,
        // R.tap((x) => console.log('k3-1', x)),
        BR.filter(canBeHeir(endDate)),
        // R.tap((x) => console.log('k3-2', x)),
        BR.map(constant(A.of(parentID))), // monoid の型に合わせる
        // R.tap((x) => console.log('k3-3', x)),
        BR.reduced((ids, acc) =>
          !IP.isSpecial(curRel)
            ? O.none
            : pipe(
                // curRel が特別縁組の場合, curRel 以降の 親子関係は終了しているので, loop (reduce) を終了する
                // 特別養子縁組の場合, jaRel が必ず存在する
                JAs.getLatestJARel(inheriteeID, parentID)(jaRels),
                O.chain(([jaID, jaRel]) => {
                  const partnerID = RID2.getTheOtherID(inheriteeID, parentID)(jaID)
                  // console.log('k4', { jaID, jaRel, partnerID, ids, acc })
                  return pipe(
                    IPs.safeGet(partnerID, inheriteeID)(rels),
                    O.map((partnerRel) => {
                      const _acc = acc.concat(ids)
                      const endDate = () => jaRel.endDate || partnerRel.endDate
                      return canBeHeir(endDate)() ? _acc.concat([partnerID]) : _acc
                    })
                  )
                })
              )
        )
      )
    })
  )
}

export const scanParentIDsAtTheDate = createScanIDs(getParentIDsAtTheDate)

/**
 * p218
 * 親世代がいなけば, 祖父母の世代, その代がいなければ, その前の代, ...と, 相続する世代が変化する.
 */
export const scanAliveAncestorIDs = (
  s: Store,
  inheritanceDate: string,
  ids: readonly ID[],
  n = 0
): ID[] => {
  const parentIDs = scanParentIDsAtTheDate(s, inheritanceDate)(ids)
  if (R.isEmpty(parentIDs)) {
    return [] // この先祖世代に相続人となり得る者が存在しない
  }
  const aliveAncestorIDs = parentIDs.filter(相続前死亡でも同時死亡でもない(s, inheritanceDate))
  if (!R.isEmpty(aliveAncestorIDs)) {
    return aliveAncestorIDs // この先祖世代に少なくとも一人の相続人が存在した
  }
  return scanAliveAncestorIDs(s, inheritanceDate, parentIDs, n + 1) // この先祖世代に相続人となり得る者は相続開始時全員死亡していた
}

export const getSecondPriorityHeirsIDs = (
  s: Store,
  [inheriteeID, inheritanceDate]: InheritanceTuple
): RecursiveIDs => scanAliveAncestorIDs(s, inheritanceDate, [inheriteeID])

// 第三順位相続人（兄弟姉妹または甥姪）
export const getSiblingIDs = memoizeCurriedFn(
  (s: Store) =>
    (id: ID): ID[] =>
      // get persons who are children of one's parents without oneself.
      pipe(getParentIDs(s)(id), A.map(getChildIDs(s)), A.reduce([], R.union), R.without([id]))
)
/**
 * 半血・全血を問わない
 */
export const getSiblingIDsAtTheDate: GetIDsAtTheDate = (s, [iID, iDate]) =>
  // get persons who are children of one's parents without oneself.
  pipe(getParentIDsAtTheDate(s, [iID, iDate]), scanChildIDsAtTheDate(s, iDate), R.without([iID]))

// NOTE 全血兄弟（２人以上の共通の親を持つ者とする）
const hasSameParentsAtTheDate =
  (s: Store, [_, iDate]: InheritanceTuple, parentIDs: readonly ID[]) =>
  (siblingID: ID): boolean =>
    pipe(
      getParentIDsAtTheDate(s, [siblingID, iDate]),
      R.intersection(parentIDs),
      R.length,
      R.lte(2)
    )

/**
 * 全血兄弟のIDの配列を取得する。
 * 同一の両親を持つIDの配列を取得する。
 */
export const getFullSiblingIDsAtTheDate: GetIDsAtTheDate = (s, t) => {
  const parentIDs = getParentIDsAtTheDate(s, t)
  return pipe(getSiblingIDsAtTheDate(s, t), A.filter(hasSameParentsAtTheDate(s, t, parentIDs)))
}
export const getHalfSiblingIDsAtTheDate: GetIDsAtTheDate = (s, t) =>
  R.symmetricDifference(getSiblingIDsAtTheDate(s, t), getFullSiblingIDsAtTheDate(s, t))

type FullSibs = IDs
type HalfSibs = IDs
export const getSiblingIDsAtTheDateTouple = (
  s: Store,
  t: InheritanceTuple
): [FullSibs, HalfSibs] => {
  const parentIDs = getParentIDsAtTheDate(s, t)
  return pipe(getSiblingIDsAtTheDate(s, t), R.partition(hasSameParentsAtTheDate(s, t, parentIDs)))
}

export const getThirdPriorityAllHeirsIDs = createGetThirdPriorityHeirsIDs(getSiblingIDsAtTheDate)
export const getThirdPriorityFullHeirsIDs = createGetThirdPriorityHeirsIDs(getFullSiblingIDsAtTheDate) // prettier-ignore
export const getThirdPriorityHalfHeirsIDs = createGetThirdPriorityHeirsIDs(getHalfSiblingIDsAtTheDate) // prettier-ignore
