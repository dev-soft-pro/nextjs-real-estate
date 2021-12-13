import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    secondary: {
      light: '#a0b6ff',
      main: '#6b87e9',
      dark: '#6b87e9',
      contrastText: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      'HelveticaNeue',
      'sans-serif',
      'Roboto',
      'Arial',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(',')
  }
})

export default theme
