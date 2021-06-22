import constate from 'src/libraries/constate'
import { useBoolean, useGlobalKeyDown } from 'src/utils/react/hooks'

export const [SearchMordalProvider, useSearchMordal] = constate(() => {
  const {
    state: openSerchMordal,
    dispatcher: { toggle: toggleSerchMordal, setFalse: closeSerchMordal },
  } = useBoolean()

  useGlobalKeyDown({
    f: (event) => {
      if (event.ctrlKey) {
        toggleSerchMordal()
        event.preventDefault()
      }
    },
  })

  return { closeSerchMordal, openSerchMordal, toggleSerchMordal }
})
