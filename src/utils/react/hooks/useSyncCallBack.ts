import { useCallback, DependencyList, useEffect } from 'react'

/**
 * callback 内で setState を使わない。
 * @param callback
 * @param deps
 */
export default function useSyncCallBack<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncCallBack = useCallback(callback, deps) as T

  useEffect(() => {
    syncCallBack()
  }, [syncCallBack])

  return syncCallBack
}
