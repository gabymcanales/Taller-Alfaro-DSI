import axiosInstance from '../api/axiosInstance';

export const getProductos = () => {
    return axiosInstance.get('/inventario/productos');
};

export const crearProducto = (data) => {
    return axiosInstance.post('/inventario/productos', data);
};

export const actualizarProducto = (id, data) => {
    return axiosInstance.put(`/inventario/productos/${id}`, data);
};

export const eliminarProducto = (id) => {
    return axiosInstance.delete(`/inventario/productos/${id}`);
};

export const getMovimientos = () => {
    return axiosInstance.get('/inventario/movimientos');
};

export const registrarMovimiento = (data) => {
    return axiosInstance.post('/inventario/movimientos', data);
};