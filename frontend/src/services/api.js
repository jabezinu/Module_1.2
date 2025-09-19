import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/admin/auth/login', credentials),
  register: (userData) => api.post('/api/admin/auth/register', userData),
  verifyToken: () => api.get('/api/admin/auth/verify'),
  logout: () => api.post('/api/admin/auth/logout'),
  getProfile: () => api.get('/api/admin/profile'),
  updateProfile: (data) => api.put('/api/admin/profile', data),
  changePassword: (data) => api.put('/api/admin/profile/password', data),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/api/admin/dashboard/overview'),
  getWarehouseAnalytics: (params) => api.get('/api/admin/dashboard/warehouses', { params }),
  getInventoryAnalytics: (params) => api.get('/api/admin/dashboard/inventory', { params }),
  getShipmentAnalytics: (params) => api.get('/api/admin/dashboard/shipments', { params }),
  getSystemHealth: () => api.get('/api/admin/dashboard/health'),
};

// Admin Management API
export const adminAPI = {
  getAdmins: (params) => api.get('/api/admin/users', { params }),
  getAdminById: (id) => api.get(`/api/admin/users/${id}`),
  createAdmin: (data) => api.post('/api/admin/users', data),
  updateAdmin: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteAdmin: (id) => api.delete(`/api/admin/users/${id}`),
  toggleAdminStatus: (id, data) => api.patch(`/api/admin/users/${id}/status`, data),
  resetAdminPassword: (id, data) => api.patch(`/api/admin/users/${id}/password`, data),
  getAdminStats: () => api.get('/api/admin/users/stats'),
};

// Warehouse API
export const warehouseAPI = {
  getWarehouses: () => api.get('/warehouses'),
  getWarehouseById: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
  getWarehouseSections: (id) => api.get(`/warehouses/${id}/sections`),
};

// Section API
export const sectionAPI = {
  getSections: () => api.get('/sections'),
  getSectionById: (id) => api.get(`/sections/${id}`),
  createSection: (data) => api.post('/sections', data),
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/sections/${id}`),
};

// Employee API
export const employeeAPI = {
  getEmployees: () => api.get('/employees'),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  getEmployeesByWarehouse: (warehouseId) => api.get(`/employees/warehouse/${warehouseId}`),
};

// Product API
export const productAPI = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductSubProducts: (id) => api.get(`/products/${id}/sub-products`),
};

// Sub-Product API
export const subProductAPI = {
  getSubProducts: () => api.get('/sub-products'),
  getSubProductById: (id) => api.get(`/sub-products/${id}`),
  createSubProduct: (data) => api.post('/sub-products', data),
  updateSubProduct: (id, data) => api.put(`/sub-products/${id}`, data),
  deleteSubProduct: (id) => api.delete(`/sub-products/${id}`),
};

// Item API
export const itemAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
};

// Supplier API
export const supplierAPI = {
  getSuppliers: () => api.get('/suppliers'),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
};

// Carrier API
export const carrierAPI = {
  getCarriers: () => api.get('/carriers'),
  getCarrierById: (id) => api.get(`/carriers/${id}`),
  createCarrier: (data) => api.post('/carriers', data),
  updateCarrier: (id, data) => api.put(`/carriers/${id}`, data),
  deleteCarrier: (id) => api.delete(`/carriers/${id}`),
};

// Shipment API
export const shipmentAPI = {
  getShipments: (params) => api.get('/api/shipment-infos', { params }),
  getShipmentById: (id) => api.get(`/api/shipment-infos/${id}`),
  createShipment: (data) => api.post('/api/shipment-infos', data),
  updateShipment: (id, data) => api.put(`/api/shipment-infos/${id}`, data),
  updateShipmentStatus: (id, data) => api.patch(`/api/shipment-infos/${id}/status`, data),
  deleteShipment: (id) => api.delete(`/api/shipment-infos/${id}`),
  getShipmentStats: (params) => api.get('/api/shipment-infos/stats', { params }),
};

export default api;