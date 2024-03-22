import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  last_order_id: '',
  order_type: 'hall',
}

export const orderSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetId: (state) => { state.last_order_id = '' },
    updateId: (state, action) => { state.last_order_id = action.payload },
    updateOrderType: (state, action) => { state.order_type = action.payload }
  },
})

export const { resetId, updateId, updateOrderType } = orderSlice.actions
export default orderSlice.reducer
