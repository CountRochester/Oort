export function setToken (state, token) {
  state.token = token
}
export function setAuth (state) {
  state.isAuthenticated = Boolean(state.token)
}
export function add (state, [entitity, item]) {
  state[`${entitity}`].push(item)
}
export function set (state, [entitity, item]) {
  state[`${entitity}`] = item
}
export function edit (state, [entitity, item]) {
  for (let i = 0; i < state[entitity].length; i++) {
    if (state[`${entitity}`][i].id === item.id) {
      state[`${entitity}`][i] = item
      return
    }
  }
}

export function softEdit (state, [entitity, item]) {
  const editedItem = state[entitity].find(el => el.id === item.id)
  if (editedItem) {
    for (const key in editedItem) {
      if (editedItem[key] !== item[key]) {
        editedItem[key] = item[key]
      }
    }
  }
}

export function hardEdit (state, [entitity, item]) {
  state[entitity] = state[entitity].filter(el => el.id !== item.id)
  state[`${entitity}`].push(item)
}

export function findAndDeleteById (state, [entitity, id]) {
  state[entitity] = state[entitity].filter(el => el.id !== id)
}

export function reset (state, entitity) {
  state[`${entitity}`] = []
}

export function setCurrentUser (state, user) {
  state.currentUser = user
}
export function setCurrentUserGroups (state, groups) {
  state.currentUser.groups = groups
}
export function setCurrentUserId (state, userId) {
  state.currentUser.id = userId
}
export function setCurrentUserPermissions (state, permissions) {
  state.currentUser.permissions = permissions
}
export function setCurrentEmployeeId (state, employeeId) {
  state.currentUser.employee.id = employeeId
}
export function setCurrentEmployee (state, employee) {
  state.currentUser.employee = employee
}
export function setCurrentUserDep (state, selectedDep) {
  state.currentUser.selectedDep = selectedDep
}
export function setCurrentUserDepartments (state, Departments) {
  state.currentUser.employee.Departments = Departments
}
