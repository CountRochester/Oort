import consola from 'consola'
import { multisort } from '@/utils/array'
import Messenger from '@/utils/messenger'
import * as metasync from '@/utils/metasync-array'
import InitBuffer from './init-buffer'
import allEentititys from './entititys'
import { createItemsArray } from './items-array'
import WorkerWrapper from './worker-wrapper'

async function formElements (entity, arr) {
  let formedArr = []
  const tempArr = []
  if (entity.form) {
    for (let i = 0; i < arr.length; i++) {
      tempArr.push(new Promise((resolve) => {
        setTimeout(() => {
          resolve(entity.form(arr[i]))
        }, 0)
      }))
    }
    for await (const elem of tempArr) {
      formedArr.push(await elem)
    }
  } else { formedArr = arr }
  return createItemsArray(entity.entitity, formedArr)
}

const fullEntititys = allEentititys

const Docs = (function () {
  let instance
  async function init (clientContext) {
    const context = clientContext
    const workerDB = process.browser ? new Worker('./workers/local-db.js') : {}
    const localDB = new WorkerWrapper(workerDB)
    const funArray = ['add', 'delete', 'purge', 'count', 'getAll', 'getById']
    const storageInit = async function () {
      const storageZ = {}
      await localDB.execute('init')
      allEentititys.forEach((ent) => {
        storageZ[ent.entitity] = {}
        funArray.forEach((fun) => {
          storageZ[ent.entitity][fun] = async (par) => {
            const res = await localDB.execute({ storage: ent.entitity, fun, par })
            return res
          }
        })
      })
      storageZ.setSelectedDepartment = async (depId) => {
        const res = await localDB.execute({ fun: 'setSelectedDepartment', par: depId })
        return res
      }
      storageZ.initSync = async () => {
        const res = await localDB.execute({ fun: 'initSync' })
        return res
      }
      return storageZ
    }

    const storage = await storageInit()
    context.$storage = storage

    const messenger = Messenger.getInstance()
    const entititys = fullEntititys.filter(el => el.type === 'Docs') || []
    const initBuffer = await InitBuffer()
    if (!initBuffer) {
      consola.error('Ошибка буфера инициализации')
    }
    const buffer = {}
    const firstInit = { init: false }
    const needToSync = []
    const updateAll = async (options = {}) => {
      consola.info('Update starts')
      // console.time('updateAll')
      // console.log('Options:', options)
      if (!options.init) {
        context.store.dispatch('navInterface/setLoadingData', {
          loadingProgress: 0,
          loadingMessage: 'Обновление',
          loadingStatus: 'pending'
        })
        let progress = 0
        const delta = 100 / entititys.length
        const updateEnts = entititys.map(ent => buffer[ent.entitity].updateAll().then(() => {
          progress += delta
          context.store.dispatch('navInterface/setLoadingData', {
            loadingProgress: progress,
            loadingMessage: 'Обновление',
            loadingStatus: 'pending'
          })
        }))
        await Promise.all(updateEnts)
        context.store.dispatch('navInterface/setLoadingData', {
          loadingProgress: 100,
          loadingMessage: 'Обновление завершено',
          loadingStatus: 'success'
        })
      } else {
        const updateEnts = entititys.map(ent => buffer[ent.entitity].updateAll())
        await Promise.all(updateEnts)
      }
      // console.timeEnd('updateAll')
      consola.success('Update: OK')
    }
    const loadBeforeUse = async () => {
      // 2 Определение необходимости синхронизации
      context.store.dispatch('navInterface/setLoadingData', {
        loadingProgress: 25,
        loadingMessage: 'Определение необходимости синхронизации',
        loadingStatus: 'pending'
      })
      // await initSync()
      await storage.initSync()
      // 4 Синхронизация
      context.store.dispatch('navInterface/setLoadingData', {
        loadingProgress: 50,
        loadingMessage: 'Синхронизация с сервером',
        loadingStatus: 'pending'
      })
      if (needToSync.length) {
        consola.info('Необходима синхронизация:', needToSync)
      }
      await updateAll({ init: true })
      context.store.dispatch('navInterface/setLoadingData', {
        loadingProgress: 100,
        loadingMessage: 'Загрузка завершена',
        loadingStatus: 'success'
      })
    }

    const updateEntitys = async (entArr) => {
      context.store.dispatch('navInterface/setLoadingData', {
        loadingProgress: 0,
        loadingMessage: 'Обновление',
        loadingStatus: 'pending'
      })
      let progress = 0
      let delta, updateEnts
      const handler = name => () => {
        progress += delta
        context.store.dispatch('navInterface/setLoadingData', {
          loadingProgress: progress,
          loadingMessage: `Обновление ${name} завершено`,
          loadingStatus: 'pending'
        })
      }
      if (entArr && entArr.length) {
        delta = 100 / entArr.length
        updateEnts = entArr.map(ent => buffer[ent].updateAll()
          .then(handler(entititys.find(el => el.entitity === ent).name)))
      } else {
        delta = 100 / entititys.length
        updateEnts = entititys.map(ent => buffer[ent.entitity].updateAll().then(handler(ent.name)))
      }
      await Promise.all(updateEnts)
      context.store.dispatch('navInterface/setLoadingData', {
        loadingProgress: 100,
        loadingMessage: 'Обновление завершено',
        loadingStatus: 'success'
      })
    }

    for (const ent of entititys) {
      buffer[ent.entitity] = {
        items: createItemsArray(ent.entitity),
        indexed: createItemsArray(ent.entitity),
        synchronization: false,

        addItem: ent.addItem ? (...args) => { return ent.addItem(instance, ...args) } : undefined,
        editItem: ent.editItem ? (...args) => { return ent.editItem(instance, ...args) } : undefined,
        updateItem: ent.updateItem ? (...args) => { return ent.updateItem(instance, ...args) } : undefined,
        deleteItem: ent.deleteItem ? (...args) => { return ent.deleteItem(instance, ...args) } : undefined,

        async add (item, ctx = this, options = {}) {
          console.log('Add', ent.entitity)
          console.log('item', item)
          if (!item) { return undefined }
          if (!item.id) { return undefined }
          // Определение есть ли такой элемент в буфер
          const existedItem = ctx.indexed[item.id]
          if (existedItem.isValid) {
            // Редактировать элемент, если есть в буфере
            try {
              console.log('Редактирование')
              await ctx.edit(item.id, item, ctx, options)
              if (!options.multiple) {
                messenger.addMessage({
                  funcType: `${ent.entitity}.add`,
                  result: 'success',
                  text: 'Элемент успешно добавлен',
                  id: item.id,
                  item
                })
              }
            } catch (err) {
              messenger.addMessage({
                funcType: `${ent.entitity}.add`,
                result: 'error',
                text: err,
                id: item.id,
                item
              })
              return {
                result: 'error',
                text: err,
                id: item.id
              }
            }
            return null
          } else {
            // Добавление нового элемента при его отсутствии в буфере
            let element
            if (ent.form && !options.sync) {
              element = ent.form(item)
            } else {
              element = item
            }
            // Добавить элемент в буфер если не идёт синхронизация
            if (!options.sync) {
              ctx.items.push(element)
              ctx.indexed[element.id] = element
              if (ent.sort) {
                ctx.items = ctx.items.sort(multisort(ent.sort()))
              } else {
                ctx.items = ctx.items.sort((a, b) => a.id - b.id)
              }
            }
            try {
              const baseIn = element.toJSON ? element.toJSON() : element
              await storage[ent.entitity].add(baseIn)
            } catch (err) {
              messenger.addMessage({
                funcType: `${ent.entitity}.add`,
                result: 'error',
                text: err,
                id: element.id,
                element
              })
              // Откат
              if (!options.sync) {
                ctx.items = ctx.items.filter(el => el.id !== element.id)
                ctx.indexed[element.id] = undefined
              }
              return {
                result: 'error',
                text: err,
                id: element.id
              }
            }
          }
        },

        async edit (id, item, ctx = this, options = {}) {
          if (Object.prototype.toString.call(id) === '[object Array]') {
            if (Object.prototype.toString.call(item) !== '[object Array]' ||
              item.length !== id.length) {
              return undefined
            }
            // Формирование массива для отката
            const bakup = []
            for (const elId of id) {
              bakup.push(ctx.indexed[elId].toJSON())
            }
            // Формирование буффера
            const editedItems = []
            if (!ent.form && !options.sync) {
              for (const elemId of id) {
                const existedItem = ctx.indexed[elemId]
                for (const key in item) {
                  existedItem[key] = item[key]
                }
              }
            } else {
              for (const elem of item) {
                editedItems.push(await ent._editItem(instance, elem))
              }
            }
            console.log(`Буффер с ${ent.entitity} успешно обновлён`)
            // Запись в локальную БД
            try {
              await storage[ent.entitity].add(editedItems.map(item => item.toJSON ? item.toJSON() : item))
              messenger.addMessage({
                funcType: `${ent.entitity}.edit`,
                result: 'success',
                text: 'Редактирование элементов хранилища ' + ent.storageName + ' успешно завершено.'
              })
            } catch (err) {
              messenger.addMessage({
                funcType: `${ent.entitity}.edit`,
                result: 'error',
                text: err,
                id: item.id,
                item
              })
              // Откат
              console.log('Производится откат')
              for (const elem of bakup) {
                const bakItem = JSON.parse(elem)
                ent.editItem(instance, bakItem)
              }
              console.log('Откат успешен')
              return {
                result: 'error',
                text: err,
                id
              }
            }
          } else {
            if (!item || !id) { return }
            if (!item.id || item.id !== id) { return }
            const existedItem = ctx.indexed[id]
            if (!existedItem) {
              messenger.addMessage({
                funcType: `${ent.entitity}.edit`,
                result: 'warning',
                text: 'Элемент отсутствует в локальной базе',
                id: item.id,
                item
              })
            } else {
              // Создание копии элемента на случай отката
              let prevItem
              if (existedItem.toJSON) {
                prevItem = existedItem.toJSON()
              } else {
                prevItem = { ...existedItem }
              }
              // Формирование элемента для редактирования
              if (!ent.form && !options.sync) {
                for (const key in item) {
                  existedItem[key] = item[key]
                }
              } else {
                await ent._editItem(instance, item)
              }
              console.log(`Буффер с ${ent.entitity} успешно обновлён`)
              // Запись в локальную БД
              try {
                await storage[ent.entitity].add(existedItem.toJSON ? existedItem.toJSON() : existedItem)
                if (!options.multiple) {
                  messenger.addMessage({
                    funcType: `${ent.entitity}.edit`,
                    result: 'success',
                    text: 'Элемент успешно отредактирован',
                    id: existedItem.id,
                    item: existedItem
                  })
                  console.log('Элемент успешно отредактирован')
                }
              } catch (err) {
                messenger.addMessage({
                  funcType: `${ent.entitity}.edit`,
                  result: 'error',
                  text: err,
                  id: item.id,
                  item
                })
                // Откат
                console.log('Производится откат')
                const bakItem = JSON.parse(prevItem)
                ent.editItem(instance, bakItem)
                console.log('Откат успешен')
                return {
                  result: 'error',
                  text: err,
                  id
                }
              }
            }
          }
        },

        async clear () {
          const tmpItems = this.items
          const tmpIndexed = this.indexed
          this.items = createItemsArray(ent.entitity)
          this.indexed = createItemsArray(ent.entitity)
          try {
            await storage[ent.entitity].purge()
            messenger.addMessage({
              funcType: `${ent.entitity}.clear`,
              result: 'success',
              text: `Хранилище ${ent.storageName} успешно очищено`
            })
          } catch (err) {
            messenger.addMessage({
              funcType: `${ent.entitity}.clear`,
              result: 'error',
              text: err
            })
            this.items = tmpItems
            this.indexed = tmpIndexed
            return undefined
          }
        },

        async insert (elems, ctx = this, options = {}) {
          if (!elems) { return undefined }
          if (Object.prototype.toString.call(elems) === '[object Array]') {
            if (!elems.length) { return undefined }
            const errors = []
            const results = []
            elems.forEach((elem) => {
              results.push(ctx.add(elem, ctx, { ...options, multiple: true }))
            })
            for await (const err of results) {
              if (err) {
                errors.push(`id: ${err.id} - ${err.text}`)
              }
            }
            return errors || undefined
          } else {
            try {
              await ctx.add(elems, ctx, options)
            } catch (err) {
              if (err) {
                messenger.addMessage({
                  funcType: `${ent.entitity}.insert`,
                  result: 'error',
                  text: err
                })
              }
              return err
            }
          }
        },

        delete (ids) {
          if (!ids) { return undefined }
          if (!ids.length) { return undefined }
          const errors = []
          metasync.each(ids, (id, callback) => setTimeout(async () => {
            // const deletedItem = this.items.find(el => el.id === id)
            const deletedItem = this.indexed[id]
            const index = this.items.indexOf(deletedItem)
            const copy = deletedItem.clone()
            this.items.splice(index, 1)
            this.indexed[id] = undefined
            try {
              await storage[ent.entitity].delete(id)
              callback(null)
            } catch (err) {
              consola.error('Ошибка:', err)
              this.items.push(copy)
              this.indexed[id] = copy
              callback(err, id)
            }
          }, 0), (err, id) => {
            if (err) {
              consola.error(err)
              messenger.addMessage({
                funcType: `${ent.entitity}.delete`,
                result: 'error',
                text: err,
                id
              })
              errors.push(`id: ${id} - ${err}`)
            } else {
              this.updateAll()
              // ids.forEach((id) => {
              //   this.update(id)
              // })
            }
          })
          return errors || undefined
        },
        async fetchById (id) {
          const existedItem = this.items.find(el => el.id === id)
          const prevItem = existedItem ? existedItem.clone() : null
          try {
            const item = await storage[ent.entitity].fetchById(id)
            if (item) {
              let newElement
              if (ent.form) {
                newElement = ent.form(item)
              } else {
                newElement = item
              }
              if (existedItem) {
                this.items = this.items.filter(el => el.id !== id)
              }
              this.items.push(newElement)
              this.indexed[id] = newElement
            } else {
              messenger.addMessage({
                funcType: `${ent.entitity}.fetchById`,
                result: 'error',
                text: 'Неудачный запрос сервера'
              })
            }
          } catch (err) {
            messenger.addMessage({
              funcType: `${ent.entitity}.fetchById`,
              result: 'error',
              text: err
            })
            if (prevItem) {
              this.items = this.items.filter(el => el.id !== id)
              this.items.push(prevItem)
              this.indexed[id] = prevItem
            }
          }
        },
        // Чтение и обновление буфера из локальной БД
        async updateAll (options = {}) {
          if (this.synchronization) {
            return
          }
          try {
            // context.store.dispatch('navInterface/setLoadingData', {
            //   loadingProgress: 0,
            //   loadingMessage: `Обновление ${ent.name}`,
            //   loadingStatus: 'pending'
            // })
            // const mess = options.init ? `Loading ${ent.entitity} OK` : `updateAll ${ent.entitity} OK`
            // console.time(mess)
            const arr = createItemsArray(ent.entitity, await storage[ent.entitity].getAll())
            let newArr
            let formedArr
            if (!options.init) {
              formedArr = await formElements(ent, arr)
              // // формирование массива, если предусмотрено
              if (ent.formArray) { newArr = ent.formArray(formedArr) } else { newArr = formedArr }
            } else { newArr = arr }
            const indexed = createItemsArray(ent.entitity)
            newArr.forEach((el) => { indexed[el.id] = el })
            if (ent.sort) {
              this.items = newArr.sort(multisort(ent.sort()))
            } else {
              this.items = newArr.sort((a, b) => a.id - b.id)
            }
            this.indexed = indexed
            messenger.addMessage({
              funcType: `${ent.entitity}.updateAll`,
              result: 'success',
              text: 'Обновление успешно'
            })
            // console.timeEnd(mess)
            // context.store.dispatch('navInterface/setLoadingData', {
            //   loadingProgress: 100,
            //   loadingMessage: `Обновление ${ent.name} успешно`,
            //   loadingStatus: 'pending'
            // })
          } catch (err) {
            console.log(err)
            messenger.addMessage({
              funcType: `${ent.entitity}.updateAll`,
              result: 'error',
              text: err
            })
          }
        },
        async update (id) {
          if (!id) { return }
          try {
            // console.log('update', ent.entitity, 'id:', id)
            const element = await storage[ent.entitity].getById(id)
            const index = this.items.indexOf(this.items.find(el => el.id === id))
            const formedElement = await formElements(ent, [element])
            this.items[index] = formedElement[0]
            this.indexed[id] = formedElement[0]
            messenger.addMessage({
              funcType: `${ent.entitity}.update id: ${id}`,
              result: 'success',
              text: 'Обновление успешно'
            })
          } catch (err) {
            console.log(err)
            messenger.addMessage({
              funcType: `${ent.entitity}.update id: ${id}`,
              result: 'error',
              text: err
            })
          }
        }
      }
      const entitity = buffer[ent.entitity]
      await buffer[ent.entitity].updateAll({ init: true })
      if (!entitity.items.length) {
        needToSync.push(ent.entitity)
      }
    }
    firstInit.init = true

    localDB.on('syncStart', (ent) => {
      buffer[ent].synchronization = true
    })
    localDB.on('syncEnd', (ent) => {
      buffer[ent].updateAll()
      buffer[ent].synchronization = false
    })
    return {
      // публичная часть
      updateAll,
      loadBeforeUse,
      updateEntitys,
      buffer,
      firstInit
    }
  }
  return {
    getInstance: (context) => {
      if (process.browser) {
        if (!instance) {
          // context.$storage = storage
          const mockDocs = {
            updateAll: null,
            loadBeforeUse: null,
            updateEntitys: null,
            buffer: [],
            firstInit: null
          }
          context.$docs = mockDocs
          // 1 Инициализация буффера
          context.store.dispatch('navInterface/setLoadingData', {
            loadingProgress: 0,
            loadingMessage: 'Инициализация буффера',
            loadingStatus: 'pending'
          })
          instance = init(context)
          instance.then((inst) => {
            context.$docs = inst
            // consola.success('DOCS init OK')
            // console.log('context', context)
            inst.loadBeforeUse()
          })
        }
        return instance
      }
    }
  }
})()

export default Docs
