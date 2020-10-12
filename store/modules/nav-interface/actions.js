// import storage from '@/Storage/storage'

function getLoadingMessage (mess) {
  if (typeof mess === 'string') {
    return mess
  }
}

function getLoadingProgress (val) {
  let value
  if (val && (typeof val === 'number' || typeof val === 'string')) {
    value = val === true
      ? value = 100
      : +val
    if (value > 100) { value = 100 }
  } else {
    value = 0
  }
  return value
}

function getLoadingStatus (val) {
  return val === 'success'
    ? val
    : val === 'warning'
      ? val
      : val === 'pending'
        ? val
        : 'error'
}

export default {
  setLoadingMessage ({ commit }, mess) {
    const message = getLoadingMessage(mess)
    if (message) {
      commit('setLoadingMessage', mess)
    }
  },
  setLoadingProgress ({ commit }, val) {
    commit('setLoadingProgress', getLoadingProgress(val))
  },
  setLoadingStatus ({ commit }, val) {
    commit('setLoadingStatus', getLoadingStatus(val))
  },
  setLoadingData ({ commit }, val) {
    if (val && typeof val === 'object') {
      const data = {
        loadingProgress: getLoadingProgress(val.loadingProgress),
        loadingMessage: getLoadingMessage(val.loadingMessage),
        loadingStatus: getLoadingStatus(val.loadingStatus)
      }
      commit('setLoadingData', data)
    }
  },
  async loadConfig ({ commit, dispatch }) {
    try {
      const config = await this.app.context.$storage.config.getById('main')
      if (config) {
        commit('setConfig', config)
      } else {
        await dispatch('setConfig', { theme: 'dark' })
        const newConfig = await this.app.context.$storage.config.getById('main')
        commit('setConfig', newConfig)
      }
    } catch (err) {
      console.error(err)
    }
  },
  async setConfig ({ commit }, value) {
    try {
      if (!value.id) {
        value.id = 'main'
      }
      if (value) {
        commit('setConfig', value)
      }
      await this.app.context.$storage.store.config.add(value)
    } catch (err) {
      console.error(err)
    }
  },
  resetFilters ({ commit }, value) {
    commit('resetFilters', value)
  },
  setTitle ({ commit }, value) {
    commit('setTitle', value)
  },
  resetTitle ({ commit }) {
    commit('setTitle', '')
  },
  setAnswerDep ({ commit }, value) {
    commit('setAnswerDep', value)
  },
  setExecDeps ({ commit }, value) {
    commit('setExecDeps', value)
  },
  setOutNum ({ commit }, value) {
    commit('setOutNum', value)
  },
  setOutNumPrefix ({ commit }, value) {
    commit('setOutNumPrefix', value)
  },
  setOutDate ({ commit }, value) {
    commit('setOutDate', value)
  },
  setAnswerDateTo ({ commit }, value) {
    commit('setAnswerDateTo', value)
  },
  setAnswerDateFrom ({ commit }, value) {
    commit('setAnswerDateFrom', value)
  },
  setAnswerOrg ({ commit }, value) {
    commit('setAnswerOrg', value)
  },
  setAuthor ({ commit }, value) {
    commit('setAuthor', value)
  },
  setAddressees ({ commit }, value) {
    commit('setAddressees', value)
  },
  setIsAnswerOn ({ commit }, value) {
    commit('setIsAnswerOn', value)
  },
  setDeps ({ commit }, value) {
    commit('setDeps', value)
  },
  setSubdivision ({ commit }, value) {
    commit('setSubdivision', value)
  },
  setExecutants ({ commit }, value) {
    commit('setExecutants', value)
  },
  setNeedAnswer ({ commit }, value) {
    commit('setNeedAnswer', value)
  },
  setHasAnswer ({ commit }, value) {
    commit('setHasAnswer', value)
  },
  setTema ({ commit }, value) {
    commit('setTema', value)
  },
  setType ({ commit }, value) {
    commit('setType', value)
  },
  setPodpisants ({ commit }, value) {
    commit('setPodpisants', value)
  },
  setDateFrom ({ commit }, value) {
    commit('setDateFrom', value)
  },
  setDateTo ({ commit }, value) {
    commit('setDateTo', value)
  },
  setOrganisation ({ commit }, value) {
    commit('setOrganisation', value)
  },
  setSelectState ({ commit }, value) {
    commit('setSelectState', value)
  },
  toggleLeftDrawerMiniVariant ({ commit }) {
    commit('switchLeftDrawerMiniVariant')
  },
  toggleLeftDrawer ({ commit }) {
    commit('switchLeftDrawer')
  },
  toggleRightDrawer ({ commit }) {
    commit('switchRightDrawer')
  },
  closeRightDrawer ({ commit }) {
    commit('unsetRightDrawer')
  },
  openRightDrawer ({ commit }) {
    commit('setRightDrawer')
  },
  setBusy ({ commit }) {
    commit('setBusy', true)
  },
  unsetBusy ({ commit }) {
    commit('setBusy', false)
  },
  setLoading ({ commit }) {
    commit('setLoading', true)
  },
  unsetLoading ({ commit }) {
    commit('setLoading', false)
  },
  setSearch ({ commit }, value) {
    commit('setSearch', value)
  },
  resetSearch ({ commit }) {
    commit('setSearch', '')
  },
  setEditedItemId ({ commit }, value) {
    commit('setEditedItemId', value)
  },
  selectDocsTab ({ commit }, value) {
    commit('setSelectedDocsTab', { value })
  }
}
