import axios from 'axios'
import getUser from '../utils/getUser'

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    Shipper: process.env.NEXT_PUBLIC_SHIPPER_ID,
  },
})

// ? TEST
// Shipper: 'd4b1658f-3271-4973-8591-98a82939a664',

request.interceptors.request.use(
  (config) => {
    const user = getUser()
    if (user) {
      config.headers.Authorization = user.access_token
    }
    return config
  },

  (error) => errorHandler(error)
)

const errorHandler = (error) => {
  return Promise.reject(error.response)
}
