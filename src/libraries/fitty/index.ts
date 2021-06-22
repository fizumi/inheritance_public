// https://github.com/rikschennink/fitty/pull/69
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */

type fitty =
  | {
      (target: HTMLElement, options?: FittyOptions): FittyInstance
      (target: string, options?: FittyOptions): FittyInstance[]
    }
  | undefined

interface FittyOptions {
  minSize?: number
  maxSize?: number
  multiLine?: boolean
  observeMutations?: false | MutationObserverInit
}

export interface FittyInstance {
  element: HTMLElement
  fit: () => void
  freeze: () => void
  unfreeze: () => void
  unsubscribe: () => void
}

interface F {
  element: HTMLElement
  originalStyle?: Pick<HTMLElement['style'], 'whiteSpace' | 'display' | 'fontSize'>
  option: FittyOptions
  state: {
    active: boolean
    newbie?: boolean
    dirty?: Type // see DrawState
    styleComputed?: boolean
    preStyleTestCompleted?: boolean
  }
  style: {
    whiteSpace?: string // 'normal' | 'nowrap' | "white-space"
    display?: string
  }
  size: {
    availableWidth?: number
    availableHeight?: number
    previousFontSize?: number
    currentFontSize?: number
  }
  observer?: MutationObserver
}

// util to avoid type constraint
const getParentNode =
  <T>(prop: string) =>
  (f: F): T | undefined =>
    (f.element.parentNode as any)?.[prop]

// states
const DrawState = {
  IDLE: 0,
  DIRTY_CONTENT: 1,
  DIRTY_LAYOUT: 2,
  DIRTY: 3,
} as const

type Type = 0 | 1 | 2 | 3 | true

