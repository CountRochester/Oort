export default function () {
  return {
    token: null,
    isAuthenticated: null,
    users: [],
    groups: [],
    currentUser: {
      id: null,
      employee: {
        id: null,
        firstName: '',
        middleName: '',
        secondName: '',
        Positions: [],
        Subdivisions: [],
        Departments: []
      },
      groups: [],
      permissions: null,
      selectedDep: null
    }
  }
}
