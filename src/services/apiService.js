import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Configuración de Axios con CORS
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Importante para CORS en producción
});

// Interceptor para manejar respuestas de error globalmente
axiosInstance.interceptors.response.use(
  (response) => response, // Devolver la respuesta si todo está bien
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Sesión inválida o caducada. Cerrando sesión...');
      // Limpiar tokens del almacenamiento local
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      alert('Tu sesión ha caducado o el servidor no está disponible. Por favor, inicia sesión nuevamente.');
      // Recargar la página o redirigir
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Función para realizar solicitudes autenticadas con el token
export const apiRequestWithToken = async (url, method, data = null) => {
  const token = localStorage.getItem('authToken');
  console.log('Token enviado:', token);

  try {
    // Asegurarnos de que no comienza con /api si ya está incluido en el baseURL
    const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
    const response = await axiosInstance({
      method,
      url: apiUrl,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Respuesta del servidor:', response.data);
    return response;
  } catch (error) {
    console.error('Error en la solicitud:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

// Funciones de autenticación
export const loginUser = async (email, password) => {
  try {
    console.log('Enviando datos de login:', { email, password });
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

export const signupUser = async (email, password) => {
  try {
    console.log('Enviando datos de registro:', { email, password });
    const response = await axiosInstance.post('/api/auth/register', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

// ========= FUNCIONES PARA OBTENER IMÁGENES =========

/**
 * Obtiene una imagen aleatoria (real o IA)
 * @param {boolean} [isReal] - Si se especifica, filtra por imágenes reales (true) o IA (false)
 * @returns {Promise<Object>} - Objeto con id, url y real (boolean)
 */
export const fetchRandomImage = async (isReal) => {
  try {
    const endpoint = isReal !== undefined 
      ? `/api/images/random?real=${isReal}` 
      : '/api/images/random';
    
    const response = await axiosInstance.get(endpoint);
    console.log('Imagen aleatoria recibida:', response.data);
    return response.data; // Devuelve { id, url, real }
  } catch (error) {
    console.error('Error al obtener imagen aleatoria:', error);
    throw error;
  }
};

// Función para obtener la puntuación del usuario
export const getUserScore = async () => {
  try {
    const response = await apiRequestWithToken('/api/scores/my-score', 'GET');
    return response.data;
  } catch (error) {
    console.error('Error al obtener la puntuación del usuario:', error.message);
    throw error;
  }
};

// Función para actualizar la puntuación del usuario
export const updateUserScore = async (points, decrementAttempts = false) => {
  try {
    const response = await apiRequestWithToken('/api/scores/update', 'POST', { 
      points,
      decrementAttempts
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la puntuación del usuario:', error.message);
    throw error;
  }
};

// Función para reiniciar los intentos del usuario
export const resetUserAttempts = async () => {
  try {
    const response = await apiRequestWithToken('/api/scores/reset-attempts', 'POST');
    return response.data;
  } catch (error) {
    console.error('Error al reiniciar los intentos del usuario:', error.message);
    throw error;
  }
};
