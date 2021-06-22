import React from 'react'

// https://github.com/vercel/next.js/discussions/17443#discussioncomment-637879

const useUnmount = (ms: number) => {
  const [willUnmount, setWillUnmount] = React.useState(false)
  React.useEffect(() => {
    setTimeout(() => {
      setWillUnmount(true)
    }, ms)
  }, [ms])

  const unmountInMs = React.useCallback(
    (rEl: React.ReactElement) => (willUnmount ? null : rEl),
    [willUnmount]
  )

  return unmountInMs
}

export default useUnmount
