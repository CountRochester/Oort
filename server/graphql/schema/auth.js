module.exports = `
  type User {
    id: ID!
    name: String!
    employeeId: ID
    firstName: String
    middleName: String
    secondName: String
    currentPositionsId: [ID]
    departmentsId: [ID]
    subdivisionsId: [ID]
    groupsId: [ID]
    avatar: String
    createdAt: TimeStamp!
    updatedAt: TimeStamp!
  }

  type Group {
    id: ID!
    name: String!
    permissions: Int
    createdAt: TimeStamp!
    updatedAt: TimeStamp!
  }

  type Session {
    sid: ID!
    sess: String!
    expire: TimeStamp!
  }
  type Query {
    getAllUsers: [User]
    getUser(id: ID!): User
    getAllGroups: [Group]
    getGroup(id: ID!): Group
    getUserGroups(id: ID!): [Group]
    getUsersOfGroup(id: ID!): [User]
    userCheckPermission(id: ID! permission: Int!): Boolean!
  }

  input UserInput {
    name: String!
    password: String
    employeeId: ID,
    avatar: String
  }

  input GroupInput {
    name: String!
    permissions: Int
  }

  type Mutation {
    addUser(user: UserInput!): Message!
    editUser(id: ID! user: UserInput!): Message!
    deleteUser(id: ID!): Message!
    login(user: UserInput!): AuthMessage!
    addGroup(group: GroupInput!): Message!
    editGroup(id: ID! group: GroupInput!): Message!
    assignUsersToGroup(userId: [ID]! groupId: ID!): Message!
    assignUserToGroups(userId: ID! groupId: [ID]!): Message!
    removeUsersFromGroup(userId: [ID]! groupId: ID!): Message!
    removeUserFromAllGroups(id: ID!): Message!
    deleteGroup(id: ID!): Message!
    deleteUploadedFiles(files: [String]!): Message!
  }
`
