const fetchTime = require('./module')
const fetchTimeArray = fetchTime.getInstance()

module.exports = {
  getFetchTime () {
    return fetchTimeArray
  }
}
