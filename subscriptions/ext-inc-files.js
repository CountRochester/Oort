import gql from 'graphql-tag'
import common from './common'

const extIncFiles = {
  extIncFileChanged: {
    query: gql`subscription {
                    extIncFileChanged{
                      type
                      id
                      item {
                        id
                        file
                        ExtIncomingId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('extIncFiles', data.extIncFileChanged)
    }
  }
}

export default extIncFiles
