// import metasync from 'metasync'
import entititys from './entititys'

const Storage = (function () {
  let instance
  function init () {
    // приватная часть
    const indexedDb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    const request = indexedDb.open('SKB', 3)
    let db = {}
    const transaction = {}
    const store = {}
    request.onupgradeneeded = () => {
      db = request.result
      for (const ent of entititys) {
        store[ent.entitity] = db.createObjectStore(ent.storageName, { keyPath: 'id' })
      }
    }
    request.onerror = (err) => {
      console.log('Ошибка подключения к локальной БД: ', err)
    }
    request.onsuccess = () => {
      db = request.result
      for (const ent of entititys) {
        transaction[ent.entitity] = db.transaction(ent.storageName, 'readwrite')
        store[ent.entitity] = {
          size: 0,
          async add (item) {
            if (Object.prototype.toString.call(item) === '[object Array]') {
              const tr = db.transaction(ent.storageName, 'readwrite')
              item.forEach((it) => {
                const baseIn = it.toJSON ? it.toJSON() : it
                tr.objectStore(ent.storageName).put(baseIn)
              })
              tr.oncomplete = () => {
                this.count()
                console.log(`Добавление в хранилище ${ent.storageName} успешно!`)
              }
              tr.onerror = () => {
                console.log(tr.error)
                throw new Error('Ошибка добавления массива элементов в локальную базу')
              }
            } else {
              console.log('Вставка в базу:')
              console.dir({ ...item })
              const baseIn = item.toJSON ? item.toJSON() : item
              console.log(baseIn)
              try {
                const tr = db.transaction(ent.storageName, 'readwrite')
                const stor = tr.objectStore(ent.storageName)
                await stor.put({ ...baseIn })
                this.count()
              } catch (err) {
                throw new Error('Ошибка добавления элемента в локальную базу')
              }
            }
          },
          async delete (id) {
            if (!id) { return }
            if (Object.prototype.toString.call(id) === '[object Array]') {
              const tr = db.transaction(ent.storageName, 'readwrite')
              const stor = tr.objectStore(ent.storageName)
              const arrTodelete = []
              id.forEach((it) => {
                arrTodelete.push(stor.delete(it))
              })
              for await (const it of arrTodelete) {
                if (it.error) {
                  throw new Error(`Ошибка удаления элемента id: ${id}: ${it.error}`)
                }
              }
              tr.oncomplete = () => {
                this.count()
                console.log(`Удаление из хранилища ${ent.storageName} успешно!`)
              }
              tr.onerror = () => {
                console.log(tr.error)
                throw new Error('Ошибка удаления массива элементов из локальной базы')
              }
            } else {
              const tr = db.transaction(ent.storageName, 'readwrite')
              const stor = tr.objectStore(ent.storageName)
              try {
                await stor.delete(id)
                await this.count()
                console.log(`Удаление из хранилища ${ent.storageName} успешно!`)
              } catch (err) {
                if (err) {
                  throw new Error(`Ошибка удаления элемента id: ${id}: ${err}`)
                }
              }
            }
          },
          purge () {
            const tr = db.transaction(ent.storageName, 'readwrite')
            const stor = tr.objectStore(ent.storageName)
            stor.clear()
            this.size = 0
          },
          count () {
            const tr = db.transaction(ent.storageName, 'readwrite')
            const stor = tr.objectStore(ent.storageName)
            return new Promise((resolve, reject) => {
              const output = stor.count()
              output.onsuccess = () => {
                this.size = output.result
                // console.log('Size of ' + ent.storageName + 'storage is: ' + this.size)
                resolve(output.result)
              }
              output.onerror = (err) => {
                console.log('Ошибка: ', err)
                reject(err)
              }
            })
          },
          getAll () {
            const mess = `${ent.storageName} Loaded from local DB OK`
            console.time(mess)
            const tr = db.transaction(ent.storageName, 'readwrite')
            const stor = tr.objectStore(ent.storageName)
            return new Promise((resolve, reject) => {
              const output = stor.getAll()
              output.onsuccess = () => {
                console.timeEnd(mess)
                resolve(output.result)
              }
              output.onerror = (err) => {
                console.log('Ошибка: ', err)
                reject(err)
              }
            })
          },
          getById (id) {
            const tr = db.transaction(ent.storageName, 'readwrite')
            const stor = tr.objectStore(ent.storageName)
            return new Promise((resolve, reject) => {
              const output = stor.get(id)
              output.onsuccess = () => {
                resolve(output.result)
              }
              output.onerror = (err) => {
                console.log('Ошибка: ', err)
                reject(err)
              }
            })
          }
        }
        store[ent.entitity].count()
      }
      db.onerror = (err) => {
        console.log('ОШИБКА: ', err.target.error)
      }
    }
    return {
      // публичная часть
      store
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

export default Storage
