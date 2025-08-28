import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add refresh token if available
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      config.headers['X-Refresh-Token'] = refreshToken
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Check if new access token is provided in response header
    const newToken = response.headers['x-new-access-token']
    if (newToken) {
      localStorage.setItem('accessToken', newToken)
      console.log('New access token received and stored')
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            // Try to refresh the token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })
            
            const { accessToken } = response.data
            localStorage.setItem('accessToken', accessToken)
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } else {
            // No refresh token available, redirect to login
            handleAuthFailure()
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          handleAuthFailure()
        }
      } else if (errorCode === 'NO_TOKEN') {
        // No token provided, redirect to login
        handleAuthFailure()
      }
    }

    return Promise.reject(error)
  }
)

// Function to handle authentication failure
const handleAuthFailure = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  generateToken: (credentials) => api.post('/auth/generate-token', credentials),
}

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateQuantity: (id, data) => api.patch(`/products/${id}/quantity`, data),
  getTransactions: (id, params) => api.get(`/products/${id}/transactions`, { params }),
  getLowStock: (threshold) => api.get('/products/low-stock', { params: { threshold } }),
  getOutOfStock: () => api.get('/products/out-of-stock'),
  getInventorySummary: () => api.get('/products/inventory/summary'),
}

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getAllWithCount: () => api.get('/categories/all'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// Reports API
export const reportsAPI = {
  getStockLevels: () => api.get('/reports/stock-levels'),
  getInventoryValue: () => api.get('/reports/inventory-value'),
  getProductQuantityHistory: (id) => api.get(`/reports/products/${id}/quantity-history`),
}

export default api
