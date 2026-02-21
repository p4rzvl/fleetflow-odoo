import axios from 'axios'

// Monolith backend (vehicles, drivers, trips, maintenance, finance, dashboard)
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// Auth backend (login, register, password reset)
const authApi = axios.create({
  baseURL: '/auth',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to monolith requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 interceptor: expired/invalid token → clear auth state and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_email')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const response = await authApi.post('/login', { email, password })
    return response.data
  },
  register: async (email, password, role) => {
    const response = await authApi.post('/register', { email, password, role })
    return response.data
  },
  forgotPassword: async (email) => {
    const response = await authApi.post('/forgot-password', { email })
    return response.data
  },
  resetPassword: async (email, otp, new_password) => {
    const response = await authApi.post('/reset-password', { email, otp, new_password })
    return response.data
  }
}

// ─── Vehicle Registry ─────────────────────────────────────────────────────────
export const vehicleApi = {
  getAll: async () => {
    const response = await api.get('/registry/vehicles/')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/registry/vehicles/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/registry/vehicles/', data)
    return response.data
  },
  toggleOutOfService: async (id) => {
    const response = await api.patch(`/registry/vehicles/${id}/out-of-service`)
    return response.data
  }
}

// ─── Driver Management ────────────────────────────────────────────────────────
export const driverApi = {
  getAll: async () => {
    const response = await api.get('/drivers/')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/drivers/', data)
    return response.data
  },
  updateStatus: async (id, new_status) => {
    const response = await api.patch(`/drivers/${id}/status`, null, {
      params: { new_status }
    })
    return response.data
  },
  syncExpiredLicenses: async () => {
    const response = await api.post('/drivers/sync-expired-licenses')
    return response.data
  }
}

// ─── Dispatch / Trip Management ───────────────────────────────────────────────
export const dispatchApi = {
  getAllTrips: async () => {
    const response = await api.get('/dispatch/trips/')
    return response.data
  },
  createTrip: async (data) => {
    const response = await api.post('/dispatch/trips/', data)
    return response.data
  },
  dispatchTrip: async (id) => {
    const response = await api.post(`/dispatch/trips/${id}/dispatch`)
    return response.data
  },
  completeTrip: async (id, final_odometer) => {
    const response = await api.post(`/dispatch/trips/${id}/complete`, { final_odometer })
    return response.data
  }
}

// ─── Maintenance ──────────────────────────────────────────────────────────────
export const maintenanceApi = {
  getAll: async () => {
    const response = await api.get('/maintenance/')
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/maintenance/', data)
    return response.data
  },
  completeService: async (logId) => {
    const response = await api.patch(`/maintenance/${logId}/complete`)
    return response.data
  }
}

// ─── Finance ─────────────────────────────────────────────────────────────────
export const financeApi = {
  getExpenses: async () => {
    const response = await api.get('/finance/expenses/')
    return response.data
  },
  createExpense: async (data) => {
    const response = await api.post('/finance/expenses/', data)
    return response.data
  },
  getFuelLogs: async () => {
    const response = await api.get('/finance/fuel/')
    return response.data
  },
  createFuelLog: async (data) => {
    const response = await api.post('/finance/fuel/', data)
    return response.data
  }
}

// ─── Dashboard / Analytics ───────────────────────────────────────────────────
export const analyticsApi = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  getRoi: async () => {
    const response = await api.get('/analytics/roi')
    return response.data
  },
  getFuelEfficiency: async () => {
    const response = await api.get('/analytics/fuel-efficiency')
    return response.data
  },
  exportReport: async () => {
    // Returns raw blob for CSV download
    const response = await api.get('/analytics/export', { responseType: 'blob' })
    return response
  }
}

// Trip API
export const tripApi = {
  getAll: async () => {
    const response = await api.get('/trips')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/trips', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/trips/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/trips/${id}/status`, { status })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/trips/${id}`)
    return response.data
  }
}

// Maintenance API
export const maintenanceApi = {
  getAll: async () => {
    const response = await api.get('/maintenance')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/maintenance', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data)
    return response.data
  },

  complete: async (id, cost) => {
    const response = await api.patch(`/maintenance/${id}/complete`, { cost })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/maintenance/${id}`)
    return response.data
  }
}

// Driver API
export const driverApi = {
  getAll: async () => {
    const response = await api.get('/drivers')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/drivers', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/drivers/${id}/status`, { status })
    return response.data
  }
}

export default api
