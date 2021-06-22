import React from 'react'

const useLifecycles = ({
  onDidMount,
  onWillUnmount,
}: {
  onDidMount?: () => void
  onWillUnmount?: () => void
}) => {
  React.useEffect(() => {
    if (onDidMount) {
      onDidMount()
    }
    return () => {
      if (onWillUnmount) {
        onWillUnmount()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useLifecycles
