import axiosInstance from '../api/axiosInstance';

export const registrarCobro = (data) => axiosInstance.post('/cobros/registrar', data);
export const getArqueoDiario = () => axiosInstance.get('/cobros/arqueo');
export const getHistorial = (params) => axiosInstance.get('/cobros/historial', { params });
export const getServicios = () => axiosInstance.get('/cobros/servicios');
export const buscarClientes = (nombre) => axiosInstance.get(`/cobros/clientes?nombre=${nombre}`);