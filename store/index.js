import { removeDublicates } from '../utils/array'
import navInterface from './modules/nav-interface'
import auth from './modules/auth'

function getModuleName (entitity, type, ctx) {
  const modules = ctx.app.store._modulesNamespaceMap
  // Получение списка всех модулей
  const modArr = Object.keys(modules)
  // фильтрация путей до реальных модулей
  const filterModArr = []
  for (const item of modArr) {
    if (!item.includes('modules')) {
      filterModArr.push(item)
    }
  }
  for (const item of filterModArr) {
    const element = type === 'state'
      ? Object.keys(modules[`${item}`].state)
      : Object.keys(modules[`${item}`]._rawModule[`${type}`])
    if (element.includes(entitity)) {
      return item
    }
  }
}

export default {
  modules: {
    navInterface,
    auth
  },
  actions: {
    async nuxtServerInit ({ dispatch, commit }, context) {
      console.log('nuxtServerInit')
      console.time('Server init')
      await dispatch('auth/autoLogin')
      console.timeEnd('Server init')
    },

    async fetchForce ({ commit, dispatch, rootState }, entitity) {
      try {
        console.time('fetchForce ' + entitity)
        // замена первого символа на нижний регистр
        const stateEnt = entitity.replace(/^[A-Z]/, letter => `${letter.toLowerCase()}`)
        // const modul = 'docs'
        // определение модуля, где есть данное состояние
        const modul = getModuleName(`${stateEnt}`, 'state', this)
        // выполнение мутации
        console.time('Reset ' + entitity)
        commit(`${modul}reset`, stateEnt, { root: true })
        console.timeEnd('Reset ' + entitity)
        await dispatch(`${modul}fetch${entitity}`, null, { root: true })
        console.timeEnd('fetchForce ' + entitity)
      } catch (err) {
        throw err
      }
    },

    async fetch ({ dispatch, rootState }, entitity) {
      // замена первого символа на нижний регистр
      const stateEnt = entitity.replace(/^[A-Z]/, letter => `${letter.toLowerCase()}`)
      // const modul = 'docs'
      // определение модуля, где есть данное состояние
      const modul = getModuleName(`${stateEnt}`, 'state', this)
      // выполнение акшена
      await dispatch(`${modul}fetch${entitity}`, null, { root: true })
    },

    removeDublicates ({ commit, rootState }, entitity) {
      const stateEnt = entitity.replace(/^[A-Z]/, letter => `${letter.toLowerCase()}`)
      const modul = getModuleName(`${stateEnt}`, 'state', this)
      const filteredArray = removeDublicates(rootState[`${modul.slice(0, -1)}`][`${stateEnt}`])
      commit(`${modul}set`, [stateEnt, filteredArray], { root: true })
      // commit(`${modul}reset`, stateEnt, { root: true })
      // filteredArray.forEach((item) => {
      //   commit(`${modul}add`, [stateEnt, item], { root: true })
      // })
    }
  }
}
