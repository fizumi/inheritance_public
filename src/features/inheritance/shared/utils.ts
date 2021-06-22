/*
    ライブラリに依存しているため, src/common/utils 配下には配置したくない関数
    or
    src/common/utils 配下に配置するほど再利用可能性が高くない関数
*/
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { function as F, io, option as O } from 'fp-ts'
import * as R from 'ramda'
import { fraction, isInteger } from 'mathjs'
import { OtoBoolean, sameSetOfStrings } from 'src/utils/fp/common'
import { ID } from './types'

export const equalsIDs =
  (ids1: readonly ID[]) =>
  (ids2: readonly ID[]): boolean =>
    sameSetOfStrings(ids1, ids2)

// fn に型情報を与えるだけ
export const withLabel =
  <Fn extends (label: string) => any>(fn: Fn) =>
  (label: string): ReturnType<Fn> =>
    fn(label)

export const canBeFraction = (x: any): boolean =>
  F.pipe(io.of(x), io.map(fraction), O.tryCatch, OtoBoolean)

export const safeIsInteger = (x: any) =>
  F.pipe(
    O.tryCatch(() => isInteger(x)),
    O.foldW(R.F, R.identity)
  )
