import gql from 'graphql-tag'
import common from './common'

const internalFiles = {
  internalFileChanged: {
    query: gql`subscription {
                    internalFileChanged{
                      type
                      id
                      item {
                        id
                        file
                        InternalId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('internalFiles', data.internalFileChanged)
    }
  }
}

export default internalFiles
