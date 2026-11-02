import api from './api'

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData)

  return response.data
}

export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials)

  return response.data
}

export const getCurrentProfile = async () => {
  const response = await api.get('/api/profile/me')
  return response.data
}

export const updateCurrentProfile = async (profileData) => {
  const response = await api.put('/api/profile/me', profileData)
  return response.data
}

export const changePassword = async (passwordData) => {
  const response = await api.put(
    '/api/auth/change-password',
    passwordData
  )

  return response.data
}

export const googleLoginUser = async (credential) => {
  const response = await api.post('/api/auth/google', {
    credential,
  })

  return response.data
}

export const deleteAccount = async () => {
  const response = await api.delete('/api/auth/delete-account')
  return response.data
}