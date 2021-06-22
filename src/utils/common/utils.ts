// type A2B<A, B, S> = (S extends A ? B : S) | (A extends S ? B : S)
// export const createA2B = <A, B>(a: A, b: B) => <S>(src: S | A): A2B<A, B, S> => (src === a ? b : src) as A2B<A, B, S>
export const createIdentityOrA2B = <A, B, S>(a: A, b: B) =>
  [
    (src: S | A): S | B => (src === a ? (b as B) : (src as S)),
    (src: S | B): S | A => (src === b ? (a as A) : (src as S)),
  ] as const
// export const csv2array = (csv: string): string[] => csv.split(',') // さすがにこれは R.split でいいと思った。
// export const array2csv = (csv: string[]): string => csv.join(',') // さすがにこれは R.join でいいと思った。
// prettier-ignore
export const [emptyStr2zero, zero2emptyStr] =
  createIdentityOrA2B<'', 0, number>('', 0)
// prettier-ignore
export const [emptyStr2zeroStr, zeroStr2emptyStr] =
  createIdentityOrA2B<'', '0', string >('', '0')

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const has = (prop: string | number | symbol, obj: any): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/*
    以下、deprecated
*/
// deprecated ∵ R.ifElse(isNotNil, f, R.T) とした方が読みやすい
export const unlessNullable: <A>(f: (a: A) => boolean) => (a: A | null | undefined) => boolean =
  (f) => (a) =>
    a ? f(a) : true

// const getIndex = (path: string) => Number(path.replace(/.*\[(\d+)\].*/, '$1'))
export const __DEV__ = !!process.env.NODE_ENV
