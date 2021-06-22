import * as R from 'ramda'
import React from 'react'
import { ID } from 'src/features/inheritance/model'
import constate from 'src/libraries/constate'

export const [AppClipboardProvider, useAppClipboard, useAppClipboardDispatcher] = constate(
  () => {
    const [copiedIDs, setCopiedIDs] = React.useState<ID[]>([])
    const push = React.useCallback((id: ID) => setCopiedIDs(R.union([id])), [])
    const remove = React.useCallback((index: number) => setCopiedIDs(R.remove(index, 1)), [])
    const clear = React.useCallback(() => setCopiedIDs([]), [])

    return {
      copiedIDs,
      dispatcher: React.useMemo(
        () => ({ setCopiedIDs, push, clear, remove }),
        [clear, push, remove]
      ),
    }
  },
  (value) => value,
  (value) => value.dispatcher
)
