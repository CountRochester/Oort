import moment from 'moment'

// import * as utils from '../utils'
import { gQLRequest } from '@/utils/gql-request'
import { removeDublicates } from '@/utils/array'

moment.locale('ru')
export default {
  async setUser ({ commit, state, dispatch, rootState, rootGetters }, userId) {
    try {
      if (state.isAuthenticated) {
        if (!state.groups.length) {
          await dispatch('fetchGroups')
        }
        if (!state.users.length) {
          await dispatch('fetchUsers')
        }
        const defaultUser = {
          id: null,
          employee: {
            id: null,
            firstName: '',
            middleName: '',
            secondName: '',
            Positions: [],
            Subdivisions: [],
            Departments: []
          },
          groups: [],
          permissions: null,
          selectedDep: null
        }
        const user = rootGetters['auth/getUserById'][userId]
        if (user) {
          const userGroups = []
          user.groupsId.forEach((id) => {
            const group = rootGetters['auth/getGroupById'][id]
            if (group) { userGroups.push(group) }
          })
          const userPermission = userGroups.reduce((acc, group) => (acc |= group.permissions), 0)
          const formedUser = {
            id: user.id,
            employee: {
              id: user.employeeId,
              firstName: user.firstName,
              middleName: user.middleName,
              secondName: user.secondName,
              Positions: user.currentPositionsId,
              Subdivisions: user.subdivisionsId,
              Departments: user.departmentsId
            },
            groups: user.groupsId,
            permissions: userPermission,
            selectedDep: user.departmentsId[0] || null
          }
          commit('setCurrentUser', formedUser)
        } else {
          commit('setCurrentUser', defaultUser)
        }
      } else {
        return false
      }
    } catch (err) {
      throw err
    }
  },

  async fetchUsers ({ commit, state, dispatch, rootState, rootGetters }) {
    try {
      console.time('fetchUsers')
      if (state.users.length) {
        console.timeEnd('fetchUsers')
        return
      }
      const query = `
          query {
            getAllUsers {
              id
              name
              employeeId
              firstName
              middleName
              secondName
              currentPositionsId
              departmentsId
              subdivisionsId
              groupsId
              createdAt
              updatedAt
            }
          }
        `
      const users = await gQLRequest(query)
      for (let index = 0; index < users.length; index++) {
        const item = users[index]
        const groupNames = []
        for (const group of item.groupsId) {
          const gr = rootGetters['auth/getGroupById'][group]
          if (gr) {
            groupNames.push(gr.name)
          }
        }
        item.groups = groupNames.join('; ')
        item.employee = `${item.secondName || ''} ${item.firstName[0] || ''}.${item.middleName[0] || ''}.`
      }
      const sorted = removeDublicates(users)
      commit('set', ['users', sorted])
      console.timeEnd('fetchUsers')
      // USER: {
      //   id
      //   name
      //   employeeId
      //   firstName
      //   middleName
      //   secondName
      //   currentPositionsId
      //   departmentsId
      //   subdivisionsId
      //   groupsId
      //   createdAt
      //   updatedAt
      //   groups
      //   employee
      // }
    } catch (err) {
      throw err
    }
  }
}
