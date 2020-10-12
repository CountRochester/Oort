const messenger = (function () {
  let instance
  function init () {
    // приватная часть
    const messagesArr = []
    return {
      // публичная часть
      getMessages: () => {
        const output = [...messagesArr]
        return output
      },
      getLastMessage: () => {
        const output = { ...messagesArr[messagesArr.length - 1] }
        return output
      },
      addMessage: ({ funcType, result, text, id, item }) => {
        if (result === 'success') {
          messagesArr.push({ funcType, result, text, id, item })
          return 2
        } else if (result === 'error') {
          messagesArr.push({ funcType, result, text, id, item })
          return 1
        } else {
          return undefined
        }
      },
      deleteLastMessage: () => {
        messagesArr.pop()
      },
      purge: () => {
        messagesArr.splice(0, messagesArr.length)
      }
    }
  }
  return {
    getInstance: () => {
      if (!instance) {
        instance = init()
      }
      return instance
    }
  }
})()

export default messenger
