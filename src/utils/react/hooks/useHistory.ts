import * as React from 'react'
import { useGlobalKeyDown } from 'src/utils/react/hooks'
import { setMyDebugMethodToConsole } from 'src/utils/common'

setMyDebugMethodToConsole()
// console.setKey('history')

const INITIAL_INDEX = 0
const MAX_UNDOS = 100

export default function useHistory<T, U extends (values: React.SetStateAction<T>) => any>(
  value: T,
  setValue: U,
  option?: {
    skipWhen?: (value: T) => boolean
    max_undos?: number
  }
) {
  const history = React.useRef([] as T[])
  const historyIndex = React.useRef(INITIAL_INDEX)
  const isTimeShifting = React.useRef(false)

  const max_undos = option?.max_undos || MAX_UNDOS
  React.useMemo(
    () => {
      // 1. undo or redo による変更の場合, 処理を skip
      if (isTimeShifting.current) {
        isTimeShifting.current = false
        console.condlog('history', 'skip unshift history because of isTimeShifting', history.current, historyIndex.current) // prettier-ignore
        return
      }

      // 2. skipWhen が true の場合, 処理を skip
      if (option?.skipWhen?.(value)) return

      // 3. undo redo 以外による変更の場合
      {
        // 3. 1. 現在INDEX が先頭でない場合（過去データ参照中の場合）, 現在INDEXを先頭に戻す
        if (historyIndex.current !== INITIAL_INDEX) {
          history.current.splice(0, historyIndex.current)
          isTimeShifting.current = false
          historyIndex.current = INITIAL_INDEX
        }

        // 3. 2. 最新データを history の先頭に追加する. historyのデータ数がMAXの場合, 超過データを削除する.
        history.current.unshift(value)
        if (history.current.length > max_undos) history.current.length = max_undos
        console.condlog('history', 'unshift history', history.current, historyIndex.current)
      }
    },
    // 保存 対象である value が変更された場合のみ実行
    [value] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const undo = React.useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return false
    console.condlog('history', 'undo')
    isTimeShifting.current = true
    setValue(history.current[++historyIndex.current])
    return true
  }, [setValue])

  const redo = React.useCallback(() => {
    if (historyIndex.current <= INITIAL_INDEX) return false
    console.condlog('history', 'redo')
    isTimeShifting.current = true
    setValue(history.current[--historyIndex.current])
    return true
  }, [setValue])

  // chrome extension によっては動作しない
  useGlobalKeyDown({
    z: (event) => {
      if (event.ctrlKey) {
        undo()
        event.preventDefault()
      }
    },
    y: (event) => {
      if (event.ctrlKey) {
        redo()
        event.preventDefault()
      }
    },
  })

  return { undo, redo }
}
