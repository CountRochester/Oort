import { gQLRequest } from '@/utils/gql-request'

const InitBuffer = async () => {
  const initBuffer = {
    employees: [],
    extEmployees: [],
    states: []
  }
  let query = `
          query {
            getAllEmployee {
              id
              firstName
              middleName
              secondName
              secondNameDat
            }
          }
        `
  const empl = await gQLRequest(query) || []
  empl.forEach((el) => {
    el.name = `${el.secondName} ${el.firstName[0]}.${el.middleName[0]}.`
    initBuffer.employees[el.id] = el
  })
  query = `query {
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
            updatedAt
          }
        }
        `
  initBuffer.extEmployees = await gQLRequest(query) || []
  query = `query {
          getAllState {
            id
            name
            type
            parentStateId
            updatedAt
          }
        }
        `
  initBuffer.states = await gQLRequest(query) || []
  query = `
          query {
            getAllDepartment {
              id
              depName
              depNumber
              shortName
              depPrefix
              parentDepartmentId
              createdAt
              updatedAt
            }
          }
        `
  initBuffer.departments = await gQLRequest(query) || []
  return initBuffer
}

export default InitBuffer
