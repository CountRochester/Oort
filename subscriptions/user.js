import gql from 'graphql-tag'
import { store } from '@/utils/is-client'

const user = {
  userChanged: {
    query: gql`subscription {
                    userChanged{
                      type
                      id
                      item {
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
                        avatar
                        createdAt
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      // common.modify('user', data.userChanged)
      console.log(data)
      const type = data.userChanged.type
      const item = data.userChanged.item
      const _store = store()
      switch (type) {
        case 'add': {
          _store.dispatch('auth/addUser', item)
          break
        }
        case 'edit': {
          _store.dispatch('auth/editUser', item)
          break
        }
        case 'delete': {
          _store.dispatch('auth/deleteUser', data.userChanged.id)
          break
        }
      }
    }
  }
}

export default user
