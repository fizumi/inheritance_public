import * as R from 'ramda'
import React from 'react'
import { mergeable } from 'src/utils/common'
import useChangeOrderByDnDWithGrid, {
  IDsorItems,
  Item,
  Props as DnDProps,
} from './useChangeOrderByDnDWithGrid'
// import { useDependenciesDebugger, log } from 'src/hooks'
import useResizeGridColumns, { Props as ResizeGridColumnsProps } from './useResizeGridColumns'

export type { Item }

export type Props<T extends IDsorItems = any[]> = Omit<DnDProps<T>, 'size'> &
  Omit<ResizeGridColumnsProps, 'rowCount'>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useDoubleGridWithChangeOrderByDnDAndResizeColumn<T extends IDsorItems>(
  props: Props<T>
) {
  const { items, setItems, movingMilliSec, ...RGCProps } = props
  const { size, resetGrid, resizeHandlers, ...RGC } = useResizeGridColumns(RGCProps)
  const CODnD = useChangeOrderByDnDWithGrid({ items, setItems, movingMilliSec, size })

  /**
   * 戻り値のオブジェクトのプロパティ値はすべてメモ化されている
   */
  const useGridDndResizeColRow = (index: number) => {
    // return React.useMemo(() => ({ index }), [])
    const { beingDraggedIndex } = CODnD.state
    const { getNotBeingDraggedStyle, getBeingDraggedStyle } = CODnD.row
    const { rowContainerStyle, ...others } = RGC.row
    const getDnDHandlerProps = CODnD.getDnDHandlerProps

    const beingDragged = beingDraggedIndex === index

    const notDragedProps = React.useMemo(
      () =>
        R.mergeDeepRight(mergeable(getNotBeingDraggedStyle(index)), { style: rowContainerStyle }),
      [getNotBeingDraggedStyle, index, rowContainerStyle]
    )

    const dndHandlerProps = React.useMemo(
      () => getDnDHandlerProps(index),
      [getDnDHandlerProps, index]
    )

    const beingDraggedProps = React.useMemo(
      () => R.mergeDeepRight(mergeable(getBeingDraggedStyle(index)), { style: rowContainerStyle }),
      [getBeingDraggedStyle, index, rowContainerStyle]
    )

    const commonRet = { dndHandlerProps, ...others, beingDragged }

    if (!beingDragged) {
      return {
        rowContainerProps: notDragedProps,
        ...commonRet,
      }
    }

    return {
      rowContainerProps: beingDraggedProps,
      ...commonRet,
    }
  }

  // useDependenciesDebugger(
  //   { 'CODnD.row': CODnD.row, 'RGC.row': RGC.row },
  //   log('useDoubleGridWithChangeOrderByDnDAndResizeColumn', '')
  // )
  // useDependenciesDebugger( { 'CODnD.container': CODnD.container, 'RGC.container': RGC.container }, log('useDoubleGridWithChangeOrderByDnDAndResizeColumn', ''), true) // prettier-ignore
  return {
    state: CODnD.state,
    container: {
      ...RGC.container,
      ...CODnD.container,
      containerStyle: React.useMemo(
        () => ({
          ...RGC.container.containerStyle,
          ...CODnD.container.containerStyle,
        }),
        [CODnD.container.containerStyle, RGC.container.containerStyle]
      ),
    },
    useGridDndResizeColRow,
    getDnDHandlerProps: CODnD.getDnDHandlerProps,
    size,
    resetGrid,
    resizeHandlers,
  }
}
