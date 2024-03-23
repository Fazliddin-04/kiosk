import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import authReducer from './auth/authSlice'
import orderReducer from './order/orderSlice'
import cartReducer from './cart/cartSlice'
import commonReducer from './common/common.slice'

const authConfig = {
  key: 'auth',
  version: 1,
  storage: sessionStorage,
}

const cartConfig = {
  key: 'cart',
  version: 1,
  storage: sessionStorage,
}

const commonConfig = {
  key: 'common',
  version: 1,
  storage: sessionStorage,
}

const orderConfig = {
  key: 'order',
  version: 1,
  storage: sessionStorage,
}

const rootReducer = combineReducers({
  auth: persistReducer(authConfig, authReducer),
  cart: persistReducer(cartConfig, cartReducer),
  order: persistReducer(orderConfig, orderReducer),
  common: persistReducer(commonConfig, commonReducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export let persistor = persistStore(store)
