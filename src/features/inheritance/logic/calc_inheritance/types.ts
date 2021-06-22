/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MapOmit, tag, Tagged, ValueOrArray } from 'src/utils/types'
export { tag } from 'src/utils/types'
export type { Tagged } from 'src/utils/types'
export type { ID } from '../../shared/types'

export type RecursiveIDs = ValueOrArray<string>[]

/* BloodRelatives は相互に排他的である（交差しない）ことをロジックだけでなく、型情報においても示したいため、
タグ付き合併型（tagged union types）を用いる */
export const siblings = 'siblings' as const
export type BloodRelativeTagNames = TagNamesOf<BloodRelatives>
export type Spouses = Tag<
  {
    spouses: RecursiveIDs
  },
  BloodRelativeTagNames
>
export type Descendants = Tag<{
  descendants: RecursiveIDs
}>
export type Ancestors = Tag<{
  ancestors: RecursiveIDs
}>
export type Siblings = Tag<{
  [siblings]: RecursiveIDs
}>
export type SubdividedSiblings =
  | Siblings
  | {
      [tag]: typeof siblings
      fullSiblings: RecursiveIDs
      halfSiblings: RecursiveIDs
    }

type _Sample_BloodRelativeAndSpouseAreIntersectable = Siblings & Spouses
type _Sample_ThisIsNever = Siblings & Ancestors // not intersectable
export type BloodRelatives<S = Siblings> = Descendants | Ancestors | S // discriminated unions

/**
 * 相続人。
 * Key が 相続人の種類（配偶者、血族（尊属、卑属、兄弟））、Value が ID の配列である、Object。
 * 法定相続人の組み合わせは convertIntoIDsAndStatutorySharePair 関数を参照。
 */
export type Heirs<S = Siblings> = Spouses | BloodRelatives<S> | (Spouses & BloodRelatives<S>)

export const statutoryShareValues = ['1/1', '1/2', '1/3', '2/3', '1/4', '3/4'] as const

/**
 * 法定相続分
 */
export type StatutoryShare = typeof statutoryShareValues[number]
type CalculatedSS = string

/**
 * 相続分
 */
export type Share = math.MathType | CalculatedSS
export type IDsAndShare = [RecursiveIDs, Share]
export type Tag<T, Intersectable = never> = T extends Record<string, RecursiveIDs>
  ? T & Record<typeof tag, keyof T | Intersectable>
  : never

/**
 * Heirs に 法定相続分 情報 を追加する。
 * Heirs を、
 * Key が 相続人の種類('spouses'等)、
 * Value が [ IDの配列, 法定相続分 ] （タプル）である、
 * Objectに変形する。
 */
export type SetShare<T, SS = Share> = T extends Tagged
  ? { [K in keyof T]: K extends typeof tag ? T[K] : [T[K], SS] }
  : never

// util
const emptyObject = {} as const
export type AnyObject = typeof emptyObject // 空のObject型になるとも思えるが、AnyObject
/* 上記実装で 空のObject型 とならないことを記録に残すため、AnyObject の定義に Record<string, any> を用いない。 */
/* export const empty = 'empty' as const
   export const emptyObj = { [tag]: empty }
空のオブジェクトを表現する方法として tag を用いるしかないと思っていたが、
fp-ts で Record<string, never> を用いているを発見したため、この表現に変更 */
export type AnyValue<T extends Record<string, unknown>> = {
  [K in keyof T]: K extends typeof tag ? T[K] : unknown
}
type _Sample_AnyValue = AnyValue<Siblings>
type _Sample_AnyValue1 = AnyValue<Spouses>
type _Sample_AnyValue2 = AnyValue<(Spouses & Siblings) | Siblings>
export type KeysOf<T> = T extends any ? Exclude<keyof T, typeof tag> : never
type _Sample_KeysOf = KeysOf<Heirs>
export type TagNamesOf<T> = T extends Tagged ? T[typeof tag] : never
type _Sample_TagNamesOf = TagNamesOf<Heirs>
type _Sample_MapOmit = MapOmit<(Spouses & Siblings) | Siblings, typeof siblings>
