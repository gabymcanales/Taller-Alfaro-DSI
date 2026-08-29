import axiosInstance from '../api/axiosInstance';

// ============================================================
// ADMIN
// ============================================================
export const getOrdenes = () => axiosInstance.get('/ordenes');
export const getOrdenById = (id) => axiosInstance.get(`/ordenes/${id}`);
export const crearOrden = (data) => axiosInstance.post('/ordenes', data);
export const getClientes = () => axiosInstance.get('/clientes');
export const getVehiculosByCliente = (clienteId) =>
    axiosInstance.get(`/clientes/${clienteId}/vehiculos`);
export const getEmpleados = () => axiosInstance.get('/empleados/activos');
export const getServicios = () => axiosInstance.get('/cobros/servicios');
export const getHistorialEstados = (ordenId) =>
    axiosInstance.get(`/ordenes/${ordenId}/historial`);
export const cobrarOrden = (ordenId, data) =>
    axiosInstance.post(`/ordenes/${ordenId}/cobrar`, data);

// ============================================================
// EMPLEADO
// ============================================================
export const getMisServicios = () => axiosInstance.get('/ordenes/mis-servicios');
export const updateEstadoServicio = (ordenId, servicioId, data) =>
    axiosInstance.put(`/ordenes/${ordenId}/servicios/${servicioId}/estado`, data);
export const updatePrecioServicio = (ordenId, servicioId, data) =>
    axiosInstance.put(`/ordenes/${ordenId}/servicios/${servicioId}/precio`, data);

// ============================================================
// FILTROS
// ============================================================
export const filtrarOrdenes = (params) =>
    axiosInstance.get('/ordenes/filtrar', { params }); 