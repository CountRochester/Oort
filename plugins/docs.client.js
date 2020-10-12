// import Vue from 'vue'
import Docs from '@/Storage/docs'
import consola from 'consola'

// Vue.use(Docs)
// Vue.prototype.$Docs = Docs
// export default Docs

export default async (context, inject) => {
  // const hello = msg => console.log(`Hello ${msg}!`)
  // Inject $hello(msg) in Vue, context and store.
  consola.info('Инициализация плагина документооборота:')
  try {
    const docs = await Docs.getInstance(context)
    inject('docs', docs)
    consola.success('Инициализация плагина документооборота завершена!')
  } catch (err) {
    consola.error('Ошибка инициализации плагина документооборота:', err)
  }
}
