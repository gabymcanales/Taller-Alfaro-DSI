import axiosInstance from '../api/axiosInstance';

// Datos de prueba (simulación)
/*const serviciosMock = [
    { idServicio: 1, nombreServicio: 'Cambio de aceite', },
    { idServicio: 2, nombreServicio: 'Alineación y balanceo'},
    { idServicio: 3, nombreServicio: 'Revisión de frenos'},
    { idServicio: 4, nombreServicio: 'Diagnóstico por computadora' },
];*/
// Registrar cobro (real)
export const registrarCobro = (data) => axiosInstance.post('/cobros/registrar', data);
export const getArqueoDiario = () => axiosInstance.get('/cobros/arqueo');

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