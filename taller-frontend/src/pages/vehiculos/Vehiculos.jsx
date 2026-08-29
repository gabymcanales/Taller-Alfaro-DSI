import { useState, useEffect } from 'react';
import { getVehiculos, getEstadisticasVehiculos } from '../../services/vehiculoService';
import './Vehiculos.css';

const Vehiculos = () => {
    const [vehiculos, setVehiculos] = useState([]);
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
            const [vehiculosRes, statsRes] = await Promise.all([
                getVehiculos(),
                getEstadisticasVehiculos()
            ]);
            setVehiculos(vehiculosRes.data);
            setEstadisticas(statsRes.data);
        } catch (err) {
            console.error('Error cargando datos:', err);
            // Datos de ejemplo para mostrar la UI
            setVehiculos([
                { id: 1, placa: 'P123-456', marca: 'Toyota', modelo: 'Corolla', año: 2020, color: 'Gris', propietario: 'Guadalupe Alfaro' },
                { id: 2, placa: 'N554-091', marca: 'Nissan', modelo: 'Sentra', año: 2017, color: 'Blanco', propietario: 'Juan Pérez' },
                { id: 3, placa: 'H201-773', marca: 'Honda', modelo: 'Civic', año: 2019, color: 'Azul', propietario: 'María García' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
    };

    // Filtrar vehículos por búsqueda
    const vehiculosFiltrados = vehiculos.filter(v =>
        v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.propietario.toLowerCase().includes(busqueda.toLowerCase())
    );


    return (
        <div className="vehiculos-container">
            {/* Cabecera */}
            <div className="vehiculos-header">
                <div>
                    <h1>Vehículos</h1>
                   
                </div>
                <button className="btn-registrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Registrar Vehículo
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
                    <div className="stat-sub">Vehículos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.ordenesActivas}</div>
                    <div className="stat-label">Órdenes activas</div>
                    <div className="stat-sub">Vinculadas a vehículos</div>
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
                            </tr>
                        </thead>
                        <tbody>
                            {vehiculosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="sin-datos">
                                        No se encontraron vehículos
                                    </td>
                                </tr>
                            ) : (
                                vehiculosFiltrados.map((v) => (
                                    <tr key={v.id}>
                                        <td className="placa-destacada">{v.placa}</td>
                                        <td>{v.marca} {v.modelo}</td>
                                        <td>{v.año}</td>
                                        <td>
                                            <span className="color-dot" style={{ backgroundColor: v.color.toLowerCase() }} />
                                            {v.color}
                                        </td>
                                        <td>{v.propietario}</td>
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

export default Vehiculos;