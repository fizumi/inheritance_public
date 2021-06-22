import React from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

export default function useGlobalCSS(on: boolean, css: string) {
  const style = React.useRef<HTMLStyleElement>()
  useIsomorphicLayoutEffect(() => {
    if (on) {
      style.current = document.createElement('style')
      style.current.innerHTML = css
      document.querySelector('head')?.appendChild(style.current)
      return () => {
        style.current?.remove()
      }
    }
  }, [css, on])
}

// export default function useGlobalCSS(on: boolean, css: string) {
//   const id = React.useRef<string>()
//   React.useEffect(() => {
//     if (on && id.current === undefined) {
//       id.current = 'useGlobalCSS:' + String(Number(new Date()))
//       const style = document.createElement('style')
//       style.innerHTML = css
//       style.id = id.current
//       document.querySelector('head')?.appendChild(style)
//       return
//     }
//     if (!on && id.current) {
//       const style = document.getElementById(id.current)
//       style?.remove()
//       id.current = undefined
//       return
//     }
//   }, [css, on])
// }
