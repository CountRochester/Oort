import gql from 'graphql-tag'
import common from './common'

const organisations = {
  organisationChanged: {
    query: gql`subscription {
                    organisationChanged{
                      type
                      id
                      item {
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
                  }`,
    result ({ data }) {
      common.modify('organisations', data.organisationChanged)
    }
  }
}

export default organisations
