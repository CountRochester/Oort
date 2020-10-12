import gql from 'graphql-tag'
import common from './common'

const extOutgoings = {
  extOutgoingChanged: {
    query: gql`subscription {
                    extOutgoingChanged{
                      type
                      id
                      item {
                        ExtOutgoing {
                          id
                          outNumber
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
                          organisations
                          organisationsId
                          department
                          departmentId
                          note
                          files
                          filesId
                          isAnswerOn
                          isAnswerOnId
                        }
                        ExtOutFiles {
                          id
                          file
                          ExtOutgoingId
                          updatedAt
                        }
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('extOutgoings', data.extOutgoingChanged)
    }
  }
}

export default extOutgoings
