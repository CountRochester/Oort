export default function () {
  return {
    navbar: {

    },
    leftDrawer: {
      clipped: true,
      drawer: true,
      miniVariant: true
    },
    rightDrawer: {
      drawer: false
    },
    footer: {

    },
    busy: false,
    search: '',
    loading: false,
    synchronization: false,
    editedItemId: '',
    currentTitle: '',
    selectedDocsTab: '#extIncoming',
    loadingData: {
      loadingProgress: 0,
      loadingMessage: '',
      loadingStatus: ''
    },
    selectedFilters: {
      dateFrom: +(new Date('2016-01-01')),
      dateTo: +(new Date()),
      execDeps: [],
      outNum: '',
      outNumPrefix: '',
      outDate: '',
      organisation: [],
      number: null,
      state: [],
      type: [],
      tema: [],
      needAnswer: null,
      hasAnswer: null,
      isAnswerOn: [],
      answerOrg: [],
      answerDateFrom: +(new Date('2016-01-01')),
      answerDateTo: +(new Date()),
      answerDep: [],
      executants: [],
      deps: [],
      subdivision: [],
      podpisants: [],
      addressees: [],
      author: []
    },
    config: { theme: 'dark' }
  }
}
