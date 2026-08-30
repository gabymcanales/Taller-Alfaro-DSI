import axiosInstance from '../api/axiosInstance';

export const getClientes = () => axiosInstance.get('/clientes');


export const getEstadisticas = () => axiosInstance.get('/clientes/estadisticas');


export const buscarClientes = (termino) => axiosInstance.get(`/clientes/buscar?nombre=${termino}`);


export const crearCliente = (data) => axiosInstance.post('/clientes', data);


export const getClienteById = (id) => axiosInstance.get(`/clientes/${id}`);


export const actualizarCliente = (id, data) => axiosInstance.put(`/clientes/${id}`, data);


export const eliminarCliente = (id) => axiosInstance.delete(`/clientes/${id}`);

export const agregarVehiculoACliente = (clienteId, data) => axiosInstance.post(`/clientes/${clienteId}/vehiculos`, data);

export const buscarClientesPorNombre = (nombre) => axiosInstance.get(`/clientes/buscar?nombre=${nombre}`);