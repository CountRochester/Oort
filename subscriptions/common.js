// import Docs from '@/Storage/docs'

// let docs, storage
// Promise.resolve(Docs.getInstance()).then((res) => {
//   docs = res
//   Promise.resolve(docs.buffer).then((res) => { storage = res })
// })

import { app } from '@/utils/is-client'

export default {
  modify (entity, payload) {
    // console.log(payload)
    const _app = app()
    const storage = _app.$docs.buffer
    switch (payload.type) {
      case 'add': {
        // dispatch(`add${entitity}`, payload.item)
        console.log('add:')
        console.log(payload.item)
        storage[entity].addItem(payload.item)
        break
      }
      case 'edit': {
        // dispatch(`edit${entitity}`, payload.item)
        console.log('edit:')
        console.log(payload.item)
        storage[entity].editItem(payload.item)
        break
      }
      case 'delete': {
        // dispatch(`delete${entitity}`, [payload.id])
        console.log('delete:')
        console.log(payload.id)
        storage[entity].deleteItem([payload.id])
        break
      }
      case 'attach': {
        // dispatch(`attach${entitity}`, payload)
        storage[entity].attachItem(payload)
        break
      }
    }
  }
}
