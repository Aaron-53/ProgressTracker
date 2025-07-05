export const tokenStorage = {
    
  // Get token from localStorage
  getToken: () => localStorage.getItem('token'),
  
  // Get user data from localStorage
  getUser: () => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  },
  
  // Set auth data (token + user)
  setAuthData: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },
  
  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'))
  }
}
