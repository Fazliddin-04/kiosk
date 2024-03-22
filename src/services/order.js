import { request } from './http-client'

export const createOrder = (data, headers) =>
  request.post('/v2/ondemand-order', data, { headers }).then((res) => res.data)
