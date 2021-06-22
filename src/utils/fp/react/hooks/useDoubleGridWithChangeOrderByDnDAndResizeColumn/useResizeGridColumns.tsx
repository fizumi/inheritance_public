import { function as F } from 'fp-ts'
import * as R from 'ramda'
import React, { useState } from 'react'
import useDragAndDropWithIndex from '../../../../react/hooks/useDragAndDropWithIndex'
import useGlobalCSS from '../../../../react/hooks/useGlobalCSS'
import useOffsetFromMouseDownPoint from '../useOffsetFromMouseDownPoint'
import useMeasureGridRow from './useMeasureGridRow'

declare module 'src/utils/common/debug' { interface Key2any { useResizeGridColumns: never } } // prettier-ignore
console.setKey('useResizeGridColumns')
/*
    pure functions
*/
const NOT_FASTENED = -1

// const getMeasuredGridTemplateColumns = (itemWidths: number[]) =>
//   itemWidths.map((v) => v + 'px').join(' ')

/*
    hooks
*/
export type Props = {
  containerSize: {
    height: number
    width: number
  }
  itemHeight: number
  columnGap: number
  rowGap: number
  resizeMin?: number
  gridTemplateColumnsStyleArray: string[]
  disableResizeColumIndexes?: number[]
}
/**
 * columns の数が動的に変更されないことを前提とする
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useResizeColumn({
  containerSize,
  itemHeight,
  columnGap,
  rowGap,
  resizeMin = 10,
  gridTemplateColumnsStyleArray,
  disableResizeColumIndexes,
}: Props) {
  const [itemWidths, setItemWidthsInARow] = React.useState<number[]>()
  const {
    size: sizeAtEffect,
    gridContainerRef,
    createSetRefByIndex,
  } = useMeasureGridRow((size) => {
    if (!itemWidths) {
      setItemWidthsInARow(size.itemWidths)
    }
  })
  const colCount = gridTemplateColumnsStyleArray.length
  const columnRefs = React.useMemo(
    () => R.times(createSetRefByIndex, colCount),
    [createSetRefByIndex, colCount]
  )

  const [fastenedIndex, setFastenedIndex] = React.useState<number>(NOT_FASTENED)
  const fasten = (index: number) => setFastenedIndex((prev) => (prev < index ? index : prev)) // 一番大きい index より左側を固定
  const unfasten = () => setFastenedIndex(NOT_FASTENED)

  const [beingResizedIndex, setBeingResizedIndex] = useState<number | null>(null)

  const { mouseHandlers } = useOffsetFromMouseDownPoint()

  const container = React.useMemo(
    () => ({
      gridContainerRef,
      containerStyle: {},
    }),
    [gridContainerRef]
  )

  const rowContainerStyle = React.useMemo(
    () => ({
      display: 'grid',
      width: containerSize.width,
      gridTemplateColumns: itemWidths
        ? itemWidths
            .map((v, i) => (i <= fastenedIndex ? v + 'px' : gridTemplateColumnsStyleArray[i]))
            .join(' ')
        : gridTemplateColumnsStyleArray.join(' '),
      gridAutoRows: itemHeight + 'px',
      columnGap: columnGap + 'px',
    }),
    [itemWidths, columnGap, itemHeight, gridTemplateColumnsStyleArray, fastenedIndex, containerSize.width] // prettier-ignore
  )

  const beingResized = React.useMemo(() => beingResizedIndex !== null, [beingResizedIndex])
  useGlobalCSS(beingResized, `html { cursor: col-resize; }`)

  const thisColBeingResized = React.useCallback(
    (index: number) => beingResizedIndex === index,
    [beingResizedIndex]
  )

  // useDependenciesDebugger( { setItemWidthsInARow, mouseHandlers, resizeMin, size, }, log('useResizeGridColumns', ''), true) // prettier-ignore
  const { getMouseDownHandler } = useDragAndDropWithIndex(
    React.useMemo(
      () => ({
        onMouseDown: (index) => (e: React.MouseEvent<Element, MouseEvent>) => {
          console.log(`mouse down`)
          mouseHandlers.onMouseDown(e)
          setBeingResizedIndex(index)
        },

        onMouseMove: (index: number) => (e: MouseEvent) => {
          const _itemWidths = itemWidths || sizeAtEffect.itemWidths
          if (!_itemWidths) return _itemWidths
          const newOffsetFromMouseDownPoint = mouseHandlers.onMouseMove(e)
          if (!newOffsetFromMouseDownPoint) return
          const newItemWidth = F.pipe(
            _itemWidths[index] + newOffsetFromMouseDownPoint.clientX,
            R.max(resizeMin)
          )
          const newItemWidths = R.update(index, newItemWidth, _itemWidths)
          fasten(index)
          setItemWidthsInARow(newItemWidths)
        },

        onMouseUp: () => {
          console.log('mouse up')
          mouseHandlers.onMouseUp()
          setBeingResizedIndex(null)
        },
      }),
      [mouseHandlers, itemWidths, resizeMin, sizeAtEffect.itemWidths]
    )
  )

  // hook 内 で component を作成すると、その hook が rerender される度に mount, unmount を引き起こす
  // hook 内 で component の instance を作成するのは“あり”のようだ。
  const resizeHandlers = React.useMemo(
    () => (
      <div
        style={{
          ...rowContainerStyle,
          // gridTemplateColumns: getMeasuredGridTemplateColumns(itemWidths),
          gridAutoRows: '0',
          position: 'relative', // activate z-index
          zIndex: 3,
        }}
      >
        {!colCount
          ? null
          : R.range(0, colCount).map((index) => (
              <div
                key={index}
                data-role={`target-of-measure-${index}`}
                ref={columnRefs[index]}
                style={{ position: 'relative', width: '100%', height: '1px' }}
              >
                {disableResizeColumIndexes &&
                R.includes(index, disableResizeColumIndexes) ? null : (
                  <span
                    style={{
                      position: 'absolute',
                      width: columnGap + 'px',
                      height: containerSize.height + 'px',
                      cursor: 'col-resize',
                      right: `-${columnGap}px`,

                      // color
                      backgroundColor: 'black',
                      opacity: thisColBeingResized(index) ? 0.05 : 0,
                    }}
                    onMouseDown={getMouseDownHandler(index)}
                  />
                )}
              </div>
            ))}
      </div>
    ),
    [
      colCount,
      columnGap,
      columnRefs,
      containerSize.height,
      disableResizeColumIndexes,
      getMouseDownHandler,
      rowContainerStyle,
      thisColBeingResized,
    ]
  )

  // console.condlog('useResizeGridColumns', { rowContainerStyle })
  // console.condlog('useResizeGridColumns', { containerStyle: container.containerStyle })

  const resetGrid = React.useCallback(() => {
    setItemWidthsInARow(undefined)
    unfasten()
  }, [])

  const size = {
    itemHeight,
    rowGap,
    ...containerSize,
  }

  return {
    container: React.useMemo(() => ({ ...container }), [container]),
    row: React.useMemo(
      () => ({
        rowContainerStyle,
        getMouseDownHandler,
        thisColBeingResized,
        beingResized,
      }),
      [beingResized, getMouseDownHandler, rowContainerStyle, thisColBeingResized] // prettier-ignore
    ),
    size,
    resizeHandlers,
    resetGrid,
  }
}
