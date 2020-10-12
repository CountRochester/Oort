const requests = {
  extIncomings: {
    all () {
      return `query {
        getExtIncomingRequest(id: "${selectedDepartment}") {
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
          updatedAt
        }
      }
    `
    },
    byId (id) {
      return `query {
        getExtIncomingRequestById(id: "${id}") {
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
          AnswersId
          Answers
          Files
          FilesId
        }
      }
    `
    }
  },
  extOutgoings: {
    all () {
      return `query {
                getExtOutgoingRequest (id: "${selectedDepartment}") {
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
                  updatedAt
                }
              }
            `
    },
    byId (id) {
      return `query {
        getExtOutgoingRequestById (id: "${id}") {
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
      }
    `
    }
  },
  intIncomings: {
    all () {
      return `query {
                getIntIncomingRequest (id: "${selectedDepartment}") {
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
                  updatedAt
                }
              }
            `
    },
    byId (id) {
      return `query {
                getIntIncomingRequestById (id: "${id}") {
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
              }
            `
    }
  },
  intOutgoings: {
    all () {
      return `query {
                getIntOutgoingRequest (id: "${selectedDepartment}") {
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
                  updatedAt
                }
              }
            `
    },
    byId (id) {
      return `query {
        getIntOutgoingRequestById (id: "${id}") {
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
      }
    `
    }
  },
  internals: {
    all () {
      return `query {
                getInternalRequest (id: "${selectedDepartment}") {
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
                  updatedAt
                }
              }
            `
    },
    byId (id) {
      return `query {
            getInternalRequestById (id: "${id}") {
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
          }
        `
    }
  },
  // ------------------------------------------------------------------------------------------------------------
  incNumbers: {
    all () {
      return `query {
          getAllIncomingNumber{
            id
            incNumber
            incDate
            prefix
            DepartmentId
            ExtIncomingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  intIncNumbers: {
    all () {
      return `query {
          getAllIntIncomingNumber{
            id
            incNumber
            incDate
            prefix
            DepartmentId
            IntIncomingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  internalIncNumbers: {
    all () {
      return `query {
          getAllInternalIncomingNumber{
            id
            incNumber
            incDate
            prefix
            DepartmentId
            InternalId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  // ------------------------------------------------------------------------------------------------------------
  extIncFiles: {
    all () {
      return `query {
          getAllExtIncFile {
            id
            file
            ExtIncomingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  extOutFiles: {
    all () {
      return `query {
          getAllExtOutFile {
            id
            file
            ExtOutgoingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  intIncFiles: {
    all () {
      return `query {
          getAllIntIncFile {
            id
            file
            IntIncomingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  intOutFiles: {
    all () {
      return `query {
          getAllIntOutFile {
            id
            file
            IntOutgoingId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  internalFiles: {
    all () {
      return `query {
          getAllInternalFile {
            id
            file
            InternalId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  // ------------------------------------------------------------------------------------------------------------
  extIncStates: {
    all () {
      return `query {
          getAllExtIncState {
            id
            ExtIncomingId
            DepartmentId
            StateId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  intIncStates: {
    all () {
      return `query {
          getAllIntIncState {
            id
            IntIncomingId
            DepartmentId
            StateId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  internalIncStates: {
    all () {
      return `query {
          getAllInternalIncState {
            id
            InternalId
            DepartmentId
            StateId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  // ------------------------------------------------------------------------------------------------------------
  employees: {
    all () {
      return `
      query {
        getAllEmployee {
          id
          firstName
          middleName
          secondName
          secondNameDat
          tabelNumber
          phone1
          phone2
          phone3
          email1
          email2
          Positions
          Subdivisions
          updatedAt
        }
      }
    `
    },
    byId (id) {
    }
  },
  extEmployees: {
    all () {
      return `query {
          getAllExtEmployee {
            id
            firstName
            secondName
            secondNameDat
            middleName
            phone1
            phone2
            fax
            email1
            email2
            extCurrentPositionsId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  positions: {
    all () {
      return `query {
          getAllPosition {
            id
            posName
            posNameDat
            canSignExtDocs
            canSignIntDocs
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  currentPositions: {
    all () {
      return `query {
          getAllCurrentPosition {
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
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  extCurrentPositions: {
    all () {
      return `query {
          getAllExtCurrentPosition {
            id
            startDate
            endDate
            ExtEmployeeId
            Position
            PositionId
            Organisation
            OrganisationId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  // ------------------------------------------------------------------------------------------------------------
  contracts: {
    all () {
      return `query {
          getAllContract {
            id
            number
            date
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  temas: {
    all () {
      return `query {
          getAllTema {
            id
            name
            ContractId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  organisations: {
    all () {
      return `query {
          getAllOrganisation {
            id
            orgName
            postNumber
            city
            region
            street
            building
            phone
            fax
            email
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  states: {
    all () {
      return `query {
          getAllState {
            id
            name
            type
            parentStateId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  types: {
    all () {
      return `query {
          getAllType {
            id
            name
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  resolutions: {
    all () {
      return `query {
              getAllResolutionsInDepE (id: "${selectedDepartment}") {
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
            `
    },
    byId (id) {
    }
  },
  subdivisions: {
    all () {
      return `query {
          getAllSubdivision {
            id
            name
            fullName
            DepartmentId
            updatedAt
          }
        }
        `
    },
    byId (id) {
    }
  },
  departments: {
    all () {
      return `
          query {
            getAllDepartment {
              id
              depName
              depNumber
              shortName
              depPrefix
              parentDepartmentId
              updatedAt
            }
          }
        `
    },
    byId (id) {
    }
  }
}
