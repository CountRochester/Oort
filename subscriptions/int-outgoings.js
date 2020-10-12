import gql from 'graphql-tag'
import common from './common'

const intOutgoings = {
  intOutgoingChanged: {
    query: gql`subscription {
                    intOutgoingChanged{
                      type
                      id
                      item {
                        IntOutgoing {
                          id
                          outNumber
                          outNumberDigit
                          outDate
                          prefix
                          subject
                          author
                          authorId
                          type
                          typeId
                          state
                          stateId
                          addressees
                          addresseesId
                          podpisants
                          podpisantsId
                          temas
                          temasId
                          department
                          departmentId
                          note
                          files
                          filesId
                          isAnswerOn
                          isAnswerOnId
                        }
                        IntOutFiles {
                          id
                          file
                          IntOutgoingId
                          updatedAt
                        }
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('intOutgoings', data.intOutgoingChanged)
    }
  }
}

export default intOutgoings
