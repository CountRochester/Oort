import gql from 'graphql-tag'
import common from './common'

const subdivisions = {
  subdivisionChanged: {
    query: gql`subscription {
                    subdivisionChanged{
                      type
                      id
                      item {
                        id
                        name
                        fullName
                        DepartmentId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('subdivisions', data.subdivisionChanged)
    }
  }
}

export default subdivisions
