import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  branch_id: '',
  shipper_id: '',
  menu_id: undefined,
  lang: 'ru',
  show_category_image: false,
  is_animate: false,
  crm_table_id: '',
  crm_table_number: '',
}

export const querySlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetData: (state) => {
      state.branch_id = ''
    },
    setIdDetails: (state, { payload }) => {
      state.branch_id = payload?.branch_id
      state.shipper_id = payload?.shipper_id
      state.menu_id = payload?.menu_id
      state.lang = payload?.lang
      state.show_category_image = payload?.show_category_image
      state.is_animate = payload?.is_animate
      state.crm_table_id = payload.crm_table_id
      state.crm_table_number = payload.crm_table_number
    },
  },
})

export const { resetData, setIdDetails } = querySlice.actions
export default querySlice.reducer
