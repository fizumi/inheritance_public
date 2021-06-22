import React from 'react'

// https://github.com/vercel/next.js/discussions/17443#discussioncomment-637879

const useRenderOnClient = () => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const renderOnClient = React.useCallback(
    (rEl: React.ReactElement) => (mounted ? rEl : null),
    [mounted]
  )

  return renderOnClient
}

export default useRenderOnClient
