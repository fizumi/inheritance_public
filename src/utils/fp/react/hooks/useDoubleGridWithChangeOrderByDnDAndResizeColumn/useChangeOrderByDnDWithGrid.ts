import { array as A, function as F } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'
import { styled } from 'src/utils/web/styled.echo'
import { log, useDependenciesDebugger } from 'src/utils/react/hooks'
// import { css } from '@emotion/react'
import useCurrent from '../../../../react/hooks/useCurrent'
import useConstRefCallback from '../../../../react/hooks/useConstRefCallback'
import useControlledWithDispatcher from '../../../../react/hooks/useControlledWithDispatcher'
import useDragAndDropWithIndex from '../../../../react/hooks/useDragAndDropWithIndex'
import useGlobalCSS from '../../../../react/hooks/useGlobalCSS'
import useOffsetFromMouseDownPoint from '../useOffsetFromMouseDownPoint'

/*
    types
*/
type ID = string
export type Item = {
  id: ID
}
export type IDorItem = Item | ID
export type IDsorItems = Item[] | ID[] // (Item | Id)[] という型は ✖（ T[] は使わない）

export type ItemsSize = Partial<Record<'itemHeight', number>> & Record<'width' | 'rowGap', number>
type Heights = Record<'itemHeight' | 'rowGap', number>

// https://reactjs.org/docs/dom-elements.html
// const noselect = (on: boolean) => {
//   const value = on ? 'none' : 'initial'
//   return {
//     MozUserSelect: value,
//     WebkitUserSelect: value,
//     msUserSelect: value,
//     userSelect: value,
//     OUserSelect: value,
//   } as const
// }

/*
    pure functions
*/

//  ↓
//  ↓  basic

const isItem = (x: ID | Item): x is Item => R.has('id', x)
const isItems = (x: readonly [ID | Item, (ID | Item)[]]): x is [Item, Item[]] => isItem(x[0])

const removeOne =
  <A>(as: A[]) =>
  (index: number) =>
    R.remove(index, 1, as)

const findIndexByItem: (x: [Item, Item[]]) => number = ([a, as]) =>
  R.findIndex(R.propEq('id', a.id), as)

const findIndexById: (x: [ID, ID[]]) => number = ([a, as]) => as.findIndex((v) => v === a)

const findIndexBy =
  <A extends ID | Item>(a: A) =>
  <AS extends ID[] | Item[]>(as: AS): number => {
    const x = [a, as] as [A, AS]
    if (isItems(x)) {
      return findIndexByItem(x)
    }
    return findIndexById(x as [ID, ID[]])
  }

const removeByItem = (x: [Item, Item[]]) => F.pipe(findIndexByItem(x), removeOne(x[1]))

const removeById = (x: [ID, ID[]]) => F.pipe(findIndexById(x), removeOne(x[1]))

const remove =
  <A extends ID | Item>(a: A) =>
  <AS extends ID[] | Item[]>(as: AS) => {
    const x = [a, as] as [A, AS]
    if (isItems(x)) {
      return removeByItem(x)
    }
    return removeById(x as [ID, ID[]])
  }

const isOutOfRange = (arrayLength: number) => (index: number) =>
  !(0 <= index && index < arrayLength)

const NotEqualPrevious =
  <A extends any[]>(prev: A) =>
  (current: A): boolean =>
    !R.equals(prev, current)

//  ↓
//  ↓  calc tops of item's absolute position

const calcTop =
  ({ itemHeight, rowGap }: Heights) =>
  (index: number) =>
    (itemHeight + rowGap) * index

const calcDraggingTopByItem =
  <AS extends ID[] | Item[]>(itemsWhileBeingDragged: AS, hs: Heights) =>
  (item: AS[number]) =>
    F.pipe(itemsWhileBeingDragged, findIndexBy(item), calcTop(hs))

const calcTopsOfItems = <AS extends ID[] | Item[]>(items: AS, hs: Heights) =>
  F.pipe(items, A.mapWithIndex<AS[number], number>(calcTop(hs)))

const calcTopsWhileBeingDragged = <AS extends ID[] | Item[]>(
  itemsWhileBeingDragged: AS,
  items: AS,
  hs: Heights
) => A.Functor.map<AS[number], number>(items, calcDraggingTopByItem(itemsWhileBeingDragged, hs))

