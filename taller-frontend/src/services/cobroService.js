import axiosInstance from '../api/axiosInstance';


export const registrarCobro = (data) => axiosInstance.post('/cobros/registrar', data);
export const getArqueoDiario = () => axiosInstance.get('/cobros/arqueo');
export const getHistorial = (params) => axiosInstance.get('/cobros/historial', { params });

// Obtener servicios (con simulación si falla)
export const getServicios = async () => {
    try {
        const response = await axiosInstance.get('/cobros/servicios');
        return response;
    } catch (error) {
        console.log('Backend no disponible, usando datos de prueba');
        return { data: serviciosMock };
    }
    
};