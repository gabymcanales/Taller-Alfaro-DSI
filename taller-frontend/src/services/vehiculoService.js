import axiosInstance from '../api/axiosInstance';

// Obtener todos los vehículos
export const getVehiculos = () => axiosInstance.get('/vehiculos');

// Obtener estadísticas
export const getEstadisticasVehiculos = () => axiosInstance.get('/vehiculos/estadisticas');

// Buscar vehículos
export const buscarVehiculos = (termino) => axiosInstance.get(`/vehiculos/buscar?q=${termino}`);