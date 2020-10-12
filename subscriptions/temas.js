import gql from 'graphql-tag'
import common from './common'

const temas = {
  temaChanged: {
    query: gql`subscription {
                    temaChanged{
                      type
                      id
                      item {
                        id
                        name
                        ContractId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('temas', data.temaChanged)
    }
  }
}

export default temas
