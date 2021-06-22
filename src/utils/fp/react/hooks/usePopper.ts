/* eslint-disable @typescript-eslint/ban-types */
// 【1】 https://github.com/popperjs/react-popper/blob/master/src/usePopper.js
// 【2】 https://github.com/popperjs/react-popper/blob/master/typings/react-popper.d.ts
import * as React from 'react'
import { createPopper as defaultCreatePopper } from '@popperjs/core'
import * as PopperJS from '@popperjs/core'
// import isEqual from 'react-fast-compare'
import useIsomorphicLayoutEffect from 'src/utils/react/hooks/useIsomorphicLayoutEffect'
import * as R from 'ramda'

/**
 * Simple ponyfill for Object.fromEntries
 */
export const fromEntries = R.fromPairs

// Utility type
type UnionWhere<U, M> = U extends M ? U : never

interface ManagerProps {
  children: React.ReactNode
}
export class Manager extends React.Component<ManagerProps, {}> {}

export type RefHandler = (ref: HTMLElement | null) => void

interface ReferenceChildrenProps {
  // React refs are supposed to be contravariant (allows a more general type to be passed rather than a more specific one)
  // However, Typescript currently can't infer that fact for refs
  // See https://github.com/microsoft/TypeScript/issues/30748 for more information
  ref: React.Ref<any>
}

interface ReferenceProps {
  children: (props: ReferenceChildrenProps) => React.ReactNode
  innerRef?: React.Ref<any>
}
export class Reference extends React.Component<ReferenceProps, {}> {}

export interface PopperArrowProps {
  ref: React.Ref<any>
  style: React.CSSProperties
}

export interface PopperChildrenProps {
  ref: React.Ref<any>
  style: React.CSSProperties

  placement: PopperJS.Placement
  isReferenceHidden?: boolean
  hasPopperEscaped?: boolean

  update: () => Promise<null | Partial<PopperJS.State>>
  forceUpdate: () => Partial<PopperJS.State>
  arrowProps: PopperArrowProps
}

// "offset" | "applyStyles" | "arrow" | "hide" | "computeStyles" | "eventListeners" | "flip" | "preventOverflow" | "popperOffsets"
type StrictModifierNames = NonNullable<PopperJS.StrictModifiers['name']>

export type StrictModifier<Name extends StrictModifierNames = StrictModifierNames> = UnionWhere<
  PopperJS.StrictModifiers,
  { name?: Name }
>

export type Modifier<Name, Options extends object = object> = Name extends StrictModifierNames
  ? StrictModifier<Name>
  : Partial<PopperJS.Modifier<Name, Options>>

export interface PopperProps<Modifiers> {
  children: (props: PopperChildrenProps) => React.ReactNode
  innerRef?: React.Ref<any>
  modifiers?: ReadonlyArray<Modifier<Modifiers>>
  placement?: PopperJS.Placement
  strategy?: PopperJS.PositioningStrategy
  referenceElement?: HTMLElement | PopperJS.VirtualElement
  onFirstUpdate?: (state: Partial<PopperJS.State>) => void
}
export class Popper<Modifiers> extends React.Component<PopperProps<Modifiers>, {}> {}

type State = {
  // styles: { [key: string]: React.CSSProperties } // PopperJS.State['styles']
  styles: Partial<Record<keyof PopperJS.State['elements'], React.CSSProperties>> // usePopper の実装から逆算
  // attributes: { [key: string]: { [key: string]: string } | undefined } // PopperJS.State['attributes']
  attributes: Partial<
    Record<keyof PopperJS.State['elements'], { [key: string]: string } | undefined>
  > // usePopper の実装から逆算
}

const EMPTY_MODIFIERS = [] as Partial<Modifier<any, any>>[]

/**
 * usePopper の主な内容
 * - createPopper で作成する instance を useRef で保持
 * - instance を update した時に，計算結果(instance.state)の styles と attributes の情報を setState し，レンダリングを発生させる
 *
 * つまり，createPopper を react で使えるようにした wrapper に過ぎない
 * @param referenceElement
 * @param popperElement
 * @param options NOTE react-fast-compare を用いていないため, options の 各種 value は メモ化 して渡す
 * @returns
 */
