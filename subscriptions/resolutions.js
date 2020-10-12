import gql from 'graphql-tag'
import common from './common'

const resolutions = {
  resolutionChanged: {
    query: gql`subscription {
                resolutionChanged{
                  type
                  id
                  item {
                    id
                    text
                    expirationDate
                    extIncoming
                    intIncoming
                    internal
                    author
                    executants
                    complete
                    createdAt
                    updatedAt
                  }
                }
              }`,
    result ({ data }) {
      common.modify('resolutions', data.resolutionChanged)
    }
  }
}

export default resolutions
