// import Docs from '@/Storage/docs'
// let storage
// const docs = Promise.resolve(Docs.getInstance())
// const storage = docs.buffer

export const mapper = (arr) => {
  const output = {}
  console.log(window)
  // const storage = window.$nuxt.$docs.buffer
  const storage = window.$nuxt.$docs?.buffer
  console.log('storage: ')
  console.log(storage)
  for (const key of arr) {
    const mapped = () => {
      if (!storage) { return [] }
      if (storage[key]?.synchronization) { return [] }
      return storage[key]?.items || []
      // return []
    }
    // output.push({ [key]: fun() })
    output[key] = mapped
  }
  console.log(output)
  return output
}
