import { createContext, useReducer } from 'react'
import cartReducer from './CartReducer'
import { v4 as uuidv4 } from 'uuid'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const initialState = {
    cart: [],
  }

  const [state, dispatch] = useReducer((state, action) => cartReducer(state, action, uuidv4), initialState)

  return (
    <CartContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext