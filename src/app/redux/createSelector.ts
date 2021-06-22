import * as R from 'ramda'
import { DefaultRootState } from 'react-redux'
import * as tb from 'ts-toolbelt'

export const createSelector = R.path as <P extends tb.L.List<string | number>>(
  path: P
) => (obj: DefaultRootState) => tb.O.Path<DefaultRootState, P>

// slice -> reducer ----↓
// slice -> reducer -> RootState (個々の reducer を合成することで全体の state が決まる)
// slice -> reducer ----↑
//
// 上記のように、RootState は 個々の slice に依存する
// そのため、個々の slice に RootState に依存する createSelector を import すると、
// 通常は 循環参照 となる。
// そこで、RootState を DefaultRootState に「宣言のマージ」を用いてマージする。
// これにより、循環参照を回避することが出来る。
