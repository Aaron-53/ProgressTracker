import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_ENDPOINTS } from '../config/api'
import { tokenStorage } from '../utils/storage'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = tokenStorage.getToken()
    const userData = tokenStorage.getUser()

    if (token && userData) {
      try {
        // Validate token with backend
        const response = await fetch(`${API_ENDPOINTS.AUTH_SIGNIN}/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          setUser(userData)
          
          // If on login/signup page, redirect to questions
          console.log('Current path:', location.pathname)
          if (location.pathname === '/login' || location.pathname === '/signup') {
            
            navigate('/questions')
          }
        } else {
          // Token invalid, clear storage
          logout()
        }
      } catch (error) {
        console.error('Token validation failed:', error)
        logout()
      }
    } else {
      // No token, redirect to login if on protected route
      const publicRoutes = ['/login', '/signup']
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/login')
      }
    }
    
    setLoading(false)
  }

  const login = async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_SIGNIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        tokenStorage.setAuthData(data.token, data.user)
        setUser(data.user)
        navigate('/questions')
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    tokenStorage.clearAuthData()
    setUser(null)
    navigate('/login')
  }

  const signup = async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        tokenStorage.setAuthData(data.token, data.user)
        setUser(data.user)
        navigate('/questions')
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const value = {
    user,
    login,
    logout,
    signup,
    loading
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
