const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? import.meta.env.VITE_API_URL_DEV 
  : import.meta.env.VITE_API_URL_PROD

export const API_ENDPOINTS = {
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  QUESTIONS_UPLOAD: `${API_BASE_URL}/api/questions/upload`,
  AUTH_SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  USER_PROGRESS: `${API_BASE_URL}/api/user`
}

export default API_BASE_URL
