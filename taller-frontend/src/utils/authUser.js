// El payload del JWT viene en base64url y su contenido en UTF-8 (tildes, ñ)
const decodificarPayload = (segmento) => {
    const base64 = segmento.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
};

export const getUsuarioActual = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = decodificarPayload(token.split('.')[1]);
        return { username: payload.sub, rol: payload.rol, nombre: payload.nombre };
    } catch (e) {
        console.error('Error al decodificar token:', e);
        return null;
    }
};

export const esAdministrador = (usuario) => usuario?.rol === 'ADMINISTRADOR';
