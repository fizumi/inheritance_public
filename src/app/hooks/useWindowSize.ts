import constate from 'src/libraries/constate'
import useWindowSize_ from 'src/utils/react/hooks/useWindowSize'
export const [WindowSizeProvider, useWindowSize] = constate(() => useWindowSize_())
