import EventEmitter from 'events'

const resolves = {}
const rejects = {}
let globalMsgId = 0
// Activate calculation in the worker, returning a promise
function sendMsg (payload, worker) {
  const msgId = globalMsgId++
  const msg = {
    id: msgId,
    payload
  }
  return new Promise(function (resolve, reject) {
    // save callbacks for later
    resolves[msgId] = resolve
    rejects[msgId] = reject
    worker.postMessage(msg)
  })
}

class WorkerWrapper extends EventEmitter {
  constructor (worker) {
    super()
    this.worker = worker
    this.worker.onmessage = (msg) => {
      const { id, err, payload, event } = msg.data
      if (payload) {
        const resolve = resolves[id]
        if (resolve) {
          resolve(payload)
        } else if (event) {
          this.emit(event, payload)
        }
      } else {
        // error condition
        const reject = rejects[id]
        if (reject) {
          if (err) {
            reject(err)
          } else {
            reject('Got nothing')
          }
        }
      }
      // purge used callbacks
      delete resolves[id]
      delete rejects[id]
    }
  }

  execute (payload) {
    return sendMsg(payload, this.worker)
  }
}

export default WorkerWrapper
