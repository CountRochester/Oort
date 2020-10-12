import { app } from '@/utils/is-client'

export function isAuthenticated (state) {
  return Boolean(state.token)
}
export function getUser (state) {
  if (state.currentUser) {
    return state.currentUser
  } else {
    return null
  }
}
export function getUserDep (state) {
  const deps = []
  if (state.currentUser) {
    const _app = app()
    const storage = _app.$docs.buffer
    state.currentUser.employee.Departments.forEach((depId) => {
      const dep = storage.departments.indexed[depId]
      if (dep.isValid) {
        deps.push(dep)
      }
    })
  }
  return deps
}

export function getUserShortName (state) {
  if (state.currentUser) {
    if (state.currentUser.employee.id) {
      return state.currentUser.employee.secondName + state.currentUser.employee.firstName[0] + state.currentUser.employee.middleName[0]
    } else if (state.currentUser.id) {
      const user = state.users.find(el => el.id === state.currentUser.id)
      return user ? user.name : ''
    }
  } else {
    return null
  }
}
// export function getEmployeeById (state) {
//   if (state.employees.length) {
//     const employees = {}
//     state.employees.forEach((el) => { employees[el.id] = el })
//     return employees
//   } else {
//     return {}
//   }
// }
export function getUserById (state) {
  if (state.users.length) {
    const users = {}
    state.users.forEach((el) => { users[el.id] = el })
    return users
  } else {
    return {}
  }
}
export function getGroupById (state) {
  if (state.groups.length) {
    const groups = {}
    state.groups.forEach((el) => { groups[el.id] = el })
    return groups
  } else {
    return {}
  }
}
// export function getDepById (state) {
//   if (state.deps.length) {
//     const deps = {}
//     state.deps.forEach((el) => { deps[el.id] = el })
//     return deps
//   } else {
//     return {}
//   }
// }
export function getSelectDep (state) {
  if (!state) { return null }
  if (!state.currentUser) { return null }
  return state.currentUser.selectedDep
}
export function getUserPermission (state) {
  return state.currentUser.permissions
}
