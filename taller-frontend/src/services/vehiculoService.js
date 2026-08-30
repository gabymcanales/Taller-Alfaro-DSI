import axiosInstance from '../api/axiosInstance';

export const getVehiculos = () => axiosInstance.get('/vehiculos');

export const getEstadisticasVehiculos = () => axiosInstance.get('/vehiculos/estadisticas');

export const buscarVehiculos = (termino) => axiosInstance.get(`/vehiculos/buscar?q=${termino}`);

export const crearVehiculo = (data) => axiosInstance.post('/vehiculos', data);

export const getVehiculoById = (id) => axiosInstance.get(`/vehiculos/${id}`);

export const getVehiculosByCliente = (clienteId) => axiosInstance.get(`/vehiculos/cliente/${clienteId}`);

export const actualizarVehiculo = (id, data) => axiosInstance.put(`/vehiculos/${id}`, data);

export const eliminarVehiculo = (id) => axiosInstance.delete(`/vehiculos/${id}`);

export const buscarVehiculoPorPlaca = (placa) => axiosInstance.get(`/vehiculos/placa?placa=${placa}`);

export const getHistorialVehiculo = (id) => axiosInstance.get(`/vehiculos/${id}/historial`);
