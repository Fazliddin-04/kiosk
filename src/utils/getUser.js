import { store } from '../store'

export default function getUser() {
  return store.getState().auth.user
}
