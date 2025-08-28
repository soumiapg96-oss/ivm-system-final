import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        // For now, we'll use the stored user data instead of calling /auth/me
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  // Workaround function to generate a valid token
  const generateValidToken = async (credentials) => {
    try {
      // Call the backend to generate a valid token
      const response = await fetch('http://localhost:3001/api/auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.token;
      } else {
        throw new Error('Failed to generate token');
      }
    } catch (error) {
      console.error('Failed to generate valid token:', error);
      throw error;
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      
      // First, try to get user info from login
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data
      
      // Check if the token is truncated (less than 200 characters)
      if (accessToken && accessToken.length < 200) {
        console.warn('Token appears to be truncated, using workaround');
        // Use the workaround to get a valid token
        const validToken = await generateValidToken(credentials);
        localStorage.setItem('accessToken', validToken);
      } else {
        localStorage.setItem('accessToken', accessToken)
      }
      
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.register(userData)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      handleLogout()
    }
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refresh(refreshTokenValue)
      const { accessToken } = response.data
      
      localStorage.setItem('accessToken', accessToken)
      return accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      handleLogout()
      throw error
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
