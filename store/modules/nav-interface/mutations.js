export default {
  setLoadingMessage (state, value) {
    state.loadingData.loadingMessage = value
  },
  setLoadingProgress (state, value) {
    state.loadingData.loadingProgress = value
  },
  setLoadingStatus (state, value) {
    state.loadingData.loadingStatus = value
  },
  setLoadingData (state, value) {
    state.loadingData = value
  },
  setConfig (state, value) {
    state.config = value
  },
  setTitle (state, value) {
    state.currentTitle = value
  },
  // --------------------------------------------------------------------------
  resetFilters (state) {
    state.selectedFilters = {
      dateFrom: +(new Date('2016-01-01')),
      dateTo: +(new Date()),
      execDeps: [],
      outNum: '',
      outNumPrefix: '',
      outDate: null,
      organisation: [],
      number: null,
      state: [],
      type: [],
      tema: [],
      needAnswer: null,
      hasAnswer: null,
      isAnswerOn: [],
      answerOrg: [],
      answerDep: [],
      answerDateFrom: +(new Date('2016-01-01')),
      answerDateTo: +(new Date()),
      executants: [],
      deps: [],
      subdivision: [],
      podpisants: [],
      addressees: [],
      author: []
    }
  },
  setAnswerDep (state, value) {
    state.selectedFilters.answerDep = [...value]
  },
  setExecDeps (state, value) {
    state.selectedFilters.execDeps = [...value]
  },
  setOutNum (state, value) {
    state.selectedFilters.outNum = value
  },
  setOutNumPrefix (state, value) {
    state.selectedFilters.outNumPrefix = value
  },
  setOutDate (state, value) {
    state.selectedFilters.outDate = value
  },
  setAnswerDateTo (state, value) {
    state.selectedFilters.answerDateTo = value
  },
  setAnswerDateFrom (state, value) {
    state.selectedFilters.answerDateFrom = value
  },
  setAnswerOrg (state, value) {
    state.selectedFilters.answerOrg = [...value]
  },
  setAuthor (state, value) {
    state.selectedFilters.author = value
  },
  setAddressees (state, value) {
    state.selectedFilters.addressees = [...value]
  },
  setIsAnswerOn (state, value) {
    state.selectedFilters.isAnswerOn = [...value]
  },
  setDeps (state, value) {
    state.selectedFilters.deps = [...value]
  },
  setSubdivision (state, value) {
    state.selectedFilters.subdivision = [...value]
  },
  setExecutants (state, value) {
    state.selectedFilters.executants = [...value]
  },
  setNeedAnswer (state, value) {
    state.selectedFilters.needAnswer = value
  },
  setHasAnswer (state, value) {
    state.selectedFilters.hasAnswer = value
  },
  setTema (state, value) {
    state.selectedFilters.tema = [...value]
  },
  setType (state, value) {
    state.selectedFilters.type = [...value]
  },
  setPodpisants (state, value) {
    state.selectedFilters.podpisants = [...value]
  },
  setDateFrom (state, value) {
    state.selectedFilters.dateFrom = value
  },
  setDateTo (state, value) {
    state.selectedFilters.dateTo = value
  },
  setOrganisation (state, value) {
    state.selectedFilters.organisation = [...value]
  },
  setSelectState (state, value) {
    state.selectedFilters.state = [...value]
  },
  // --------------------------------------------------------------------
  switchLeftDrawerMiniVariant (state) {
    state.leftDrawer.miniVariant = !state.leftDrawer.miniVariant
  },
  switchLeftDrawer (state) {
    state.leftDrawer.drawer = !state.leftDrawer.drawer
  },
  switchRightDrawer (state) {
    state.rightDrawer.drawer = !state.rightDrawer.drawer
  },
  unsetRightDrawer (state) {
    state.rightDrawer.drawer = false
  },
  setRightDrawer (state) {
    state.rightDrawer.drawer = true
  },
  setBusy (state, value) {
    state.busy = !!value
  },
  setLoading (state, value) {
    state.loading = !!value
  },
  setSearch (state, value) {
    state.search = value
  },
  setEditedItemId (state, value) {
    state.editedItemId = value
  },
  setSelectedDocsTab (state, payload) {
    state.selectedDocsTab = payload.value
  }
}
