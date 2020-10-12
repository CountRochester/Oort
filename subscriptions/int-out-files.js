import gql from 'graphql-tag'
import common from './common'

const intOutFiles = {
  intOutFileChanged: {
    query: gql`subscription {
                    intOutFileChanged{
                      type
                      id
                      item {
                        id
                        file
                        IntOutgoingId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('intOutFiles', data.intOutFileChanged)
    }
  }
}

export default intOutFiles
