import gql from 'graphql-tag'
import common from './common'

const contracts = {
  contractChanged: {
    query: gql`subscription {
                    contractChanged{
                      type
                      id
                      item {
                        id
                        number
                        date
                        createdAt
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      // this.modify(['Contracts', data.contractChanged])
      common.modify('contracts', data.contractChanged)
    }
  }
}

export default contracts
