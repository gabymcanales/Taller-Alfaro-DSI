import axiosInstance from '../api/axiosInstance';

// Obtener todos los clientes
export const getClientes = () => axiosInstance.get('/clientes');

// Obtener estadísticas
export const getEstadisticas = () => axiosInstance.get('/clientes/estadisticas');

// Buscar clientes
export const buscarClientes = (termino) => axiosInstance.get(`/clientes/buscar?q=${termino}`);