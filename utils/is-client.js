export function app () {
  if (process.browser) {
    if (window) {
      return window.$nuxt
    }
  }
}

export function store () {
  const _app = app()
  if (_app) {
    return _app.$store
  }
}
