import gql from 'graphql-tag'
import common from './common'

const internals = {
  internalChanged: {
    query: gql`subscription {
                    internalChanged{
                      type
                      id
                      item {
                        Internal {
                          id
                          incNumber
                          incDate
                          incNumberId
                          incNumberDigit
                          subject
                          docNumber
                          docDate
                          docNumberPrefix
                          type
                          typeId
                          temas 
                          temasId
                          state
                          stateId
                          author
                          authorId
                          InternalDepData {
                            DepartmentId
                            state {
                              InternalStateId
                              StateId
                              StateName
                            }
                            incNumber {
                              InternalIncNumberId
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
                          podpisants
                          podpisantsId
                          addressee
                          addresseeId
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
                          InternalId
                        }
                        InternalStates {
                          id
                          InternalId
                          DepartmentId
                          StateId
                        }
                        InternalFiles {
                          id
                          file
                          InternalId
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
      common.modify('internals', data.internalChanged)
    }
  }
}

export default internals
