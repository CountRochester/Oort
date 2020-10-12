import gql from 'graphql-tag'
import common from './common'

const extOutFiles = {
  extOutFileChanged: {
    query: gql`subscription {
                    extOutFileChanged{
                      type
                      id
                      item {
                        id
                        file
                        ExtOutgoingId
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('extOutFiles', data.extOutFileChanged)
    }
  }
}

export default extOutFiles
