import constate from 'src/libraries/constate'
import useRem_ from 'src/utils/fp/react/hooks/useRem'
export const [RemProvider, useRem] = constate(() => useRem_())

export const ObservedDummyComponent = () => useRem()[1]
