import { useState, useEffect } from 'react';
import { getHistorial } from '../../../services/cobroService';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import './Historial.css';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
    </svg>
);

const ClearIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
);

const ListIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5" style={{ marginRight: '8px' }}>
        <path d="M9 6l11 0" />
        <path d="M9 12l11 0" />
        <path d="M9 18l11 0" />
        <path d="M5 6l0 .01" />
        <path d="M5 12l0 .01" />
        <path d="M5 18l0 .01" />
    </svg>
);

const Historial = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [filteredTransacciones, setFilteredTransacciones] = useState([]);
    const [filters, setFilters] = useState({
        numOrden: '',
        fechaDesde: '',
        fechaHasta: '',
        estado: ''
    });

    
    const cargarHistorial = async () => {
        try {
            const response = await getHistorial();
            setTransacciones(response.data);
            setFilteredTransacciones(response.data);
        } catch (err) {
            console.error('Error al cargar historial:', err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = async () => {
        try {
            const params = {};
            if (filters.numOrden) params.numOrden = filters.numOrden;
            if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
            if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
            if (filters.estado) params.estado = filters.estado;
            
            const response = await getHistorial(params);
            setFilteredTransacciones(response.data);
        } catch (err) {
            console.error('Error al aplicar filtros:', err);
        }
    };

    const limpiarFiltros = () => {
        setFilters({
            numOrden: '',
            fechaDesde: '',
            fechaHasta: '',
            estado: ''
        });
        setFilteredTransacciones(transacciones);
    };


    useEffect(() => {
        cargarHistorial();
    }, []);

    const totalMonto = filteredTransacciones.reduce((sum, t) => sum + t.monto, 0);

    return (
        <div className="historial-container">
            <div className="page-header">
                <h1>Historial de Transacciones</h1>
                <span className="badge-readonly">Solo lectura</span>
            </div>

            <CobrosTabs />

            <div className="panel">
                <div className="panel-header">
                    <h3>
                        <ListIcon />
                        Todas las transacciones
                    </h3>
                    <span>{filteredTransacciones.length} transacciones</span>
                </div>

                <div className="filters-bar">
                    <input
                        type="text"
                        name="numOrden"
                        placeholder="N° de orden o cliente..."
                        value={filters.numOrden}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="date"
                        name="fechaDesde"
                        value={filters.fechaDesde}
                        onChange={handleFilterChange}
                        placeholder="Desde"
                    />
                    <input
                        type="date"
                        name="fechaHasta"
                        value={filters.fechaHasta}
                        onChange={handleFilterChange}
                        placeholder="Hasta"
                    />
                    <button className="btn-ghost" onClick={aplicarFiltros}>
                        <SearchIcon />
                        Buscar
                    </button>
                    <button className="btn-ghost" onClick={limpiarFiltros}>
                        <ClearIcon />
                        Limpiar
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Orden</th>
                                <th>Servicios</th>
                                <th>Monto</th>
                                <th>Empleado</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransacciones.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1" style={{ marginBottom: '16px' }}>
                                            <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                            <path d="M21 21l-6 -6" />
                                        </svg>
                                        <div>No se encontraron transacciones</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransacciones.map((t, index) => (
                                    <tr key={index}>
                                        <td style={{ color: '#a0a0a0' }}>{t.fecha}</td>
                                        <td style={{ color: '#a0a0a0' }}>{t.hora}</td>
                                        <td className="order-highlight">{t.numOrden}</td>
                                        <td>{t.servicios}</td>
                                        <td className="monto-highlight">${t.monto.toFixed(2)}</td>
                                        <td style={{ color: '#a0a0a0' }}>{t.empleadoUsername}</td>
                                        <td>
                                            <span className={`status-pill ${t.estado === 'Cerrado' ? 'pill-yellow' : 'pill-green'}`}>
                                                {t.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>Mostrando {filteredTransacciones.length} de {transacciones.length} transacciones</span>
                    <span className="total-highlight">Subtotal: ${totalMonto.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default Historial;