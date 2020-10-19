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
      const type = data.userChanged.type
      const item = data.userChanged.item
      const _store = store()
      switch (type) {
        case 'add': {
          console.log('add:')
          console.log(data.userChanged.item)
          _store.dispatch('auth/addUser', item)
          break
        }
        case 'edit': {
          console.log('edit:')
          console.log(data.userChanged.item)
          _store.dispatch('auth/editUser', item)
          break
        }
        case 'delete': {
          console.log('delete:')
          console.log(data.userChanged.item)
          _store.dispatch('auth/deleteUser', data.userChanged.id)
          break
        }
      }
    }
  }
}

export default user
