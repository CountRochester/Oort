import entititys from './entititys'

const createHandler = (ClassName) => {
  const handler = {
    get (target, name) {
      if (name in target) {
        return target[name]
      } else {
        return new ClassName()
      }
    }
  }
  return handler
}

const itemsArray = []
entititys.forEach((el) => {
  itemsArray[el.entitity] = new Proxy([], createHandler(el.NullClass))
})

const handlerArray = []
entititys.forEach((el) => {
  handlerArray[el.entitity] = createHandler(el.NullClass)
})

export const createItemsArray = (entity, arr = []) => {
  const entitity = entititys.find(el => el.entitity === entity)
  if (entitity) {
    return new Proxy(arr, createHandler(entitity.NullClass))
  }
  // return arr
}

// console.log(handlerArray)
// const res1 = new Proxy([], handlerArray.resolutions)
// console.log(res1[30])

export default itemsArray
