import axiosInstance from '../api/axiosInstance';

export const registrarVentaLibre = (data) => axiosInstance.post('/ventas-libres', data);
