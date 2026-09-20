import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: agrega el token a cada petición
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: maneja sesión inválida o vencida.
// 401 siempre significa "no autenticado". Un 403 sin cuerpo también lo es: lo emite
// directamente Spring Security cuando el JWT es inválido/venció (antes de llegar al
// controlador), a diferencia de un 403 de negocio (rol insuficiente, regla de la app),
// que siempre trae un cuerpo JSON con "mensaje" generado por el backend.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const sinCuerpo = !error.response?.data ||
            (typeof error.response.data === 'string' && error.response.data.trim() === '');

        if (status === 401 || (status === 403 && sinCuerpo)) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?sesion=expirada';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;