const usePopper = <Modifiers>(
  referenceElement?: Element | PopperJS.VirtualElement | null,
  popperElement?: HTMLElement | null,
  options?: Omit<Partial<PopperJS.Options>, 'modifiers'> & {
    createPopper?: typeof PopperJS.createPopper
    modifiers?: ReadonlyArray<Modifier<Modifiers>>
  }
): {
  // styles: { [key: string]: React.CSSProperties }
  styles: State['styles']
  attributes: State['attributes']
  state: PopperJS.State | null
  update: PopperJS.Instance['update'] | null
  forceUpdate: PopperJS.Instance['forceUpdate'] | null
} => {
  // const prevOptions = React.useRef<PopperJS.Options | null>(null)

  const optionsWithDefaults = {
    onFirstUpdate: options?.onFirstUpdate,
    placement: options?.placement || 'bottom',
    strategy: options?.strategy || 'absolute',
    modifiers: options?.modifiers || EMPTY_MODIFIERS,
  }

  const [state, setState] = React.useState<State>({
    styles: {
      popper: {
        position: optionsWithDefaults.strategy,
        left: '0',
        top: '0',
      },
      arrow: {
        position: 'absolute',
      },
    },
    attributes: {},
  })

  const updateStateModifier = React.useMemo(
    () =>
      ({
        name: 'updateState', // modifiers のソートに使う。 requires にて指定される時に用いられる。
        enabled: true,
        phase: 'write', // modifiers のソートに使う。 c.f. modifierPhases in https://github.com/popperjs/popper-core/blob/master/src/enums.js

        // fn({ state, options, name, instance }) という形でCallされ, 戻り値があれば、その値で state を上書きする。
        fn: ({ state }) => {
          const elements = Object.keys(state.elements)

          setState({
            /*
              HTMLAttributes<Element>.style と Partial<CSSStyleDeclaration> との違い
              ⇔ React.CSSProperties と Partial<CSSStyleDeclaration> との違い
              を any で誤魔化す。
            */
            styles: fromEntries(
              elements.map((element) => [element, state.styles[element] || {}])
            ) as any,
            /*
              【2】usePopper の返却値['attributes'] を PopperJS.State['attributes'] に
              優先させるため、any で誤魔化す。
            */
            attributes: fromEntries(
              elements.map((element) => [element, state.attributes[element]])
            ) as any,
          })
        },
        requires: ['computeStyles'], // modifiers のソートに使う。
      } as Modifier<'updateState', {}>),
    []
  )

  const popperOptions = React.useMemo(() => {
    const newOptions = {
      onFirstUpdate: optionsWithDefaults.onFirstUpdate,
      placement: optionsWithDefaults.placement,
      strategy: optionsWithDefaults.strategy,
      modifiers: [
        ...optionsWithDefaults.modifiers,
        updateStateModifier,
        { name: 'applyStyles', enabled: false }, // default で動作する applyStyles modifier を動作させなくする。
      ],
    }
    return newOptions
    // NOTE optionsWithDefaults の各種 value をメモ化すれば, isEqual は不要
    // if (isEqual(prevOptions.current, newOptions)) {
    //   return prevOptions.current || newOptions
    // } else {
    //   prevOptions.current = newOptions
    //   return newOptions
    // }
  }, [
    optionsWithDefaults.onFirstUpdate,
    optionsWithDefaults.placement,
    optionsWithDefaults.strategy,
    optionsWithDefaults.modifiers,
    updateStateModifier,
  ])

  const popperInstanceRef = React.useRef<PopperJS.Instance | null>(null)

  /*
      setOptions
      「instance の生成と破棄」と実行タイミングが異なる。
  */
  useIsomorphicLayoutEffect(() => {
    if (popperInstanceRef.current) {
      // console.log('re set options')
      popperInstanceRef.current.setOptions(popperOptions)
    }
  }, [popperOptions])

  /*
      instance の生成と破棄
  */
  useIsomorphicLayoutEffect(() => {
    if (referenceElement == null || popperElement == null) {
      // console.log('usePopper main early exit')
      return
    }
    // console.log('usePopper main')

    const createPopper = options?.createPopper || defaultCreatePopper
    const popperInstance = createPopper(referenceElement, popperElement, popperOptions)

    popperInstanceRef.current = popperInstance

    return () => {
      popperInstance.destroy()
      popperInstanceRef.current = null
    }
  }, [referenceElement, popperElement, options?.createPopper])

  return {
    state: popperInstanceRef.current ? popperInstanceRef.current.state : null,
    styles: state.styles,
    attributes: state.attributes,
    update: popperInstanceRef.current ? popperInstanceRef.current.update : null,
    forceUpdate: popperInstanceRef.current ? popperInstanceRef.current.forceUpdate : null,
  }
}
export default usePopper
