import colors from 'vuetify/es5/util/colors'

const PRIMARY = colors.blue.darken2
const ACCENT = colors.grey.darken3
const SECONDARY = colors.amber.darken3
const INFO = colors.teal.lighten1
const WARNING = colors.amber.base
const ERROR = colors.deepOrange.accent4
const SUCCESS = colors.green.accent3

export default {
  mainTheme: {
    primary: PRIMARY,
    accent: ACCENT,
    secondary: SECONDARY,
    info: INFO,
    warning: WARNING,
    error: ERROR,
    success: SUCCESS
  },
  tables: {
    menu: PRIMARY,
    searchPanel: 'black',
    menuText: 'white',
    sliderColor: 'yellow',
    buttonColor: colors.blue.darken1,
    subPanel: colors.blue.darken4
  }
}
