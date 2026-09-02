import { useState, useEffect } from 'react';
import { getVehiculos } from '../../services/vehiculoService';
import ModalHistorialVehiculo from './ModalHistorialVehiculo';
import ModalEliminarVehiculo from './ModalEliminarVehiculo';
import ModalEditarVehiculo from './ModalEditarVehiculo';
import ModalRegistrarVehiculo from './ModalRegistrarVehiculo';
import './Vehiculos.css';

const Vehiculos = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalClientes: 0,
        totalVehiculos: 0,
        nuevosEsteMes: 0,
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

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getVehiculos();
            setVehiculos(response.data || []);
            const totalVehiculos = response.data?.length || 0;
            const clientesUnicos = new Set(response.data?.map(v => v.cliente?.idCliente) || []).size;
            setEstadisticas({
                totalClientes: clientesUnicos,
                totalVehiculos: totalVehiculos,
                nuevosEsteMes: 0,
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

    const vehiculosFiltrados = vehiculos.filter(v =>
        v.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.cliente?.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase())
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

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.totalClientes ?? 0}</div>
                    <div className="stat-label">Clientes registrados</div>
                    <div className="stat-sub">Con vehículos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.totalVehiculos ?? 0}</div>
                    <div className="stat-label">Vehículos registrados</div>
                    <div className="stat-sub">Con propietario vinculado</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.nuevosEsteMes ?? 0}</div>
                    <div className="stat-label">Nuevos este mes</div>
                    <div className="stat-sub">Vehículos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.ordenesActivas ?? 0}</div>
                    <div className="stat-label">Órdenes activas</div>
                    <div className="stat-sub">Vinculadas a vehículos</div>
                </div>
            </div>

            <div className="tabla-container">
                <div className="tabla-header">
                    <div className="buscador">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
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
                    <span className="total-vehiculos">Todos los vehículos</span>
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
                                <th>ACCIONES</th>
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
                                            <span className="color-dot" style={{ backgroundColor: v.color?.toLowerCase() || '#888' }} />
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
                />
            )}
        </div>
    );
};

export default Vehiculos;