import moment from 'moment'
import utils from '../../utils'

const Cookie = require('cookie')
const Cookies = require('js-cookie')
const jwtDecode = require('jwt-decode')

moment.locale('ru')
function isJWTValid (token) {
  if (!token) {
    return false
  }
  const jwtData = jwtDecode(token) || {}
  const expires = jwtData.exp || 0
  return (new Date().getTime() / 1000) < expires
}
export default {
  selectDep ({ commit }, selectedDep) {
    commit('setCurrentUserDep', selectedDep)
  },

  setToken ({ commit }, token) {
    commit('setToken', token)
    commit('setAuth')
    Cookies.set('jwt-token', token)
  },

  async autoLogin ({ dispatch, commit, state }) {
    const cookieStr = process.browser
      ? document.cookie
      : this.app.context.req.headers.cookie
    const cookies = Cookie.parse(cookieStr || '') || {}
    const token = cookies['jwt-token']
    if (!token) {

    } else {
      const jwtData = jwtDecode(token) || {}
      const userId = jwtData.userId || 0
      if (isJWTValid(token)) {
        dispatch('setToken', token)
        await dispatch('setUser', userId)
      } else {
        dispatch('logout')
      }
    }
  },

  logout ({ commit }) {
    const userNull = {
      id: null,
      employee: {
        id: null,
        firstName: '',
        middleName: '',
        secondName: '',
        Positions: [],
        Subdivisions: []
      },
      groups: [],
      permissions: null
    }
    commit('setCurrentUser', userNull)
    commit('setToken', null)
    commit('setAuth')
    commit('reset', 'users')
    commit('reset', 'groups')
    Cookies.remove('jwt-token')
  },

  modify ({ dispatch }, [entitity, payload]) {
    switch (payload.type) {
      case 'add': {
        dispatch(`add${entitity}`, payload.item)
        break
      }
      case 'edit': {
        dispatch(`edit${entitity}`, payload.item)
        break
      }
      case 'delete': {
        dispatch(`delete${entitity}`, [payload.id])
        break
      }
    }
  },
  delete ({ state, commit }, [entitity, ids]) {
    const newArr = state[entitity].filter(el => !ids.includes(el.id))
    commit('set', [entitity, newArr])
  },
  update ({ rootGetters, commit, state }, { entitity, ids, args }) {
    const arrNeedToUpdate = []
    let rootGetter
    let fun
    switch (entitity) {
      // case 'deps': {
      //   rootGetter = 'getDepById'
      //   fun = 'formDep'
      //   break
      // }
      // case 'employees': {
      //   rootGetter = 'getEmployeeById'
      //   fun = 'formEmployee'
      //   break
      // }
      case 'groups': {
        rootGetter = 'getGroupById'
        fun = 'formGroup'
        break
      }
      case 'users': {
        rootGetter = 'getUserById'
        fun = 'formUser'
        break
      }
    }
    if (rootGetter && fun) {
      ids.forEach((el) => {
        const item = rootGetters[`docs/${rootGetter}`][el]
        if (item) {
          arrNeedToUpdate.push({ ...item })
        }
      })
      if (arrNeedToUpdate.length) {
        arrNeedToUpdate.forEach((el) => {
          utils[fun](...args, el)
        })
        const arrDontNeedUpdate = state[entitity].filter(el => !ids.includes(el.id))
        commit('set', [entitity, [...arrDontNeedUpdate, ...arrNeedToUpdate]])
      }
    }
  }
}
