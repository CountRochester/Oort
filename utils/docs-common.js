export function formDepData (ctx, request, variables, type) {
  let newIncNum
  if (ctx.newState) {
    request.DepData.state = ctx.newState
  }
  if (ctx.$refs.docNote) {
    request.DepData.noteText = ctx.$refs.docNote.getNewNote() || ''
  }
  variables.txt = request.DepData.noteText || undefined
  if (ctx.editedIndex === -1) {
    if (ctx.editedItem.incNumber && ctx.$refs.incNumber) {
      newIncNum = ctx.$refs.incNumber.getNewIncNumberData()
      request.DepData.incNumber = newIncNum.incNumber
      request.DepData.incDate = newIncNum.incDate
      request.DepData.prefix = newIncNum.prefix
    }
  } else {
    request.DepData.changedState = ctx.$refs.editState ? ctx.$refs.editState.getChangedState() : null
    if (ctx.$refs.editRes) {
      request[type].resolutions = {
        resolutionsToAdd: ctx.$refs.editRes.getResolutionsToAdd(),
        resolutionsToEdit: ctx.$refs.editRes.getResolutionsToEdit(),
        resolutionsToDelete: ctx.$refs.editRes.getResolutionsIdToDelete()
      }
      variables.res = JSON.stringify(request[type].resolutions)
    }
    if (ctx.$refs.incNumber && ctx.$refs.incNumber.incNumChanged && !ctx.$refs.incNumber.incNumToDelete) {
      newIncNum = ctx.$refs.incNumber.getNewIncNumberData()
      request.DepData.incNumber = newIncNum.incNumber
      request.DepData.incDate = newIncNum.incDate
      request.DepData.prefix = newIncNum.prefix
    }
  }
  return (request.DepData.incNumber || request.DepData.state || request.DepData.noteText || request.DepData.changedState)
    ? `DepData: {
                DepartmentId: "${request.DepData.DepartmentId}"
                ${request.DepData.incNumber ? 'incNumber: ' + request.DepData.incNumber : ''}
                ${request.DepData.incDate ? 'incDate: "' + request.DepData.incDate + '"' : ''}
                ${request.DepData.prefix ? 'prefix: "' + request.DepData.prefix + '"' : ''}
                ${request.DepData.state ? 'state: "' + request.DepData.state + '"' : ''}
                ${request.DepData.noteText ? 'noteText: $txt' : ''}
                ${request.DepData.changedState ? 'changedState: ' + request.DepData.changedState : ''}
              }`
    : ''
}
