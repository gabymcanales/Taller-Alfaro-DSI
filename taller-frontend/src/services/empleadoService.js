import axiosInstance from '../api/axiosInstance';

export const getEmpleados = () => {
    return axiosInstance.get('/empleados');
};

export const crearEmpleado = (data) => {
    return axiosInstance.post('/empleados', data);
};

export const actualizarEmpleado = (id, data) => {
    return axiosInstance.put(`/empleados/${id}`, data);
};

export const cambiarEstadoEmpleado = (id, activo) => {
    return axiosInstance.patch(`/empleados/${id}/estado?activo=${activo}`);
};
