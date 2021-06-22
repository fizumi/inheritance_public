import React from 'react'
import { memoizeWith } from 'src/utils/fp/common'

/**
 * memoizeWith の cache に useRef を使用したもの
 * keyFn 又は fn が変更された場合, cache は初期化される
 * @param keyFn 基本的には, 参照が変更されない関数を使用する
 * @param fn 基本的には, 参照が変更されない関数を使用する
 */
export default function useMemoize<T extends (...args: readonly any[]) => any>(
  keyFn: (...v: Parameters<T>) => string,
  fn: T
) {
  const cache = React.useRef({})

  return React.useMemo(() => {
    cache.current = {} // 初期化

    return memoizeWith(cache.current)(keyFn, fn)
  }, [keyFn, fn])
}

export const identity = (x: any) => x
