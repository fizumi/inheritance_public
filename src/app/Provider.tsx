import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles' // https://next--material-ui.netlify.app/styles/advanced/#css-injection-order
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react' // https://emotion.sh/docs/theming#gatsby-focus-wrapper
import theme from 'src/app/styles/theme'
import { store } from './redux/store'
import { rehydrate } from './redux/libs/redux-persist'
import { pipeComponents, partial } from 'src/utils/react/utils/pipeComponents'
import HooksProvider from './hooks/Provider'

// persistStore(store) でもいいし、以下でもいい
rehydrate(store)

const Provider = pipeComponents(
  partial(ThemeProvider, { theme }),
  partial(EmotionThemeProvider, { theme }),
  partial(ReduxProvider, { store }),
  HooksProvider
)
export default Provider
