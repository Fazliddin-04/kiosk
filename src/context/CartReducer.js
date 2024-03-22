const cartReducer = (state, action, uuidv4 = () => { }) => {
  let lastProduct = null
  if (action.type === "INCREMENT_LAST" || action.type === "DECREMENT_LAST" || action.type === "REMOVE_LAST") {
    lastProduct = state.cart.findLast((item) => item.product_id === action.payload)
  }

  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: [...state.cart,
        {
          ...action.payload,
          quantity: action.payload.quantity ? action.payload.quantity : 1,
          key: uuidv4(),
        }],
      }
    case 'INCREMENT':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.key === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }
    case 'INCREMENT_LAST':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.key === lastProduct?.key ? { ...item, quantity: item.quantity++ } : item
        ),
      }
    case 'DECREMENT':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.key === action.payload ? { ...item, quantity: item.quantity === 1 ? 1 : item.quantity - 1 } : item
        ),
      }
    case 'DECREMENT_LAST':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.key === lastProduct?.key ? { ...item, quantity: item.quantity === 1 ? 1 : item.quantity-- } : item
        ),
      }
    case 'REMOVE':
      return {
        ...state,
        cart: state.cart.filter((item) => item.key !== action.payload),
      }
    case 'REMOVE_LAST':
      let index = state.cart.indexOf(lastProduct)
      return {
        ...state,
        cart: state.cart.filter((_, idx) => idx !== index),
      }
    case 'CLEAR':
      return {
        ...state,
        cart: [],
      }
    default:
      return state
  }
}

export default cartReducer