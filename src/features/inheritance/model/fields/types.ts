import tb from 'ts-toolbelt'
import { Class2Record } from 'src/utils/types'
import { GetIDArrayAndIDMapRecord } from 'src/utils/fp/common'
import { ID } from '../../shared/types'
import { function as F } from 'fp-ts'
import * as R from 'ramda'

export const fieldKeys = [
  'id',
  'name',
  // 'birthDate',
  'deathDate',
  // 'deathOrder',
  'portionOfInheritance',
  'isAlive',
] as const
export const pseudoFieldKeys = ['pseudoParents', 'pseudoSpouses'] as const
export const allFieldKeys = [...fieldKeys, ...pseudoFieldKeys] as const
export type FieldKeys = typeof fieldKeys[number]
export type PseudoFieldKeys = typeof pseudoFieldKeys[number]
export type AllFieldKeys = FieldKeys | PseudoFieldKeys
export type ColKeysExceptForID = tb.U.Exclude<FieldKeys, 'id'>

// input 要素で使うことを前提としているので、基本 string を使う。
// uncontrolled input warning を回避するため、null, undefined は避ける。
// ただし、deathDate では Mui Date Picker を使うため null を許容し、初期値に null を使う。
export const isPseudoField = (field: string): field is PseudoFieldKeys => field.startsWith('pseudo')
pseudoFieldKeys.forEach(R.when(R.complement(isPseudoField), F.hole)) // assertion

// Parameter properties によるオブジェクトの定義
export class FieldClass implements Record<FieldKeys, any> {
  constructor(
    public id: ID = '',
    public name: string = '',
    // public birthDate: string | null = null,
    public deathDate: string | null = null,
    // public deathOrder: string = '',
    public portionOfInheritance: string = '',
    public isAlive: boolean = true
  ) {}
}
export type Row = Class2Record<FieldClass> // src/common/utils/idMap で画一的に処理できる単位
export type WebCol = GetIDArrayAndIDMapRecord<Row> & Partial<Record<PseudoFieldKeys, any>>
// memo
// ↓ class は AnyObj を extends できない
// tb.Test.checks([tb.Test.check<tb.Any.Is<AnyObj, WebRow, '<-extends'>, tb.B.True, tb.Test.Pass>()])

export const defaultWebRow = (): Row => new FieldClass()
export const compensateRow = (r: Partial<Row>): Row => R.mergeRight(defaultWebRow(), r)
