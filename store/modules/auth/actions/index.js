// import * as utils from '../utils'
// import * as departments from './departments'
// import * as employees from './employees'
import * as groups from './groups'
import * as users from './users'
import * as common from './common'

const actions = Object.assign({},
  common.default,
  // departments.default,
  // employees.default,
  groups.default,
  users.default
)

export default actions
