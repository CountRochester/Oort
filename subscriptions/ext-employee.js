import gql from 'graphql-tag'
import common from './common'

const extEmployees = {
  extEmployeeChanged: {
    query: gql`subscription {
                    extEmployeeChanged{
                      type
                      id
                      item {
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
                  }`,
    result ({ data }) {
      common.modify('extEmployees', data.extEmployeeChanged)
    }
  }
}

export default extEmployees
