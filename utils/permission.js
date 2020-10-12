export function checkUserPermission (userPermission, neededPermission) {
  try {
    if (!userPermission) {
      if (!neededPermission) {
        return true
      }
      return false
    }
    const userPermissionStr = userPermission.toString()
    const permissionStr = neededPermission.toString(2)
    let result = true
    for (let i = 0; i < 32; i++) {
      const item1 = permissionStr[permissionStr.length - i] ? permissionStr[permissionStr.length - i] : '0'
      const item2 = userPermissionStr[userPermissionStr.length - i] ? userPermissionStr[userPermissionStr.length - i] : '0'
      if (item1 > item2) {
        result = false
      }
    }
    return result
  } catch (err) {
    throw err
  }
}
