import axiosInstance from '../api/axiosInstance';


export const getOrdenes = () => axiosInstance.get('/ordenes');

export const getEstadisticasOrdenes = () => axiosInstance.get('/ordenes/estadisticas');

export const getEstadisticasPorEmpleado = () => axiosInstance.get('/ordenes/estadisticas/empleado');

export const getOrdenById = (id) => axiosInstance.get(`/ordenes/${id}`);

export const crearOrden = (data) => axiosInstance.post('/ordenes', data);

export const cambiarEstadoOrden = (id, estado) =>
    axiosInstance.patch(`/ordenes/${id}/estado?estado=${estado}`);

export const getHistorialOrden = (id) =>
    axiosInstance.get(`/ordenes/${id}/historial`);

export const iniciarServicio = (idOrden, idServicio) =>
    axiosInstance.patch(`/ordenes/${idOrden}/servicios/${idServicio}/iniciar`);

export const finalizarServicio = (idOrden, idServicio, data) =>
    axiosInstance.patch(`/ordenes/${idOrden}/servicios/${idServicio}/finalizar`, data);

export const getServiciosCatalogo = () => axiosInstance.get('/servicios');

export const getClientes = () => axiosInstance.get('/clientes');

export const getVehiculosByCliente = (idCliente) =>
    axiosInstance.get(`/vehiculos/cliente/${idCliente}`);

export const getEmpleadosPorServicio = (idServicio) =>
    axiosInstance.get(`/ordenes/servicios/${idServicio}/empleados`);

export const getOrdenesPorEmpleado = () => axiosInstance.get('/ordenes/empleado');