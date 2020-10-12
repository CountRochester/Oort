import gql from 'graphql-tag'
import common from './common'

const currentPositions = {
  currentPositionChanged: {
    query: gql`subscription {
                currentPositionChanged{
                  type
                  id
                  item {
                    id
                    startDate
                    endDate
                    EmployeeId
                    PositionId
                    DepartmentId
                    SubdivisionId
                    Subdivision
                    extPrefix
                    intPrefix
                    createdAt
                    updatedAt
                  }
                }
              }`,
    result ({ data }) {
      common.modify('currentPositions', data.currentPositionChanged)
    }
  }
}

export default currentPositions
