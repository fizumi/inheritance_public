import React from 'react'
import * as R from 'ramda'
import { function as F, option as O, array as A } from 'fp-ts'
import { doRGetTask, rGet } from 'src/utils/fp/common'
import { getHeightAndWidth } from 'src/utils/fp/web'
import useIsomorphicLayoutEffect from '../../../../react/hooks/useIsomorphicLayoutEffect'
import useRefArray from 'src/utils/react/hooks/useRefArray'

declare module 'src/utils/common/debug' { interface Key2any { useMeasureGridRow: never } } // prettier-ignore
// console.setKey('useMeasureGridRow')
/*
    types
*/
type HeightWidth = Record<'height' | 'width', number>
type ItemWidths = Record<'itemWidths', number[]>
type ConstantSize = Record<'itemHeight' | 'colCount' | 'columnGap', number>
type Size = ItemWidths & ConstantSize
type MesuredHandler = (size: Size) => void
type Props = { onMesured?: MesuredHandler }
export type { HeightWidth, ItemWidths, Size, MesuredHandler, Props }

/*
    pure functions
*/
const getConstantSize = (
  containerWidth: number,
  itemHWsInARow: HeightWidth[],
  itemWidths: number[]
): ConstantSize => {
  const itemHeight = itemHWsInARow[0].height /* itemHWsInARow は 特定の行の HW なので 一定 */
  const colCount = itemHWsInARow.length /* 列の数は基本的には一定 */
  const columnGapCount = colCount - 1
  return {
    itemHeight,
    columnGap:
      columnGapCount === 0 ? 0 : (containerWidth - R.sum(itemWidths)) / columnGapCount /*gap*/,
    colCount,
  }
}

/*
    hooks
*/
/**
 * css grid items “1行分” の compulted values を取得する
 * state を持たない
 *
 * 1. grid container と grid item “1行分”(*) の elements を ref prop を用いて取得する
 * 2. 取得した elements を用いて size を測定（measure）する
 *
 * 仕様:
 * - gap は存在しない場合、 0 とする (*gap*)
 *  - ∵ 後々の計算において、undefined を 0 としても差し支えない、かつ  undefined の考慮を省けて楽である
 *  - ※ gap = 0 は 存在しないのか、 0 という値なのか判断出来ないので注意。そのため rowGapWasCalculated を用意した。
 */
export default function useMeasureGridRow(onMesured?: MesuredHandler) {
  // 1.
  const gridContainerRef = React.useRef<HTMLDivElement | null>(null)
  const { createSetRefByIndex, elementsRef: refsOfGridItemInRow, resetElementsRef } = useRefArray()

  const constantSize = React.useRef<ConstantSize>()
  const itemWidths = React.useRef<ItemWidths['itemWidths']>()

  // 2.
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      // console.condlog('useMeasureGridRow', { refsOfGridItemInRow: refsOfGridItemInRow.current, gridContainerRef: gridContainerRef.current, }) // prettier-ignore
      if (R.isEmpty(refsOfGridItemInRow.current))
        return rGet.retry({ 'refsOfGridItemInRow.current is empty': refsOfGridItemInRow.current })
      if (gridContainerRef.current == null) return rGet.retry('gridContainerRef.current is nil')

      return F.pipe(
        getHeightAndWidth(window)(gridContainerRef.current),
        O.matchW(
          () => rGet.cancel('[useMeasureGridRow] It was failed to get pixel size from element'),
          (containerHW) => {
            console.condlog('useMeasureGridRow', { containerHW, 'gridContainerRef.current': gridContainerRef.current, 'refsOfGridItemInRow.current': refsOfGridItemInRow.current, }) // prettier-ignore
            return F.pipe(
              refsOfGridItemInRow.current,
              A.traverse(O.Applicative)((el) => {
                const option = getHeightAndWidth(window)(el)
                console.condlog('useMeasureGridRow', { option, el, class: el.className })
                return option
              }),
              O.matchW(
                () => rGet.retry('[useMeasureGridRow] some getHeightAndWidth failed'),
                (itemHWsInARow) => {
                  itemWidths.current = R.pluck('width', itemHWsInARow)
                  if (constantSize.current === undefined) {
                    constantSize.current = getConstantSize(
                      containerHW.width,
                      itemHWsInARow,
                      itemWidths.current
                    )
                  }
                  if (R.sum(itemWidths.current ?? 0) > 0) {
                    return rGet.success({ itemWidths: itemWidths.current, ...constantSize.current })
                  }
                  return rGet.retry('sum of itemWidths.current is less than equal 0')
                }
              )
            )
          }
        )
      )
    }
    //     Promise.resolve(measure()).then((x) => typeof x === 'string' && console.error(x)).catch
    doRGetTask(
      measure,
      (value) => {
        console.condlog('useMeasureGridRow', 'call onMesured', { itemWidths: itemWidths.current, ...constantSize.current, }) // prettier-ignore
        onMesured?.(value)
      },
      console.error,
      4
    )
  })

  // for putting into deps list using quick fix (react-hooks/exhaustive-deps)
  const itemWidthsCurrent = itemWidths.current
  const constantSizeCurrent = constantSize.current

  return {
    size: React.useMemo(
      () => ({
        itemWidths: itemWidthsCurrent,
        ...constantSizeCurrent,
      }),
      [constantSizeCurrent, itemWidthsCurrent]
    ),
    gridContainerRef,
    createSetRefByIndex,
    refsOfGridItemInRow,
    resetElementsRef,
  }
}
