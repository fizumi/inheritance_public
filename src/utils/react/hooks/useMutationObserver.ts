import React from 'react'

const useMutationObserver = <T extends HTMLElement>(
  mc: MutationCallback,
  options: MutationObserverInit
) => {
  const ref = React.useRef<T>(null)
  const observer = React.useRef<MutationObserver>()
  React.useEffect(() => {
    observer.current = new MutationObserver(mc)
    if (!ref.current) return
    observer.current.observe(ref.current, options)
  }, [mc, options])

  return ref
}
export default useMutationObserver
