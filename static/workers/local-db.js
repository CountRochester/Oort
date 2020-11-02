importScripts('./sync.js')
importScripts('./server-request.js')
const entitys = [
  { entity: 'config', storageName: 'Config', type: 'service' },
  { entity: 'fetchTime', storageName: 'LastFetchTime', type: 'service' },
  {
    entity: 'contracts',
    name: 'Контрактов',
    storageName: 'Contracts',
    type: 'Docs'

  },
  {
    entity: 'temas',
    name: 'Тем',
    storageName: 'Temas',
    type: 'Docs'

  },
  {
    entity: 'organisations',
    name: 'Организаций',
    storageName: 'Organisations',
    type: 'Docs'

  },
  {
    entity: 'states',
    name: 'Состояний',
    storageName: 'States',
    type: 'Docs'

  },
  {
    entity: 'types',
    name: 'Типов документов',
    storageName: 'Types',
    type: 'Docs'
  },
  {
    entity: 'positions',
    name: 'Должностей',
    storageName: 'Positions',
    type: 'Docs'
  },
  {
    entity: 'departments',
    name: 'Отделов',
    storageName: 'Departments',
    type: 'Docs'
  },
  {
    entity: 'subdivisions',
    name: 'Подразделений',
    storageName: 'Subdivisions',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  // --------------------------------- Должности ------------------------------------------------
  {
    entity: 'currentPositions',
    name: 'Штатных единиц',
    storageName: 'CurrentPositions',
    type: 'Docs'
  },
  {
    entity: 'extCurrentPositions',
    name: 'Внешних штатных единиц',
    storageName: 'ExtCurrentPositions',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  // ----------------------------------- Служащие -----------------------------------------------
  {
    entity: 'employees',
    name: 'Работников',
    storageName: 'Employees',
    type: 'Docs'
  },
  {
    entity: 'extEmployees',
    name: 'Внешних работников',
    storageName: 'ExtEmployees',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  {
    entity: 'extIncomings',
    name: 'Внешних входящих документов',
    storageName: 'ExtIncomings',
    type: 'Docs'
  },
  {
    entity: 'extOutgoings',
    name: 'Внешних исходящих документов',
    storageName: 'ExtOutgoings',
    type: 'Docs'
  },
  {
    entity: 'intIncomings',
    name: 'Внутренних входящих документов',
    storageName: 'IntIncomings',
    type: 'Docs'
  },
  {
    entity: 'intOutgoings',
    name: 'Внутренних исходящих документов',
    storageName: 'IntOutgoings',
    type: 'Docs'
  },
  {
    entity: 'internals',
    name: 'Внутренних прочих документов',
    storageName: 'Internals',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  {
    entity: 'incNumbers',
    name: 'Входящих номеров на внешние документы',
    storageName: 'IncNumbers',
    type: 'Docs'
  },
  {
    entity: 'intIncNumbers',
    name: 'Входящих номеров на внутренние документы',
    storageName: 'IntIncNumbers',
    type: 'Docs'
  },
  {
    entity: 'internalIncNumbers',
    name: 'Входящих номеров на внутренние прочие документы',
    storageName: 'InternalIncNumbers',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  {
    entity: 'extIncFiles',
    name: 'Файлов внешних входящих',
    storageName: 'ExtIncFiles',
    type: 'Docs'
  },
  {
    entity: 'extOutFiles',
    name: 'Файлов внешних исходящих',
    storageName: 'ExtOutFiles',
    type: 'Docs'
  },
  {
    entity: 'intIncFiles',
    name: 'Файлов внутренних входящих',
    storageName: 'IntIncFiles',
    type: 'Docs'
  },
  {
    entity: 'intOutFiles',
    name: 'Файлов внутренних исходящих',
    storageName: 'IntOutFiles',
    type: 'Docs'
  },
  {
    entity: 'internalFiles',
    name: 'Файлов внутренних прочих',
    storageName: 'InternalFiles',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  {
    entity: 'extIncStates',
    name: 'Состояний внешних входящих',
    storageName: 'ExtIncStates',
    type: 'Docs'
  },
  {
    entity: 'intIncStates',
    name: 'Состояний внутренних входящих',
    storageName: 'IntIncStates',
    type: 'Docs'
  },
  {
    entity: 'internalIncStates',
    name: 'Состояний внутренних прочих входящих',
    storageName: 'InternalIncStates',
    type: 'Docs'
  },
  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------
  {
    entity: 'resolutions',
    name: 'Резолюций',
    storageName: 'Resolutions',
    type: 'Docs'
  }

]

let request = {}
let db = {}
const transaction = {}
const store = {}
const needToSync = []

let selectedDepartment

self.onmessage = async ({ data }) => {
  if (data.payload === 'init') {
    request = self.indexedDB.open('SKB', 3)
    request.onupgradeneeded = () => {
      db = request.result
      for (const ent of entitys) {
        store[ent.entity] = db.createObjectStore(ent.storageName, { keyPath: 'id' })
      }
    }
    request.onerror = (err) => {
      console.log('Ошибка подключения к локальной БД: ', err)
    }
    request.onsuccess = async () => {
      db = request.result
      for (const ent of entitys) {
        transaction[ent.entity] = db.transaction(ent.storageName, 'readwrite')
        store[ent.entity] = {
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
              console.log('Вставка в базу:', item)
              try {
                const tr = db.transaction(ent.storageName, 'readwrite')
                const stor = tr.objectStore(ent.storageName)
                await stor.put({ ...item })
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
              // for await (const it of arrTodelete) {
              //   if (it.error) {
              //     throw new Error(`Ошибка удаления элемента id: ${id}: ${it.error}`)
              //   }
              // }
              tr.oncomplete = () => {
                this.count()
                console.log(`Удаление из хранилища ${ent.storageName} успешно!`)
              }
              tr.onerror = () => {
                console.log(tr.error)
                throw new Error('Ошибка удаления массива элементов из локальной базы')
              }
              try {
                await Promise.all(arrTodelete)
              } catch (err) {
                throw new Error(`Ошибка удаления элемента id: ${id}: ${err}`)
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
                resolve(output.result)
              }
              output.onerror = (err) => {
                console.log('Ошибка: ', err)
                reject(err)
              }
            })
          },
          getAll () {
            // const mess = `${ent.storageName} Loaded from local DB OK`
            // console.time(mess)
            const tr = db.transaction(ent.storageName, 'readwrite')
            const stor = tr.objectStore(ent.storageName)
            return new Promise((resolve, reject) => {
              const output = stor.getAll()
              output.onsuccess = () => {
                // console.timeEnd(mess)
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
                console.error('Ошибка: ', err)
                reject(err)
              }
            })
          }
        }
        await store[ent.entity].count()
        if (!store[ent.entity].size) { needToSync.push(ent.entity) }
      }
      db.onerror = (err) => {
        console.log('ОШИБКА: ', err.target.error)
      }
      const result = { id: data.id, payload: 'init OK' }
      self.postMessage(result)
    }
  } else if (data.payload.fun === 'setSelectedDepartment') {
    selectedDepartment = data.payload.par
    const result = { id: data.id, payload: 'OK' }
    self.postMessage(result)
  } else if (data.payload.fun === 'initSync') {
    await initSync()
    const result = { id: data.id, payload: 'OK' }
    self.postMessage(result)
  } else if (data.payload.fun === 'fetchById') {
    console.log('Called fetchById')
    console.log('data.payload:', data.payload)
    const item = await getElementsById(data.payload.storage, data.payload.par)
    await store[data.payload.storage].add(item)
    const result = { id: data.id, payload: item }
    self.postMessage(result)
  } else {
    const { storage, fun, par } = data.payload
    try {
      const payload = await store[storage][fun](par) || 'Ok'
      const result = { id: data.id, payload }
      self.postMessage(result)
    } catch (err) {
      console.error(err)
    }
  }
}

const syncTimer = setInterval(async () => {
  if (selectedDepartment) {
    await sync()
    clearInterval(syncTimer)
  }
}, 15000)
