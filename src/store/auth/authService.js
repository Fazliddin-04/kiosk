import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BASE_URL + '/v1/customers'
const params = typeof window !== 'undefined' ? new Proxy(new URLSearchParams(window?.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
}) : {};

const config = {
  headers: {
    Shipper: params?.shipper_id,
    Platform: 'website'
  }
}

// Get user by phone
const getUserByPhone = async (userData) => {
  const response = await axios.post(API_URL + '/phone', userData, config)

  return response.data
}

// Confirmation code
const codeConfirm = async (userData) => {
  try {
    return await loginConfirm(userData)
  } catch (err) {
    try {
      return await registerConfirm(userData)
    } catch (error) {
      console.log(error)
    }
  }
}

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + '/register', { ...userData, name: "user", "registration_source": "website" }, config)

  return response.data
}

// Register confirm
const registerConfirm = async (data) => {
  const response = await axios.post(API_URL + '/register-confirm', data, config)

  return response.data
}

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + '/login', userData, config)

  return response.data
}

// Login confirm
const loginConfirm = async (data) => {
  const response = await axios.post(API_URL + '/confirm-login', data, config)

  return response.data
}

// Update user details
const updateUserDetails = async (userData) => {
  const config2 = {
    headers:
      { Authorization: userData?.access_token }
  }
  const req = {
    name: userData?.name, phone: userData?.phone, date_of_birth: userData?.date_of_birth == 'invalid date' || !userData?.date_of_birth ? null : userData?.date_of_birth
  }
  const response = await axios.put(API_URL + `/${userData.id}`, req, config2)

  return response.data
}

const authService = {
  register, login, getUserByPhone, codeConfirm, updateUserDetails, loginConfirm,
  registerConfirm
}

export default authService