import { either as E, function as F, readonlyRecord as RR } from 'fp-ts'
import * as J from 'fp-ts/Json'
import * as R from 'ramda'
import { array2recordBy, _remove_me_v3 } from 'src/utils/fp/common'
import { addTest, TestFunction, TestMethodParams, toSimplePredicate } from 'src/utils/fp/common/yup'
import { hasDupulicate } from 'src/utils/common'
import { FormikErrors, yupToFormErrors } from 'src/libraries/formik'
import tb from 'ts-toolbelt'
import * as yup from 'yup'
import {
  ColKeysExceptForID,
  COLS,
  fieldKeys,
  IP,
  IsParent,
  JA,
  key,
  Marriage,
  RelationKey,
  RELS,
  RID,
  RID2,
  Store,
} from '../model'

/*

目的
- 外部データ (ユーザーが手入力したデータ以外) の入力を許容するかどうかを判定する

*/

// -------------------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------------------
const boolean = yup.boolean()
const string = yup.string()
const nullableString = string.nullable()

const testFnCreator = (fn: (value: any, values: Store) => boolean): TestFunction => {
  return (...[value, ctx]: Parameters<TestFunction>) => {
    const values = ctx.options?.context as Store
    if (values == null) throw new Error('you should provide FormikValue as context.')
    return fn(value, values)
  }
}
const object = yup.object()
const recordSchema = object.noUnknown()

/*
    custom tests
*/
const isValidIDKeys: TestMethodParams = [
  'idKeysArevalid',
  '${path} has invalid id key.',
  testFnCreator((value, values) => {
    const ids = values[COLS].id
    const keys = RR.keys(value)
    return ids.length === keys.length && keys.every(R.includes(R.__, ids))
  }),
]

const getIsValidRIDKeys: (k: RelationKey) => TestMethodParams = (k) => [
  'relIDKeysArevalid',
  '${path} has invalid relID key.',
  testFnCreator((value, values) => {
    const ids = values[COLS].id
    const keys = RR.keys(value)
    return keys.every((k === 'jointAdoption' ? RID2.isValidRelID2to1 : RID.isValidRelID)(ids))
  }),
]

const isValidValue = (valuePred: R.Pred): TestMethodParams => [
  'isValidValue',
  '${path} has invalid value.',
  (value, _ctx) => {
    return Object.values(value).every(valuePred)
  },
]

// const oneOfIDs: TestMethodParams = [
//   'isOneOfIDs',
//   '${path} is not valid ID.',
//   testFnCreator((value, values) => {
//     if (RA.isNotArray(values?.cols?.id)) return false
//     return values.cols.id.includes(value)
//   }),
// ]

// -------------------------------------------------------------------------------------------------
// fields
// -------------------------------------------------------------------------------------------------
const idMapSchema = yup.object().test(...isValidIDKeys)

const fieldSchemas = {
  [key.name]: string,
  [key.deathDate]: nullableString,
  [key.portionOfInheritance]: string,
  [key.isAlive]: boolean,
} as const

const fieldValuePreds = RR.map<yup.BaseSchema, (value: any) => boolean>(toSimplePredicate)(
  fieldSchemas
)

const idMapSchemaRecord = F.pipe(
  R.without([key.id], fieldKeys) as ColKeysExceptForID[],
  array2recordBy((k: ColKeysExceptForID) => [
    k,
    k in fieldValuePreds ? idMapSchema.test(...isValidValue(fieldValuePreds[k])) : idMapSchema,
  ])
  // A.reduce({} as Record<string, yup.BaseSchema>, (acc, key) => {
  //   const validate = valueValidators[key]
  //   return R.assoc(key, validate ? idMapSchema.test(...isValidValue(validate)) : idMapSchema, acc)
  // })
)

const idsSchema = yup
  .array(string.required())
  .required()
  .concat(
    addTest(yup.array())(
      { hasNoDupulicate: R.complement(hasDupulicate) },
      '${path} has dupulicate ID.'
    )
  )

const colsSchema = recordSchema
  .shape({
    [key.id]: idsSchema,
    [key.pseudoParents]: yup.mixed(),
    [key.pseudoSpouses]: yup.mixed(),
  })
  .shape(idMapSchemaRecord)

// -------------------------------------------------------------------------------------------------
// relations
// -------------------------------------------------------------------------------------------------
const getRIDMapSchema = (k: RelationKey) => yup.object().test(...getIsValidRIDKeys(k))
const relationSchema = yup
  .object({
    startDate: nullableString,
    endDate: nullableString,
  })
  .required()

const relsSchemas = {
  [key.marriage]: yup
    .object({
      endDate: nullableString,
    })
    .required(),
  [key.isParent]: relationSchema.shape({
    type: yup
      .mixed()
      .required()
      .oneOf([...IP.types]),
  }),
  [key.jointAdoption]: relationSchema.shape({
    type: yup
      .mixed()
      .required()
      .oneOf([...JA.types]),
  }),
} as const

const relationPreds = RR.map<yup.BaseSchema, (value: any) => boolean>(toSimplePredicate)(
  relsSchemas
)

const relIDMapSchemaRecord = F.pipe(
  relsSchemas,
  RR.mapWithIndex((k, _: yup.BaseSchema) =>
    getRIDMapSchema(k).test(...isValidValue(relationPreds[k]))
  )
)
const relsSchema = recordSchema.shape(relIDMapSchemaRecord)

// -------------------------------------------------------------------------------------------------
// store
// -------------------------------------------------------------------------------------------------
export const formikValuesSchema = recordSchema.shape({
  [COLS]: colsSchema,
  [RELS]: relsSchema,
})

// https://github.com/jquense/yup#mixedvalidatevalue-any-options-object-promiseany-validationerror
const options = {
  abortEarly: false, // return from validation methods on the first error rather than after all validations run.
  stripUnknown: false, // remove unspecified keys from objects. (idMap では key は unknown なので false)
}

/**
 * 必須プロパティの存在をチェック
 * ID の欠損のチェック
 * Form に表示されない内部的な値のチェック
 */
export const safeValidateSyncBeforeLoad = (x: J.Json): E.Either<FormikErrors<Store>, Store> =>
  F.pipe(
    E.tryCatch(
      () => formikValuesSchema.validateSync(x, { ...options, context: x as any }) as any,
      _remove_me_v3
    ),
    E.mapLeft(yupToFormErrors)
  )

// -------------------------------------------------------------------------------------------------
// type check
// -------------------------------------------------------------------------------------------------
// https://github.com/jquense/yup/blob/master/docs/typescript.md
type SchemaMarriage = yup.Asserts<typeof relsSchemas['marriage']>
type SchemaParent = yup.Asserts<typeof relsSchemas['isParent']>
;() =>
  // prettier-ignore
  tb.Test.checks([
    tb.Test.check< tb.Any.Is<tb.O.Keys<SchemaMarriage>,tb.O.Keys<Marriage>, 'equals'>, tb.B.True, tb.Test.Pass >(),
    tb.Test.check< tb.Any.Is<tb.O.Keys<SchemaParent>,tb.O.Keys<IsParent>, 'equals'>, tb.B.True, tb.Test.Pass >(),
  ])
