import axiosInstance from '../api/axiosInstance';

// Cierre diario
export const cerrarDiario = (data) => axiosInstance.post('/cierres/diario', data);
export const getCierreDiario = () => axiosInstance.get('/cierres/diario');

// Cierre mensual
export const cerrarMensual = (data) => axiosInstance.post('/cierres/mensual', data);
export const getCierreMensual = (mes, anio) => axiosInstance.get(`/cierres/mensual?mes=${mes}&anio=${anio}`);
export const getTotalVentasMes = (mes, anio) => axiosInstance.get(`/cierres/mensual/total?mes=${mes}&anio=${anio}`);