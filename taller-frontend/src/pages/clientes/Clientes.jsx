import { useState, useEffect } from 'react';
import { getClientes, getEstadisticas } from '../../services/clienteService';
import ModalAgregarVehiculo from './ModalAgregarVehiculo';
import ModalEditarCliente from './ModalEditarCliente';
import ModalEliminarCliente from './ModalEliminarCliente';
import ModalRegistrarCliente from './ModalRegistrarCliente';
import './Clientes.css';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalClientes: 0,
        totalVehiculos: 0,
        nuevosEsteMes: 0,
        ordenesActivas: 0
    });
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');

    // Estados para los modales
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [showAgregarVehiculo, setShowAgregarVehiculo] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [showEliminar, setShowEliminar] = useState(false);
    const [showRegistrarCliente, setShowRegistrarCliente] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [clientesRes, statsRes] = await Promise.all([
                getClientes(),
                getEstadisticas()
            ]);
            setClientes(clientesRes.data || []);
            setEstadisticas(statsRes.data || {
                totalClientes: 0,
                totalVehiculos: 0,
                nuevosEsteMes: 0,
                ordenesActivas: 0
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '??';
        const partes = nombre.split(' ');
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
    };

    // ========== FUNCIONES PARA ABRIR MODALES ==========
    const handleAgregarVehiculo = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowAgregarVehiculo(true);
    };

    const handleEditar = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowEditar(true);
    };

    const handleEliminar = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowEliminar(true);
    };

    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.telefonoCliente?.includes(busqueda)
    );

    // ========== ICONOS ==========
    const AgregarVehiculoIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
        </svg>
    );

    const EditarIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
            <path d="M14.5 5.5l4 4" />
        </svg>
    );

    const EliminarIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l-1 -14" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );

    if (loading) {
        return (
            <div className="clientes-container">
                <div className="loading">Cargando clientes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="clientes-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="clientes-container">
            {/* ========== HEADER ========== */}
            <div className="clientes-header">
                <div className="header-left">
                    <h1>Clientes</h1>
                    <p className="header-subtitle">Expediente de clientes y vehículos — Módulo 2</p>
                </div>
                <button className="btn-registrar" onClick={() => setShowRegistrarCliente(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Registrar Cliente
                </button>
            </div>

            {/* ========== STATS ========== */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.totalClientes ?? 0}</div>
                    <div className="stat-label">Clientes registrados</div>
                    <div className="stat-sub">En expediente</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.totalVehiculos ?? 0}</div>
                    <div className="stat-label">Vehículos registrados</div>
                    <div className="stat-sub">Con propietario vinculado</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.nuevosEsteMes ?? 0}</div>
                    <div className="stat-label">Nuevos este mes</div>
                    <div className="stat-sub">Clientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas?.ordenesActivas ?? 0}</div>
                    <div className="stat-label">Órdenes activas</div>
                    <div className="stat-sub">Vinculadas a clientes</div>
                </div>
            </div>

            {/* ========== TABLA ========== */}
            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
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
                    <span className="table-count">Todos los clientes</span>
                </div>

                <div className="table-scroll">
                    <table className="clientes-table">
                        <thead>
                            <tr>
                                <th>CLIENTE</th>
                                <th>TELÉFONO</th>
                                <th>VEHÍCULOS</th>
                                <th className="actions-header">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        <span>No se encontraron clientes</span>
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.idCliente} className="client-row">
                                        <td className="client-cell">
                                            <div className="client-avatar">
                                                <span className="avatar-initials">
                                                    {getIniciales(cliente.nombreCliente)}
                                                </span>
                                            </div>
                                            <span className="client-name">{cliente.nombreCliente}</span>
                                        </td>
                                        <td className="phone-cell">{cliente.telefonoCliente || '—'}</td>
                                        <td className="vehicles-cell">
                                            <div className="vehicle-tags">
                                                {cliente.vehiculos && cliente.vehiculos.length > 0 ? (
                                                    cliente.vehiculos.map((v, i) => (
                                                        <span key={i} className="vehicle-tag">{v.placa}</span>
                                                    ))
                                                ) : (
                                                    <span className="no-vehicle">Sin vehículos</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn add-vehicle"
                                                onClick={() => handleAgregarVehiculo(cliente)}
                                                title="Agregar vehículo"
                                            >
                                                <AgregarVehiculoIcon />
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEditar(cliente)}
                                                title="Editar cliente"
                                            >
                                                <EditarIcon />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleEliminar(cliente)}
                                                title="Eliminar cliente"
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

            {/* ========== MODALES (TODOS FUNCIONANDO) ========== */}
            {showAgregarVehiculo && (
                <ModalAgregarVehiculo
                    cliente={clienteSeleccionado}
                    onClose={() => setShowAgregarVehiculo(false)}
                    onSuccess={cargarDatos}
                />
            )}

            {showEditar && (
                <ModalEditarCliente
                    cliente={clienteSeleccionado}
                    onClose={() => setShowEditar(false)}
                    onSuccess={cargarDatos}
                />
            )}

            {showEliminar && (
                <ModalEliminarCliente
                    cliente={clienteSeleccionado}
                    onClose={() => setShowEliminar(false)}
                    onSuccess={cargarDatos}
                />
            )}

            {showRegistrarCliente && (
                <ModalRegistrarCliente
                    onClose={() => setShowRegistrarCliente(false)}
                    onSuccess={cargarDatos}
                />
            )}
        </div>
    );
};

export default Clientes;