export default (function createFitty(w: Window | null): fitty {
  // no window, early exit
  if (!w) return
  // if (typeof w === 'undefined') return

  // node list to array helper method
  const toArray = (nl: any) => [].slice.call(nl)

  // all active fitty elements
  let fitties: F[] = []

  // group all redraw calls till next frame, we cancel each frame request when a new one comes in. If no support for request animation frame, this is an empty function and supports for fitty stops.
  let redrawFrame = 0 // original: null
  const requestRedraw =
    'requestAnimationFrame' in w
      ? () => {
          w.cancelAnimationFrame(redrawFrame)
          redrawFrame = w.requestAnimationFrame(() =>
            redraw(fitties.filter((f) => f.state.dirty && f.state.active))
          )
        }
      : () => {}

  // sets all fitties to dirty so they are redrawn on the next redraw loop, then calls redraw
  const redrawAll = (type: Type) => () => {
    fitties.forEach((f) => (f.state.dirty = type))
    requestRedraw()
  }

  // redraws fitties so they nicely fit their parent container
  const redraw = (fitties: F[]) => {
    // getting info from the DOM at this point should not trigger a reflow, let's gather as much intel as possible before triggering a reflow

    // check if styles of all fitties have been computed
    fitties
      .filter((f) => !f.state.styleComputed)
      .forEach((f) => {
        f.state.styleComputed = computeStyle(f)
      })

    // restyle elements that require pre-styling, this triggers a reflow, please try to prevent by adding CSS rules (see docs)
    fitties.filter(shouldPreStyle).forEach(applyStyle)

    // we now determine which fitties should be redrawn
    const fittiesToRedraw = fitties.filter(shouldRedraw)

    // we calculate final styles for these fitties
    fittiesToRedraw.forEach(calculateStyles)

    // now we apply the calculated styles from our previous loop
    fittiesToRedraw.forEach((f) => {
      applyStyle(f)
      markAsClean(f)
    })

    // now we dispatch events for all restyled fitties
    fittiesToRedraw.forEach(dispatchFitEvent)
  }

  const markAsClean = (f: F) => {
    f.state.dirty = DrawState.IDLE
  }

  const calculateStyles = (f: F) => {
    const size = f.size

    // get available width/height from parent node
    size.availableWidth = getParentNode<number>('clientWidth')(f)
    size.availableHeight = getParentNode<number>('clientHeight')(f)

    // the space our target element uses
    const current = {
      width: f.element.scrollWidth,
      height: f.element.scrollHeight,
    }

    // remember current font size
    size.previousFontSize = size.currentFontSize

    const { minSize, maxSize, multiLine } = f.option
    // let's calculate the new font size
    size.currentFontSize =
      minSize && size.availableWidth && size.previousFontSize && maxSize && size.availableHeight
        ? Math.min(
            Math.min(
              Math.max(minSize, (size.availableWidth / current.width) * size.previousFontSize),
              maxSize
            ),
            Math.min(
              Math.max(minSize, (size.availableHeight / current.height) * size.previousFontSize),
              maxSize
            )
          )
        : size.currentFontSize
    f.size = size

    // if allows wrapping, only wrap when at minimum font size (otherwise would break container)
    f.style.whiteSpace = multiLine && size.currentFontSize === minSize ? 'normal' : 'nowrap'
  }

  // should always redraw if is not dirty layout, if is dirty layout, only redraw if size has changed
  const shouldRedraw = (f: F) =>
    f.state.dirty !== DrawState.DIRTY_LAYOUT ||
    (f.state.dirty === DrawState.DIRTY_LAYOUT &&
      (getParentNode<number>('clientWidth')(f) !== f.size.availableWidth ||
        getParentNode<number>('clientHeight')(f) !== f.size.availableHeight))

  // every fitty element is tested for invalid styles
  const computeStyle = (f: F) => {
    // get style properties
    const style = w.getComputedStyle(f.element, null)

    // get current font size in pixels (if we already calculated it, use the calculated version)
    f.size.currentFontSize = parseFloat(style.getPropertyValue('font-size'))

    // get display type and wrap mode
    f.style.display = style.getPropertyValue('display')
    f.style.whiteSpace = style.getPropertyValue('white-space')

    return !!(f.size.currentFontSize && f.style.display && f.style.whiteSpace) // oritinal: void
  }

  // determines if this fitty requires initial styling, can be prevented by applying correct styles through CSS
  const shouldPreStyle = (f: F) => {
    let preStyle = false

    // if we already tested for prestyling we don't have to do it again
    if (f.state.preStyleTestCompleted) return false

    // should have an inline style, if not, apply
    if (!/inline-/.test(f.style.display || '')) {
      preStyle = true
      f.style.display = 'inline-block'
    }

    // to correctly calculate dimensions the element should have whiteSpace set to nowrap
    if (f.style.whiteSpace !== 'nowrap') {
      preStyle = true
      f.style.whiteSpace = 'nowrap'
    }

    // we don't have to do this twice
    f.state.preStyleTestCompleted = true

    return preStyle
  }

  // apply styles to single fitty
  const applyStyle = (f: F) => {
    if (!f.style.whiteSpace || !f.style.display || !f.size.currentFontSize) return
    f.element.style.whiteSpace = f.style.whiteSpace
    f.element.style.display = f.style.display
    f.element.style.fontSize = f.size.currentFontSize + 'px'
  }

  // dispatch a fit event on a fitty
  const dispatchFitEvent = (f: F) => {
    const { previousFontSize, currentFontSize } = f.size
    f.element.dispatchEvent(
      new CustomEvent('fit', {
        detail: {
          oldValue: previousFontSize,
          newValue: currentFontSize,
          scaleFactor:
            currentFontSize && previousFontSize ? currentFontSize / previousFontSize : undefined,
        },
      })
    )
  }

  // fit method, marks the fitty as dirty and requests a redraw (this will also redraw any other fitty marked as dirty)
  const fit = (f: F, type: Type) => () => {
    f.state.dirty = type
    if (!f.state.active) return
    requestRedraw()
  }

  const init = (f: F) => {
    // save some of the original CSS properties before we change them
    f.originalStyle = {
      whiteSpace: f.element.style.whiteSpace,
      display: f.element.style.display,
      fontSize: f.element.style.fontSize,
    }

    // should we observe DOM mutations
    observeMutations(f)

    // this is a new fitty so we need to validate if it's styles are in order
    f.state.newbie = true

    // because it's a new fitty it should also be dirty, we want it to redraw on the first loop
    f.state.dirty = true

    // we want to be able to update this fitty
    fitties.push(f)
  }

  const destroy = (f: F) => () => {
    // remove from fitties array
    fitties = fitties.filter((_) => _.element !== f.element)

    // stop observing DOM
    f.observer?.disconnect()

    // reset the CSS properties we changes
    f.element.style.whiteSpace = f.originalStyle!.whiteSpace
    f.element.style.display = f.originalStyle!.display
    f.element.style.fontSize = f.originalStyle!.fontSize
  }

  // add a new fitty, does not redraw said fitty
  const subscribe = (f: F) => () => {
    if (f.state.active) return
    f.state.active = true
    requestRedraw()
  }

  // remove an existing fitty
  const unsubscribe = (f: F) => () => (f.state.active = false)

  const observeMutations = (f: F) => {
    // no observing?
    if (!f.option.observeMutations) return

    // start observing mutations
    f.observer = new MutationObserver(fit(f, DrawState.DIRTY_CONTENT))

    // start observing
    f.observer.observe(f.element, f.option.observeMutations)
  }

  // default mutation observer settings
  const mutationObserverDefaultSetting = {
    subtree: true,
    childList: true,
    characterData: true,
  }

  // default fitty options
  const defaultOptions = {
    minSize: 16,
    maxSize: 512,
    multiLine: true,
    observeMutations: 'MutationObserver' in w ? mutationObserverDefaultSetting : false,
  } as const

  // array of elements in, fitty instances out
  function fittyCreate(elements: HTMLElement[], options: FittyOptions): FittyInstance[] {
    // set options object
    const fittyOptions: FittyOptions = {
      // expand default options
      ...defaultOptions,

      // override with custom options
      ...options,
    }

    // create fitties
    const publicFitties = elements.map((element) => {
      // create fitty instance
      const f: F = {
        option: fittyOptions,

        // internal options for this fitty
        element,
        state: { active: true },
        style: {},
        size: {},
      }

      // initialise this fitty
      init(f)

      // expose API
      return {
        element,
        fit: fit(f, DrawState.DIRTY),
        unfreeze: subscribe(f),
        freeze: unsubscribe(f),
        unsubscribe: destroy(f),
      }
    })

    // call redraw on newly initiated fitties
    requestRedraw()

    // expose fitties
    return publicFitties
  }

  const fitty = (target: HTMLElement | string, options: FittyOptions = {}) => {
    // if target is a string
    return typeof target === 'string'
      ? // treat it as a querySelector
        fittyCreate(toArray(document.querySelectorAll(target)), options)
      : // create single fitty
        fittyCreate([target], options)[0]
  }

  // handles viewport changes, redraws all fitties, but only does so after a timeout
  let resizeDebounce: number | undefined
  const onWindowResized = () => {
    w.clearTimeout(resizeDebounce)
    resizeDebounce = w.setTimeout(redrawAll(DrawState.DIRTY_LAYOUT), fitty.observeWindowDelay)
  }

  // define observe window property, so when we set it to true or false events are automatically added and removed
  const events = ['resize', 'orientationchange']
  Object.defineProperty(fitty, 'observeWindow', {
    set: (enabled) => {
      const method = `${enabled ? 'add' : 'remove'}EventListener` as const
      events.forEach((e) => {
        w[method](e, onWindowResized)
      })
    },
  })

  // fitty global properties (by setting observeWindow to true the events above get added)
  fitty.observeWindow = true
  fitty.observeWindowDelay = 100

  // public fit all method, will force redraw no matter what
  fitty.fitAll = redrawAll(DrawState.DIRTY)

  // export our fitty function, we don't want to keep it to our selves
  return fitty as any
})(typeof window === 'undefined' ? null : window)
