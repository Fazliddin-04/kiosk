import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  cart: [],
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    ADD_TO_CART:
      (state, action) => ({
        ...state,
        cart: [...state.cart,
        {
          ...action.payload,
          quantity: action.payload.quantity ? action.payload.quantity : 1,
          key: uuidv4(),
        }],
      }),
    INCREMENT:
      (state, action) => ({
        ...state,
        cart: state.cart.map((item) =>
          item.key === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }),
    INCREMENT_LAST:
      (state, action) => {
        let lastProduct = state.cart.findLast((item) => item.product_id === action.payload)

        return {
          ...state,
          cart: state.cart.map((item) =>
            item.key === lastProduct?.key ? { ...item, quantity: item.quantity++ } : item
          ),
        }
      },
    DECREMENT:
      (state, action) => ({
        ...state,
        cart: state.cart.map((item) =>
          item.key === action.payload ? { ...item, quantity: item.quantity === 1 ? 1 : item.quantity - 1 } : item
        ),
      }),
    DECREMENT_LAST:
      (state, action) => {
        let lastProduct = state.cart.findLast((item) => item.product_id === action.payload)

        return {
          ...state,
          cart: state.cart.map((item) =>
            item.key === lastProduct?.key ? { ...item, quantity: item.quantity === 1 ? 1 : item.quantity-- } : item
          ),
        }
      },
    REMOVE:
      (state, action) => ({
        ...state,
        cart: state.cart.filter((item) => item.key !== action.payload),
      }),
    REMOVE_LAST: () => {
      let lastProduct = state.cart.findLast((item) => item.product_id === action.payload)
      let index = state.cart.indexOf(lastProduct)
      return {
        ...state,
        cart: state.cart.filter((_, idx) => idx !== index),
      }
    },
    CLEAR:
      (state, action) => ({
        ...state,
        cart: [],
      })
  },
})

export const { ADD_TO_CART,
  INCREMENT,
  INCREMENT_LAST,
  DECREMENT,
  DECREMENT_LAST,
  REMOVE,
  REMOVE_LAST,
  CLEAR } = cartSlice.actions
export default cartSlice.reducer
