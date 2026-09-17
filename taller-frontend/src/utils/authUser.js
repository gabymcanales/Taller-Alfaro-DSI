export const getUsuarioActual = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { username: payload.sub, rol: payload.rol };
    } catch (e) {
        console.error('Error al decodificar token:', e);
        return null;
    }
};

export const esAdministrador = (usuario) => usuario?.rol === 'ADMINISTRADOR';
