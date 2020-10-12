import moment from 'moment'

// import * as utils from '../../utils'
import { gQLRequest } from '@/utils/gql-request'
import { removeDublicates } from '@/utils/array'

moment.locale('ru')

export default {
  async fetchGroups ({ commit, state }) {
    try {
      if (state.groups.length) {
        return
      }
      const query = `
          query {
            getAllGroups {
              id
              name
              permissions
              createdAt
              updatedAt
            }
          }
        `
      const groups = await gQLRequest(query)
      for (const group of groups) {
        group.permissions = group.permissions.toString(2)
      }
      const sorted = removeDublicates(groups)
      commit('set', ['groups', sorted])
    } catch (err) {
      throw err
    }
  }
}
