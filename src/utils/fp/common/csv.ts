// https://github.com/react-csv/react-csv
import { constant } from 'fp-ts/lib/function'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import tb from 'ts-toolbelt'
import { getKeysWithoutDuplicate, isArrayArray, isObjectArray, propOrPath } from '.'

export type ObjectArray = Record<string, any>[]
export type ArrayArray = Array<any>[]
export interface LabelKeyObject {
  label: string
  key: string
}

interface Data {
  data: any
  headers?: any
}
interface Adjuncts {
  enclosingCharacter?: string // ["] in ["a","b"]
  separator?: string //          [,] in ["a","b"]
}
interface CSVMaterialsWithObjects extends Adjuncts {
  data: ObjectArray
  headers?: LabelKeyObject[] | string[]
}
interface CSVMaterialsWithArrays extends Adjuncts {
  data: ArrayArray
  headers?: string[]
}
interface CSVMaterialsWithString {
  data: string
  headers?: string
}

export type CSVMaterials = CSVMaterialsWithObjects | CSVMaterialsWithArrays | CSVMaterialsWithString

export const toCSV = (params: CSVMaterials): string => {
  if (withString(params)) return string2csv(params)
  if (withObjectArray(params)) return objs2csv(params)
  if (withArrayArray(params)) return arrays2csv(params)
  throw new TypeError(`Data should be a "String", "Array of arrays" OR "Array of objects" `)
}

export const withString = (m: CSVMaterials): m is CSVMaterialsWithString =>
  typeof m.data === 'string'

export const withObjectArray = (m: CSVMaterials): m is CSVMaterialsWithObjects =>
  isObjectArray(m.data)

export const withArrayArray = (m: CSVMaterials): m is CSVMaterialsWithArrays => isArrayArray(m.data)

export const objects2arrays = (
  objs: ObjectArray,
  headers?: string[] | LabelKeyObject[]
): unknown[][] => {
  headers = headers || getKeysWithoutDuplicate(objs)

  const [headerLabels, headerKeys] = isObjectArray(headers)
    ? [R.pluck('label', headers), R.pluck('key', headers)]
    : [headers, headers]

  const data = objs.map((object) => headerKeys.map((keyOrPath) => propOrPath(keyOrPath)(object)))
  return [headerLabels, ...data]
}

export const joiner = (
  data: any[][],
  { separator = ',', enclosingCharacter = '"' }: Adjuncts
): string =>
  data
    .filter(RA.isNotEmpty)
    .map((row) =>
      row
        .map(R.when(R.isNil, constant('')))
        .map((value) => `${enclosingCharacter}${value}${enclosingCharacter}`)
        .join(separator)
    )
    .join(`\n`)

// prettier-ignore
export const objs2csv = (
  { data, headers, ...adjuncts }: CSVMaterialsWithObjects
):string => joiner(objects2arrays(data, headers), adjuncts)

// prettier-ignore
export const arrays2csv = (
  { data, headers, ...adjuncts }: CSVMaterialsWithArrays
):string => joiner(headers ? [headers, ...data] : data, adjuncts)

// prettier-ignore
export const string2csv = (
  { data, headers }: CSVMaterialsWithString
):string => (headers ? `${headers}\n${data}` : data)

interface DataWithAdjuncts extends Data, Adjuncts {}
// prettier-ignore
const test = () =>{
tb.Test.checks([
  tb.Test.check<tb.Any.Is<keyof DataWithAdjuncts, keyof CSVMaterialsWithObjects, 'equals'>, tb.B.True, tb.Test.Pass>(),
  tb.Test.check<tb.Any.Is<keyof DataWithAdjuncts, keyof CSVMaterialsWithArrays, 'equals'>, tb.B.True, tb.Test.Pass>(),
  tb.Test.check<tb.Any.Is<keyof Data, keyof CSVMaterialsWithString, 'equals'>, tb.B.True, tb.Test.Pass>(),
])
}
