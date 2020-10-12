import gql from 'graphql-tag'
import common from './common'

const states = {
  stateChanged: {
    query: gql`subscription {
                    stateChanged{
                      type
                      id
                      item {
                        id
                        name
                        type
                        parentStateId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('states', data.stateChanged)
    }
  }
}

export default states
