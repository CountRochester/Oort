import gql from 'graphql-tag'
import common from './common'

const intIncomings = {
  intIncomingChanged: {
    query: gql`subscription {
                    intIncomingChanged{
                      type
                      id
                      item {
                        IntIncoming {
                          id
                          subject
                          extNumber
                          extDate
                          extNumberPrefix
                          needAnswer
                          type
                          typeId
                          state
                          stateId
                          incNumber
                          incNumberDigit
                          incDate
                          incNumberId
                          temas
                          temasId
                          author
                          authorId
                          podpisants
                          podpisantsId
                          addressee
                          addresseeId
                          IntIncDepData {
                            DepartmentId
                            state {
                              IntIncStateId
                              StateId
                              StateName
                            }
                            incNumber {
                              IntIncNumberId
                              incNumberDigit
                              incDate
                              prefix
                            }
                          }
                          notes {
                            id
                            DepartmentId
                            text
                          }
                          answers
                          answersId
                          sourceOutgoing
                          sourceOutgoingId
                          resolutions
                          Files
                          FilesId
                        }
                        IncNumbers {
                          id
                          incNumber
                          incDate
                          prefix
                          DepartmentId
                          IntIncomingId
                        }
                        IntIncStates {
                          id
                          IntIncomingId
                          DepartmentId
                          StateId
                        }
                        IntIncFiles {
                          id
                          file
                          IntIncomingId
                          updatedAt
                        }
                        Resolutions {
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
                    }
                  }`,
    result ({ data }) {
      common.modify('intIncomings', data.intIncomingChanged)
    }
  }
}

export default intIncomings
