import axiosInstance from '../api/axiosInstance';

export const getServicios = () => {
    return axiosInstance.get('/servicios');
};

export const crearServicio = (data) => {
    return axiosInstance.post('/servicios', data);
};

export const actualizarServicio = (id, data) => {
    return axiosInstance.put(`/servicios/${id}`, data);
};

export const eliminarServicio = (id) => {
    return axiosInstance.delete(`/servicios/${id}`);
};
