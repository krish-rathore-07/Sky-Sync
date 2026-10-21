import api from './api'

export const uploadFile = async (file) => {
  const formData = new FormData()

  formData.append('file', file)

  const response = await api.post(
    '/api/files/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

export const getMyFiles = async () => {
  const response = await api.get('/api/files/my-files')

  return response.data
}

export const getFile = async (fileId) => {
  const response = await api.get(
    `/api/files/${fileId}`
  )

  return response.data
}

export const deleteFile = async (fileId) => {
  const response = await api.delete(
    `/api/files/${fileId}`
  )

  return response.data
}