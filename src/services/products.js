import { request } from './http-client';

export const getProductFavourites = (data) =>
  request
    .get('/v2/product-favourites', { params: { product_ids: data } })
    .then((res) => res.data);

export const getCategoriesWithProducts = () =>
  request
    .get('/v2/category-with-products', { params: { page: 1, limit: 20 } })
    .then((res) => res.data);

export const getProductModifier = (id) =>
  request
    .get('/v2/modifier', { params: { product_id: id } })
    .then((res) => res.data);

export const getProductById = (id) =>
  request.get('/v2/product/' + id).then((res) => res.data);

export const getComboById = (id) =>
  request.get('/v2/combo/' + id).then((res) => res.data);

export const getCategoryWithChildren = (id, params) =>
  request
    .get('/v2/category-with-children/' + id, { params })
    .then((res) => res.data);
