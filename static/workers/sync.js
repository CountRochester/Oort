const HOSTNAME = '192.168.40.63'
const PORT = '80'

async function gQLRequest (query) {
  try {
    return Object.values(await gQLRawRequest(query))[0]
  } catch (err) {
    throw err
  }
}

async function gQLRawRequest (query, variables) {
  try {
    const url = `http://${location.hostname}:${location.port || 3000}/graphql`
    // const url = `http://${HOSTNAME}:${PORT}/graphql`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })
    const res = await response.json()
    if (res === '{"access":"denied"}') {
      console.error('Доступ запрещён')
      return
    } else {
      return res.data
    }
  } catch (err) {
    throw err
  }
}

function formDefaultFetchTimeArray () {
  const output = { id: '0' }
  entitys.forEach((el) => { output[el.entity] = null })
  return output
}

async function getFetchTimeFromServer () {
  try {
    const query = `
    query {
      getFetchTime {
        contracts
        temas
        organisations
        states
        types
        positions
        departments
        subdivisions
        currentPositions
        extCurrentPositions
        employees
        extEmployees
        extIncomings
        extOutgoings
        intIncomings
        intOutgoings
        internals
        incNumbers
        intIncNumbers
        internalIncNumbers
        extIncFiles
        extOutFiles
        intIncFiles
        intOutFiles
        internalFiles
        extIncStates
        intIncStates
        internalIncStates
        resolutions
      }
    }
  `
    const output = await gQLRequest(query)
    output.id = '0'
    return output
  } catch (err) {
    console.error('Ошибка доступа к базе данных:', err)
  }
}

async function getFetchTimeLocal () {
  try {
    return await store.fetchTime.getAll()
  } catch (err) {
    console.error('Ошибка доступа к локальной БД:', err)
  }
}

async function setFetchTime (fetchTimeArray) {
  try {
    return await store.fetchTime.add(fetchTimeArray)
  } catch (err) {
    console.error('Ошибка доступа к локальной БД:', err)
  }
}

async function resetFetchTime () {
  try {
    return await store.fetchTime.delete('0')
  } catch (err) {
    console.error('Ошибка доступа к локальной БД:', err)
  }
}

async function getAllElements (entity) {
  const query = requests[entity.entity].all()

  if (!query) { return }
  return await gQLRequest(query) || []
}

async function getElementsById (entity, id) {
  const query = requests[entity.entity].byId(id)

  if (!query) { return }
  return await gQLRequest(query) || []
}

async function initSync ({ force = false } = {}) {
  try {
    if (force) {
      await resetFetchTime()
    }
    const serverFetchTime = await getFetchTimeFromServer()
    // console.info('serverFetchTime', serverFetchTime)
    const localFetchTime = (await getFetchTimeLocal())[0] || formDefaultFetchTimeArray()
    // console.info('localFetchTime', localFetchTime)
    for (const ent in localFetchTime) {
      if (+serverFetchTime[ent] > +localFetchTime[ent]) {
        needToSync.push(ent)
      }
    }
    if (needToSync.length) {
      console.info('Необходима синхронизация:', needToSync)
    }
    await setFetchTime(serverFetchTime)
  } catch (err) {
    console.error('Ошибка инициализации синхронизации:', err)
  }
}

async function sync () {
  console.info('Начало синхронизации хранилища')
  self.postMessage('sync')
  console.time('Синхронизация')
  if (needToSync.length) {
    const filteredNeedToSync = needToSync.filter(el => el !== 'config')
    if (needToSync.includes('config')) {
      await store.config.add({
        id: 'main',
        theme: 'dark'
      })
    }
    try {
      const syncs = filteredNeedToSync.map(ent => new Promise((resolve, reject) => {
        self.postMessage({ event: 'syncStart', payload: ent })
        getAllElements({ entity: ent })
          .then((arr) => {
            store[ent].add(arr)
              .then(() => {
                self.postMessage({ event: 'syncEnd', payload: ent })
                resolve(`${ent}: синхронизация ОК`)
              })
              .catch((err) => {
                console.error(`Ошибка записи в хранилище ${ent}`)
                reject(err)
              })
          })
          .catch((err) => {
            console.error(`Ошибка при обращении к серверу в хранилище ${ent}: ${err}`)
            reject(err)
          })
      }))
      await Promise.allSettled(syncs)
      needToSync.length = 0
      console.timeEnd('Синхронизация')
      self.postMessage('syncEnd')
      console.info('Синхронизация завершена. Статус: OK')
    } catch (err) {
      console.timeEnd('Синхронизация')
      self.postMessage('syncEnd')
      console.error('Синхронизация прервана. Ошибка:')
      console.error(err)
    }
  } else {
    console.timeEnd('Синхронизация')
    self.postMessage('syncEnd')
    console.info('Синхронизация не требуется.')
  }
}
