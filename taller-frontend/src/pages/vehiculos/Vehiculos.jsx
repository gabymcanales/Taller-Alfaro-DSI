import { useState, useEffect } from 'react';
import { getVehiculos } from '../../services/vehiculoService';
import { getEstadisticas } from '../../services/clienteService';
import ModalHistorialVehiculo from './ModalHistorialVehiculo';
import ModalEliminarVehiculo from './ModalEliminarVehiculo';
import ModalEditarVehiculo from './ModalEditarVehiculo';
import ModalRegistrarVehiculo from './ModalRegistrarVehiculo';
import ModalRegistrarCliente from '../clientes/ModalRegistrarCliente';
import './Vehiculos.css';

const Vehiculos = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalClientes: 0,
        totalVehiculos: 0,
        ordenesActivas: 0
    });
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');

    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showEliminar, setShowEliminar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [showRegistrar, setShowRegistrar] = useState(false);
    const [showRegistrarCliente, setShowRegistrarCliente] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [vehiculosRes, statsRes] = await Promise.all([
                getVehiculos(),
                getEstadisticas()
            ]);
            setVehiculos(vehiculosRes.data || []);
            setEstadisticas(statsRes.data || {
                totalClientes: 0,
                totalVehiculos: 0,
                ordenesActivas: 0
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los vehículos');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
    };

    const handleVerHistorial = (vehiculo) => {
        setVehiculoSeleccionado(vehiculo);
        setShowHistorial(true);
    };

    const handleEliminar = (vehiculo) => {
        setVehiculoSeleccionado(vehiculo);
        setShowEliminar(true);
    };

    const handleEditar = (vehiculo) => {
        setVehiculoSeleccionado(vehiculo);
        setShowEditar(true);
    };

    const handleAbrirRegistrarCliente = () => {
        setShowRegistrar(false);
        setShowRegistrarCliente(true);
    };

    const vehiculosFiltrados = vehiculos.filter(v =>
        v.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.cliente?.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        (v.anio?.toString() || '').includes(busqueda)
    );

    const HistorialIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3" />
            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>
    );

    const EditarIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
            <path d="M14.5 5.5l4 4" />
        </svg>
    );

    const EliminarIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l-1 -14" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );

    if (loading) {
        return (
            <div className="vehiculos-container">
                <div className="loading">Cargando vehículos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vehiculos-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="vehiculos-container">
            <div className="vehiculos-header">
                <div>
                    <h1>Vehículos</h1>
                </div>
                <button
                    className="btn-registrar"
                    onClick={() => setShowRegistrar(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Registrar Vehículo
                </button>
            </div>

            {/* ========== STATS ========== */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                        </svg>
                    </div>
                    <div className="stats-number">{estadisticas?.totalClientes ?? 0}</div>
                    <div className="stat-label">Clientes registrados</div>
                    <div className="stat-sub">Con vehículos</div>
                </div>

                <div className="stat-card ">
                    <div className="stat-icon yellows">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                        </svg>
                    </div>
                    <div className="stats-number">{estadisticas?.totalVehiculos ?? 0}</div>
                    <div className="stat-label">Vehículos registrados</div>
                    <div className="stat-sub">Con propietario vinculado</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                            <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
                            <path d="M9 12l.01 0" />
                            <path d="M13 12l2 0" />
                            <path d="M9 16l.01 0" />
                            <path d="M13 16l2 0" />
                        </svg>
                    </div>
                    <div className="stats-number">{estadisticas?.ordenesActivas ?? 0}</div>
                    <div className="stat-label">Órdenes activas</div>
                    <div className="stat-sub">Vinculadas a vehículos</div>
                </div>
            </div>

            {/* ========== TABLA ========== */}
            <div className="tabla-container">
                <div className="tabla-header">
                    <div className="search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por placa, marca o propietario..."
                            value={busqueda}
                            onChange={handleBuscar}
                        />
                    </div>
                    <span className="table-count">Todos los vehículos</span>
                </div>

                <div className="tabla-scroll">
                    <table className="vehiculos-tabla">
                        <thead>
                            <tr>
                                <th>PLACA</th>
                                <th>MARCA / MODELO</th>
                                <th>AÑO</th>
                                <th>COLOR</th>
                                <th>PROPIETARIO</th>
                                <th className="acciones-header">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehiculosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="sin-datos">
                                        No se encontraron vehículos
                                    </td>
                                </tr>
                            ) : (
                                vehiculosFiltrados.map((v) => (
                                    <tr key={v.idVehiculo}>
                                        <td className="placa-destacada">{v.placa}</td>
                                        <td>{v.marca} {v.modelo}</td>
                                        <td>{v.anio || '—'}</td>
                                        <td>
                                            {v.color || '—'}
                                        </td>
                                        <td>{v.cliente?.nombreCliente || 'Sin propietario'}</td>
                                        <td className="acciones-cell">
                                            <button
                                                className="btn-ver-historial"
                                                onClick={() => handleVerHistorial(v)}
                                                title="Ver historial"
                                            >
                                                <HistorialIcon />
                                            </button>
                                            <button
                                                className="btn-editar"
                                                onClick={() => handleEditar(v)}
                                                title="Editar"
                                            >
                                                <EditarIcon />
                                            </button>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => handleEliminar(v)}
                                                title="Eliminar"
                                            >
                                                <EliminarIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== MODALES ========== */}
            {showHistorial && (
                <ModalHistorialVehiculo
                    vehiculo={vehiculoSeleccionado}
                    onClose={() => setShowHistorial(false)}
                />
            )}

            {showEliminar && (
                <ModalEliminarVehiculo
                    vehiculo={vehiculoSeleccionado}
                    onClose={() => setShowEliminar(false)}
                    onSuccess={cargarDatos}
                />
            )}

            {showEditar && (
                <ModalEditarVehiculo
                    vehiculo={vehiculoSeleccionado}
                    onClose={() => setShowEditar(false)}
                    onSuccess={cargarDatos}
                />
            )}

            {showRegistrar && (
                <ModalRegistrarVehiculo
                    onClose={() => setShowRegistrar(false)}
                    onSuccess={cargarDatos}
                    onRegistrarCliente={handleAbrirRegistrarCliente}
                />
            )}

            {showRegistrarCliente && (
                <ModalRegistrarCliente
                    onClose={() => setShowRegistrarCliente(false)}
                    onSuccess={() => {
                        cargarDatos();
                        setShowRegistrar(true);
                    }}
                />
            )}
        </div>
    );
};

export default Vehiculos;