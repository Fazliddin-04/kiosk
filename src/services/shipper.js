import { request } from './http-client'

export const getShipper = (id) =>
  request.get('/v1/shippers/' + id).then((res) => res.data)

export const getSourceSettings = (id) =>
  request.get('/v2/source-settings/' + id).then((res) => res.data)
