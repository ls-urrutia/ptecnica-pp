import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Configuración base de Axios
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar el token de autenticación
 */
apiClient.interceptors.request.use(
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

/**
 * Interceptor para manejar errores de respuesta
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicios de la API
 */
export const authService = {
  login: (credentials) => 
    apiClient.post('/auth/login', credentials),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),
};

export const citaServicio = {
  create: (citaData) => 
    apiClient.post('/citas', citaData),
  
  getCitasPaciente: () => 
    apiClient.get('/citas/paciente'),
  
  getCitasHoyMedico: (fecha) => 
    apiClient.get(`/citas/medico?fecha=${fecha}`),
  
  citaConfirmar: (id, accion) => 
    apiClient.put(`/citas/${id}/confirmar`, { accion }),
  
  getMedicos: () => 
    apiClient.get('/citas/medicos'),
};

/**
 * Servicios de pagos
 */
export const pagoServicio = {
  processPayment: (paymentData) => 
    apiClient.post('/pagos', paymentData),
  
  getEstadoPago: (citaId) => 
    apiClient.get(`/pagos/cita/${citaId}`),
};

export default apiClient;