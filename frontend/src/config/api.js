const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment
  ? import.meta.env.VITE_API_URL_DEV
  : import.meta.env.VITE_API_URL_PROD;

export const API_ENDPOINTS = {
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  AUTH_VALIDATE: `${API_BASE_URL}/api/auth/signin/validate`,
  CLASS_ASSIGNMENTS: `${API_BASE_URL}/api/class/assignments`,
  CLASS_ADD_PROBLEM: `${API_BASE_URL}/api/class/problems/add`,
  CLASS_REMOVE_PROBLEM: `${API_BASE_URL}/api/class/problems/remove`,
  USER_PROGRESS_TRIGGER: `${API_BASE_URL}/api/user/progress/trigger`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  QUESTIONS_UPLOAD: `${API_BASE_URL}/api/questions/upload`,
  USER_PROGRESS: `${API_BASE_URL}/api/user`,
};
//console.log("API_BASE_URL:", API_BASE_URL);

export default API_BASE_URL;
