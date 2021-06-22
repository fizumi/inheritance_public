import { pipeComponents, partial } from 'src/utils/react/utils/pipeComponents'
import { SettingsDrawerProvider } from './useSettingsDrawerOpen'
import { RemProvider } from './useRem'
import { WindowSizeProvider } from './useWindowSize'
import { SearchMordalProvider } from './useSearchMordal'

export default pipeComponents(
  SettingsDrawerProvider,
  RemProvider,
  WindowSizeProvider,
  SearchMordalProvider
)
