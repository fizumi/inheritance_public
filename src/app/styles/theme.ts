// https://next--material-ui.netlify.app/guides/server-rendering/#the-theme
import { Theme as MuiTheme, createTheme } from '@material-ui/core/styles'
import {} from '@emotion/react'
import { indigo } from '@material-ui/core/colors'

export const staticTheme = {
  // https://next--material-ui.netlify.app/customization/color/#playground
  palette: {
    primary: {
      test: '',
      main: indigo[900],
    },
    secondary: {
      main: indigo['A100'],
    },
  },
  // typography: { default を使う
  //   fontFamily,
  // },
} as const

// Create a theme instance.
const theme = createTheme(staticTheme)

export default theme

// https://next.material-ui.com/guides/migration-v4/#material-ui-styles
declare module '@material-ui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends MuiTheme {}
}

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends MuiTheme {}
}
