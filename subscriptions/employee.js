import gql from 'graphql-tag'
import common from './common'

const employees = {
  employeeChanged: {
    query: gql`subscription {
                    employeeChanged{
                      type
                      id
                      item {
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
                        createdAt
                        updatedAt
                      }
                    }
                  }`,
    result ({ data }) {
      common.modify('employees', data.employeeChanged)
    }
  }
}

export default employees
