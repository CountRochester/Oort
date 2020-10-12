import gql from 'graphql-tag'
import common from './common'

const intIncFiles = {
  intIncFileChanged: {
    query: gql`subscription {
                    intIncFileChanged{
                      type
                      id
                      item {
                        id
                        file
                        IntIncomingId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('intIncFiles', data.intIncFileChanged)
    }
  }
}

export default intIncFiles
