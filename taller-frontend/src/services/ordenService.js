import axiosInstance from '../api/axiosInstance';


export const getOrdenes = () => axiosInstance.get('/ordenes');
export const getOrdenById = (id) => axiosInstance.get(`/ordenes/${id}`);
export const crearOrden = (data) => axiosInstance.post('/ordenes', data);
export const getClientes = () => axiosInstance.get('/clientes');


export const getVehiculosByCliente = (clienteId) =>
    axiosInstance.get(`/vehiculos/cliente/${clienteId}`);


export const getEmpleados = () => axiosInstance.get('/empleados');
export const getServicios = () => axiosInstance.get('/cobros/servicios');
export const getHistorialEstados = (ordenId) =>
    axiosInstance.get(`/ordenes/${ordenId}/historial`);


export const cobrarOrden = (ordenId, data) =>
    axiosInstance.post(`/cobros/${ordenId}/cobrar`, data);


export const getMisServicios = () => axiosInstance.get('/ordenes/mis-servicios');


export const updateEstadoServicio = (ordenId, servicioId, data) =>
    axiosInstance.patch(`/ordenes/${ordenId}/servicios/${servicioId}/estado`, data);

export const updatePrecioServicio = (ordenId, servicioId, data) =>
    axiosInstance.patch(`/ordenes/${ordenId}/servicios/${servicioId}/precio`, data);