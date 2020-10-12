import themes from '@/themes'

export default {
  leftDrawer: (state) => {
    return state.leftDrawer.drawer
  },
  leftMinVar: (state) => {
    return state.leftDrawer.miniVariant
  },
  rightDrawer: (state) => {
    return state.rightDrawer.drawer
  },
  leftDrawlerClipped: (state) => {
    return state.leftDrawer.clipped
  },
  selectedFilters: (state) => {
    return state.selectedFilters
  },
  selectedDocsTab: (state) => {
    return state.selectedDocsTab
  },
  getTheme: (state) => {
    return themes[state.config.theme]
  }
}
