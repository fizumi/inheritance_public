import { ID, Store } from 'src/features/inheritance/model'

export type MyFormikValues = Store
export type FormRows = Record<ID, Record<string, any>> // 具体的な形は動的に確定させる
export type TouchedOfAFieald = undefined | Record<string, undefined | boolean>
export type ErrorOfAFieald = undefined | Record<string, undefined | string>
