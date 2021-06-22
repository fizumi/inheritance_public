import { function as F, number, option as O, readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { IP, IPs, IsParent, IsParents, JAs, key, label, Marriages } from '../model'
import { isISO, reduceO } from 'src/utils/fp/common'
import {
  checkIf,
  combineMessageEmitters,
  ErrorMessageOrVoid,
  MessageEmitterWithOptions,
} from 'src/utils/fp/common/validation'
import { contextKey, contextPath, makeTest, toMessageEmitter } from 'src/utils/fp/common/yup'
import tb from 'ts-toolbelt'
import * as yup from 'yup'
import { canBeFraction } from '../shared'

/*

目的:
- ユーザーの手入力の誤りに対して, エラーを出力する

備考:
- アプリケーションが管理している箇所は, アプリケーションをテストすることによって, 入力の正しさを保証する
  - 例えば, ID はアプリケーションが採番するため, ID が string で採番されることを事前にテストすればよく,
    ID が String であることをユーザが手入力する時点で検証する必要はない

*/

/*

    utils
*/
type EmitterCreator = (label: string) => MessageEmitterWithOptions | MessageEmitterWithOptions[]

const provideLavel = RR.mapWithIndex(<K extends string>(key: K, fn: EmitterCreator) =>
  fn((label as any)[key])
)

const dateSchema = (_: string, required = false) => {
  if (required) {
    return makeTest({ isISO }, `「${_}」は必須です。`)
  }
  return makeTest({ isISO }, `「${_}」の入力が正しくありません。`, {
    skipWhen: RA.isNull,
  })
}
const jaDateSchema = (_: string, required = false) => {
  if (required) {
    return makeTest({ isISO }, `共同縁組者が登録されている場合、「${_}」は必須です。`)
  }
  return makeTest({ isISO }, `「${_}」の入力が正しくありません。`, {
    skipWhen: RA.isNull,
  })
}
/**
 * MEMO:
 */
const checkBigamy: MessageEmitterWithOptions<Marriages> = (
  rels,
  options: { arrowBigamous?: boolean }
) => {
  if (options?.arrowBigamous === true) return
  const count = RR.size(rels)
  if (count < 2) return
  const endDateCount = F.pipe(
    rels,
    reduceO(RR.Foldable, number.MonoidSum)(O.map((rel) => (!rel.endDate ? 0 : 1)))
  )
  if (count - endDateCount <= 1) return
  return '重婚となるデータがあります。特定の１つ以外に「離婚日」を設定してください。'
}

/**
 * MEMO: 配偶者の嫡出子を特別養子縁組する場合は，実親子関係１つ，特別養親子関係１つ，というパターンになる
 */
const checkIfPnCRelsCountIsOK = R.cond<IsParents, ErrorMessageOrVoid>([
  [F.flow(RR.size, R.equals(0)), F.constVoid],
  [
    F.flow(IPs.fileterActualOrSpecial, IPs.parentCount, R.gt(2)),
    F.constant('実親子関係または特別親子関係を２つ登録してください。'),
  ],
  [R.T, F.constVoid],
])

// -------------------------------------------------------------------------------------------------
// fields
// -------------------------------------------------------------------------------------------------
export const messageEmitterRecord = F.flow(
  provideLavel,
  RR.map(combineMessageEmitters)
)({
  [key.deathDate]: (_) => toMessageEmitter(dateSchema(_)),
  [key.portionOfInheritance]: (_) =>
    checkIf(canBeFraction, `「${_}」は分数に変換可能な文字である必要があります。`, {
      skipWhen: RA.isEmptyString,
    }),
  [key.pseudoSpouses]: (_) => [checkBigamy],
  [key.pseudoParents]: (_) => [
    checkIf(
      IPs.actualParentCountIsLessThanEqualTwo,
      `３つ以上の実親子関係を登録することは出来ません。`
    ),
    checkIfPnCRelsCountIsOK,
  ],
})

// -------------------------------------------------------------------------------------------------
// relations
// -------------------------------------------------------------------------------------------------
export const marriageSchema = yup.object({
  endDate: dateSchema('離婚日'),
})

export const pseudoPartner = 'pseudoPartner'
export const iPStartDateWithCtx = {
  startDate: yup.mixed().when([contextPath, IP.propDict.type], ((
    ctx_pseudoPartnerField: ReturnType<typeof JAs.getOne>,
    type: IsParent['type'],
    schema: yup.BaseSchema
  ) => {
    if (type !== '養親子') return schema
    // 普通養子縁組の場合は, jaRel が無いときに, 必須にする
    return dateSchema('共同縁組日', ctx_pseudoPartnerField === undefined)
  }) as any),
}
export const pseudoPartnerFieldWithCtx = {
  [pseudoPartner]: yup.mixed().test(
    'pseudoPartnerSpectial',
    `特別養親子関係を登録する場合, 「共同縁組者等」は必須です。`,
    // perf の観点から, 疑似フィールドの値は ctx で渡す
    (_: any, testContext) => {
      const value = testContext.options.context?.[contextKey]
      const ipRel = testContext.parent as IsParent
      if (ipRel.type !== '特別養親子') return true
      return !!value // jaRel は必須
    }
  ),
}
export const isParentSchema = yup.object({
  endDate: dateSchema('離縁日'),
})

/**
 * 前提: context に ReturnType<typeof JAs.getOne> を渡す
 */
export const isParentSchemaForFormik = isParentSchema
  .shape(iPStartDateWithCtx)
  .shape(pseudoPartnerFieldWithCtx)

export const pseudoIsParent = 'pseudoIsParent'
export const jaStartDateWithCtx = {
  startDate: yup.mixed().when([contextPath, IP.propDict.type], ((
    ctx_pseudoIsParentField: IsParent,
    schema: yup.BaseSchema
  ) => {
    // formik で validation する場合は, jaRelExist を context として渡す
    const { type, startDate } = ctx_pseudoIsParentField
    if (type === '実親子') return schema

    // 特別養子縁組の場合は, 共同縁組日は必須
    if (type === '特別養親子') {
      return jaDateSchema('共同縁組日', true)
    }
    // 普通養子縁組の場合は, isParent.startDate がないときに, 必須にする
    return jaDateSchema('共同縁組日', !startDate)
  }) as any),
}
export const jointAdoptionSchema = yup.object({
  endDate: dateSchema('共同離縁日'),
})
/**
 * 前提: context に IsParent を渡す
 */
export const jointAdoptionSchemaForFormik = jointAdoptionSchema.shape(jaStartDateWithCtx)
// -------------------------------------------------------------------------------------------------
// type check
// -------------------------------------------------------------------------------------------------
type SchemaMarriage = yup.Asserts<typeof marriageSchema>
;() =>
  // prettier-ignore
  tb.Test.checks([
    tb.Test.check< tb.Any.Is<keyof SchemaMarriage, keyof IsParent, 'extends->'>, tb.B.True, tb.Test.Pass >(),
  ])
