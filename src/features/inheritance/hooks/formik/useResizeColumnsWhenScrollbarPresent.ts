import React from 'react'
import { delay } from 'src/utils/common'
import { useColumn } from './formik'
import { useResetGrid } from '../useDoubleGridWithChangeOrderByDnDAndResizeColumn'
import { useScrollbarPresence } from 'src/utils/react/hooks'

export const useResizeColumnsWhenScrollbarPresentBK = (): void => {
  const ids = useColumn('id')
  const isScrollbarPresent = useScrollbarPresence([ids.length])
  const resetGrid = useResetGrid()
  React.useEffect(() => {
    delay(() => isScrollbarPresent.current.vertical, resetGrid)
  }, [isScrollbarPresent, isScrollbarPresent.current.vertical, resetGrid])
}
