import api from './api'

/**
 * Create a share link for a file
 */
export const createShareLink = async (fileId) => {
  const response = await api.post(
    `/api/shares/${fileId}`
  )

  return response.data
}

/**
 * Get a shared file using its public token
 */
export const getSharedFile = async (token) => {
  const response = await api.get(
    `/api/shares/${token}`
  )

  return response.data
}

/**
 * Revoke a share link
 */
export const revokeShareLink = async (token) => {
  const response = await api.delete(
    `/api/shares/${token}`
  )

  return response.data
}

export const getMyShares = async () => {
  const response = await api.get('/api/shares/my-shares')
  return response.data
}