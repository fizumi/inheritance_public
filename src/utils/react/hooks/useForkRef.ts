import * as React from 'react'
import { setRef } from '@material-ui/core/utils' // https://github.com/mui-org/material-ui/blob/next/packages/material-ui-utils/src/setRef.ts

export default function useForkRef<T>(
  refA: React.Ref<T> | null | undefined,
  refB: React.Ref<T> | null | undefined
): React.RefCallback<T> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return React.useMemo(() => {
    if (refA == null && refB == null) {
      return null
    }
    return (refValue) => {
      setRef(refA, refValue)
      setRef(refB, refValue)
    }
  }, [refA, refB])
}
