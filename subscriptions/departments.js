import gql from 'graphql-tag'
import common from './common'

const departments = {
  departmentChanged: {
    query: gql`subscription {
                    departmentChanged{
                      type
                      id
                      item {
                        id
                        depName
                        depNumber
                        shortName
                        depPrefix
                        parentDepartmentId
                        createdAt
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('departments', data.departmentChanged)
    }
  }
}

export default departments
