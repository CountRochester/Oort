export default function ({ store, req, redirect }) {
  if (!store.getters['auth/isAuthenticated']) {
    redirect('/auth/login?message=login')
  }
}
