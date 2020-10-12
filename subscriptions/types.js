import gql from 'graphql-tag'
import common from './common'

const types = {
  typeChanged: {
    query: gql`subscription {
                    typeChanged{
                      type
                      id
                      item {
                        id
                        name
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('types', data.typeChanged)
    }
  }
}

export default types
