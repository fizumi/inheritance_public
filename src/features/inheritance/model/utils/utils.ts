/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { function as F, readonlyArray as A, readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'
import { toReducer } from 'src/utils/common'
import * as yup from 'yup'
import { label, Store } from '..'
import * as lens from '../lens'
import { ID } from '../../shared/types'

/*
    basic
*/
type StoreEndomorphism = F.Endomorphism<Store>

export const die: (id: ID) => StoreEndomorphism = (id) => R.set(lens.isAlive(id), false)
export const dieSimultaneouslyIn = (s: Store): ((ids: readonly ID[]) => Store) =>
  A.reduce(s, toReducer(die))

export const setDeathDate: (id: ID, date: string) => StoreEndomorphism = (id, date) =>
  R.set(lens.deathDate(id), date)

export const setSameDeathDate: (date: string, ids: ID[]) => StoreEndomorphism =
  (date, ids) => (s) =>
    ids.reduce((s, id) => R.set(lens.deathDate(id), date, s), s)

export const setDeath: (id: ID, date: string) => StoreEndomorphism = (id, date) =>
  F.flow(die(id), setDeathDate(id, date))

export const alive = F.flow(lens.isAlive, (lens) => R.view(lens))
export const aliveIn =
  (s: Store) =>
  (id: ID): boolean =>
    s.cols.isAlive[id]

export const filterAliveIdsIn =
  (s: Store) =>
  (ids: readonly ID[]): ID[] =>
    ids.filter(aliveIn(s))

export type Schemas = yup.BaseSchema | yup.BaseSchema[]

export type SchemasMaker = (label: string) => Schemas

// fn に型情報を与えるだけ
export const provideLavel = RR.mapWithIndex((key: string, fn: SchemasMaker) =>
  fn((label as any)[key])
) as <T extends Record<string, SchemasMaker>>(field2schemasMaker: T) => Record<keyof T, Schemas>
