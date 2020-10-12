import gql from 'graphql-tag'
import common from './common'

const extCurrentPositions = {
  extCurrentPositionChanged: {
    query: gql`subscription {
                    extCurrentPositionChanged{
                      type
                      id
                      item {
                        id
                        startDate
                        endDate
                        ExtEmployeeId
                        Position
                        PositionId
                        Organisation
                        OrganisationId
                        createdAt
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('extCurrentPositions', data.extCurrentPositionChanged)
    }
  }
}

export default extCurrentPositions
