import gql from 'graphql-tag'
import common from './common'

const positions = {
  positionChanged: {
    query: gql`subscription {
                    positionChanged{
                      type
                      id
                      item {
                        id
                        posName
                        posNameDat
                        canSignExtDocs
                        canSignIntDocs
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('positions', data.positionChanged)
    }
  }
}

export default positions
