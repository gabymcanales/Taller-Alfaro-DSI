import { useState, useEffect } from 'react';
import { getClientes, getEstadisticas } from '../../services/clienteService';
import './Clientes.css';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalClientes: 47,
        totalVehiculos: 61,
        nuevosEsteMes: 6,
        ordenesActivas: 3
    });
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [clientesRes, statsRes] = await Promise.all([
                getClientes(),
                getEstadisticas()
            ]);
            setClientes(clientesRes.data);
            setEstadisticas(statsRes.data);
        } catch (err) {
            console.error('Error cargando datos:', err);
            // Datos de ejemplo para mostrar la UI
            setClientes([
                { id: 1, nombre: 'Guadalupe Alfaro', telefono: '7412-3300', direccion: 'Col. Escalón, San Salvador', vehiculos: ['P123-456', 'P789-012'] },
                { id: 2, nombre: 'Juan Pérez', telefono: '7890-1122', direccion: 'Soyapango', vehiculos: ['N554-091'] },
                { id: 3, nombre: 'María García', telefono: '7654-9988', direccion: 'Antiguo Cuscatlán', vehiculos: ['H201-773'] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
        // Aquí puedes implementar búsqueda en tiempo real
    };

    // Función para obtener iniciales del nombre
    const getIniciales = (nombre) => {
        return nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    };

    // Filtrar clientes por búsqueda
    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.telefono.includes(busqueda)
    );



    return (
        <div className="clientes-container">
            {/* Cabecera */}
            <div className="clientes-header">
                <div>
                    <h1>Clientes</h1>
                  
                </div>
                <button className="btn-registrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Registrar Cliente
                </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.totalClientes}</div>
                    <div className="stat-label">Clientes registrados</div>
                    <div className="stat-sub">En expediente</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.totalVehiculos}</div>
                    <div className="stat-label">Vehículos registrados</div>
                    <div className="stat-sub">Con propietario vinculado</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.nuevosEsteMes}</div>
                    <div className="stat-label">Nuevos este mes</div>
                    <div className="stat-sub">Clientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.ordenesActivas}</div>
                    <div className="stat-label">Ordenes activas</div>
                    <div className="stat-sub">Vinculadas a clientes</div>
                </div>
            </div>

            {/* Buscador y tabla */}
            <div className="tabla-container">
                <div className="tabla-header">
                    <div className="buscador">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            value={busqueda}
                            onChange={handleBuscar}
                        />
                    </div>
                    <span className="total-clientes">Todos los clientes</span>
                </div>

                <div className="tabla-scroll">
                    <table className="clientes-tabla">
                        <thead>
                            <tr>
                                <th>CLIENTE</th>
                                <th>TELÉFONO</th>
                                <th>DIRECCIÓN</th>
                                <th>VEHÍCULOS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="sin-datos">
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td className="cliente-nombre">
                                            <div className="avatar-iniciales">
                                                {getIniciales(cliente.nombre)}
                                            </div>
                                            {cliente.nombre}
                                        </td>
                                        <td>{cliente.telefono}</td>
                                        <td>{cliente.direccion}</td>
                                        <td className="vehiculos-lista">
                                            {cliente.vehiculos.map((v, i) => (
                                                <span key={i} className="vehiculo-tag">{v}</span>
                                            ))}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Clientes;