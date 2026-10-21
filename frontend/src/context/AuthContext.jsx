import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  loginUser,
  googleLoginUser,
} from '../services/authservice.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('skysync-token')
    const storedUser = localStorage.getItem('skysync-user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('skysync-token')
        localStorage.removeItem('skysync-user')
      }
    }

    setLoading(false)
  }, [])

  // Shared function for saving authentication data
  const saveAuthData = (data) => {
    localStorage.setItem('skysync-token', data.token)

    const userData = {
      name: data.name,
      email: data.email,
    }

    localStorage.setItem(
      'skysync-user',
      JSON.stringify(userData)
    )

    setToken(data.token)
    setUser(userData)

    return data
  }

  // Existing email/password login
  const login = async (credentials) => {
    const data = await loginUser(credentials)
    return saveAuthData(data)
  }

  // New Google login
  const googleLogin = async (credential) => {
    const data = await googleLoginUser(credential)
    return saveAuthData(data)
  }

  const logout = () => {
    localStorage.removeItem('skysync-token')
    localStorage.removeItem('skysync-user')

    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser

      const nextUser = {
        ...currentUser,
        ...updatedData,
      }

      localStorage.setItem(
        'skysync-user',
        JSON.stringify(nextUser)
      )

      return nextUser
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}