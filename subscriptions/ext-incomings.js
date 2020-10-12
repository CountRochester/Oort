import gql from 'graphql-tag'
import common from './common'

const extIncomings = {
  extIncomingChanged: {
    query: gql`subscription {
                    extIncomingChanged{
                      type
                      id
                      item {
                        ExtIncoming {
                          id
                          subject
                          extNumber
                          extDate
                          needAnswer
                          type
                          TypeId
                          state
                          extIncStateId
                          incNumber
                          incNumberDigit
                          incDate
                          extIncNumberId
                          ExtIncDepData {
                            DepartmentId
                            state {
                              ExtIncStateId
                              StateId
                              StateName
                            }
                            incNumber {
                              ExtIncNumberId
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
                          temas
                          temasId
                          authors
                          authorsId
                          Organisation
                          OrganisationId
                          Executants
                          ExecutantsId
                          resolutions
                          AnswersId
                          Answers
                          Files
                          FilesId
                        }
                        IncNumbers {
                          id
                          incNumber
                          incDate
                          prefix
                          DepartmentId
                          ExtIncomingId
                          updatedAt
                        }
                        ExtIncStates {
                          id
                          ExtIncomingId
                          DepartmentId
                          StateId
                          updatedAt
                        }
                        ExtIncFiles {
                          id
                          file
                          ExtIncomingId
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
                          updatedAt
                        }
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('extIncomings', data.extIncomingChanged)
    }
  }
}

export default extIncomings