/*
    hooks
*/
// export interface Props<T extends Item | Id > { とすると、 T[] は (Item|Id)[] となり、望ましくない
export interface Props<TS extends Item[] | ID[]> {
  items: TS
  setItems?: React.Dispatch<TS>
  size: ItemsSize
  movingMilliSec: number
}

export default function useChangeOrderByDnDWithGrid<TS extends Item[] | ID[]>(props: Props<TS>) {
  type T = TS[number]
  const {
    size: { itemHeight, width, rowGap },
    movingMilliSec = 10,
  } = props
  const [beingDraggedIndex, setBeingDraggedIndex] = React.useState<number | null>(null)
  const [items, setItems] = useControlledWithDispatcher(props.items, props.setItems)
  const [itemsWhileBeingDragged, setItemsWhileBeingDragged] = React.useState(props.items)
  const [isMoving, setMoving] = React.useState(false)
  const { offsetFromMouseDownPoint, mouseHandlers } = useOffsetFromMouseDownPoint()
  const stateRef = useCurrent({ items, isMoving })
  const beAllowedSync = React.useRef(true)

  const itemCount = React.useMemo(() => items.length, [items.length])

  if (beAllowedSync.current === true && items !== itemsWhileBeingDragged) {
    setItemsWhileBeingDragged(items)
  }

  // ※ useEventCallback の使用について
  const updateDraggingOrder = useConstRefCallback(
    (mouseTranslateY: number, beingDragged: T): void => {
      if (beingDraggedIndex === null) return
      if (!itemHeight || !rowGap) return

      const offsetFromOriginalIndex = Math.round(mouseTranslateY / (itemHeight + rowGap))
      const newIndexOfBeingDragged = beingDraggedIndex + offsetFromOriginalIndex

      if (isOutOfRange(itemCount)(newIndexOfBeingDragged)) {
        return
      }

      F.pipe(
        itemsWhileBeingDragged,
        remove(beingDragged) as (list: TS) => TS,
        R.insert(newIndexOfBeingDragged, beingDragged) /*※*/ as unknown as (list: TS) => TS,
        R.when(NotEqualPrevious(itemsWhileBeingDragged), setItemsWhileBeingDragged)
      )
      // ※ insert の Generic Type T[] は (Item|Id)[] となってしまい、 TS に assertion できないため unknown を挟む
    }
  )

  const updateOriginalOrder = useConstRefCallback(() => {
    setMoving(true)
    setTimeout(() => {
      setMoving(false)
      setItems(itemsWhileBeingDragged)
      beAllowedSync.current = true
    }, movingMilliSec)
  })

  /*
      Drag and Drop handlers
  */
  const { getMouseDownHandler } = useDragAndDropWithIndex(
    React.useMemo(
      () => ({
        onMouseDown: (index: number) => (e: React.MouseEvent<Element, MouseEvent>) => {
          console.log(`mouse down`, index)
          beAllowedSync.current = false
          mouseHandlers.onMouseDown(e)
          setBeingDraggedIndex(index)
        },
        onMouseMove:
          (index: number) =>
          (e: MouseEvent): void => {
            const newOffsetFromMouseDownPoint = mouseHandlers.onMouseMove(e)
            if (!newOffsetFromMouseDownPoint) return
            const { items } = stateRef.current
            updateDraggingOrder(newOffsetFromMouseDownPoint.clientY, items[index])
          },
        onMouseUp: () => {
          console.log('mouse up')
          mouseHandlers.onMouseUp()
          setBeingDraggedIndex(null)
          updateOriginalOrder()
        },
        off: stateRef.current.isMoving,
      }),
      [mouseHandlers, stateRef, updateDraggingOrder, updateOriginalOrder]
    )
  )

  const containerStyle = React.useMemo(() => {
    return {
      position: 'relative' as const,
    }
  }, [])

  const isUserDragging = React.useMemo(() => beingDraggedIndex !== null, [beingDraggedIndex])
  const dndHandlerClassName = 'DnDHandlerStyle'
  useGlobalCSS(
    true,
    styled.echo`
      .${dndHandlerClassName} {
        cursor: ${isUserDragging ? 'grabbing' : isMoving ? 'auto' : 'grab'};
      }
    `
  )

  const dndContainerClassName = 'DnDContainerStyle'
  useGlobalCSS(
    true,
    styled.echo`
      .${dndContainerClassName} {
        transition: ${isMoving || isUserDragging
          ? `top ${movingMilliSec}ms, left ${movingMilliSec}ms`
          : 'none'};
        z-index: 1;
        position: absolute;
        ${isUserDragging && itemHeight && width
          ? `height: ${itemHeight}px; width: ${width}px;`
          : ''}
      }
    `
  )

  const heights = React.useMemo(() => {
    if (!itemHeight || !rowGap) return undefined
    return { itemHeight, rowGap }
  }, [itemHeight, rowGap])

  const getBeingDraggedStyle = React.useCallback(
    (index: number) => {
      if (!heights) return undefined // {} にしたいけど、TypeScript が戻り値の型の推論をサボるからできない

      const topsOfItems = calcTopsOfItems(items, heights)

      return {
        className: dndContainerClassName,
        style: {
          top: topsOfItems[index] + offsetFromMouseDownPoint.clientY + 'px',
          left: offsetFromMouseDownPoint.clientX + 'px',
          zIndex: 2,
          transition: 'none',
        },
      }
    },
    [heights, items, offsetFromMouseDownPoint.clientX, offsetFromMouseDownPoint.clientY]
  )

  const getNotBeingDraggedStyle = React.useCallback(
    (index: number) => {
      if (!heights) return undefined

      const topsWhileBeingDragged = calcTopsWhileBeingDragged(
        itemsWhileBeingDragged,
        items,
        heights
      )

      return {
        className: dndContainerClassName,
        style: {
          top: topsWhileBeingDragged[index] + 'px',
          left: '0px',
        },
      }
    },
    [heights, items, itemsWhileBeingDragged]
  )

  const getDnDHandlerProps = useConstRefCallback((index: number) => ({
    onMouseDown: getMouseDownHandler(index),
    className: dndHandlerClassName,
  }))

  const useDndItems = React.useCallback(
    (index: number) => {
      const notBeingDragged = beingDraggedIndex !== index

      const notDragedStyle = getNotBeingDraggedStyle(index)
      const dndHandlerProps = getDnDHandlerProps(index)
      const beingDraggedStyle = getBeingDraggedStyle(index)

      if (notBeingDragged)
        return {
          dndStyle: notDragedStyle,
          dndHandlerProps,
        }

      return {
        dndStyle: beingDraggedStyle,
        dndHandlerProps,
      }
    },
    [beingDraggedIndex, getBeingDraggedStyle, getDnDHandlerProps, getNotBeingDraggedStyle]
  )

  return {
    container: React.useMemo(
      () => ({
        containerStyle,
        items,
        itemsWhileBeingDragged,
      }),
      [containerStyle, items, itemsWhileBeingDragged]
    ),
    row: React.useMemo(
      () => ({
        getNotBeingDraggedStyle,
        getBeingDraggedStyle,
      }),
      [getBeingDraggedStyle, getNotBeingDraggedStyle]
    ),
    getDnDHandlerProps,
    state: {
      isMoving,
      items,
      itemsWhileBeingDragged,
      beingDraggedIndex,
      movingMilliSec,
    },
    useDndItems,
  }
}

/*
  ※ useEventCallback の使用について

    useEventCallback を使わないで普通にコールバック関数を定義した場合、（useCallbackを使おうが使わまいが、）
    コールバック関数のスコープの外にある値（ state 等の deps array に指定する値）は、
    関数読み込み時の“スナップショット”として保持され、コールバック関数が再び読み込まれるまで不変となる。
    そのため、コールバック関数をイベントリスナーに add する場合、 add されてから remove されるまでの間は、
    state 等が変更されても、その変更がコールバック関数に反映されない。
    このような、コールバック関数内で state を使用しており、そのコールバック関数を addEventLisner に渡す場合（※）には、
    useEventCallback を使うと便利。
    （※ 一般化するなら、state を使うコールバック関数の更新が、コールバックを使用する関数に直ちに反映されない場合）
 */
