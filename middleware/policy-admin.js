import { checkUserPermission } from '../utils/permission'

export default function ({ store, req, redirect }) {
  if (!store.getters['auth/isAuthenticated']) {
    redirect('/auth/login?message=login')
  }
  const userPermis = store.getters['auth/getUserPermission']
  if (!checkUserPermission(userPermis, 255)) {
    redirect('/')
  }
}
