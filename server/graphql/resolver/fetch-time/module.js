const { entity } = require('./entity')
const serverStartTime = (+Date.now()).toString()

const fetchTime = (function () {
  let instance
  function init () {
    // приватная часть
    const fetchTimeArray = {}
    entity.forEach((ent) => { fetchTimeArray[ent] = serverStartTime })
    return {
      // публичная часть
      ...fetchTimeArray
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

module.exports = fetchTime
