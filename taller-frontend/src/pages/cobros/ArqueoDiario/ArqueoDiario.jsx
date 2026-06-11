import { useState, useEffect } from 'react';
import { getArqueoDiario } from '../../../services/cobroService';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import './ArqueoDiario.css';

const ArqueoDiario = () => {
    const [arqueo, setArqueo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarArqueo();
    }, []);

    const cargarArqueo = async () => {
        setLoading(true);
        try {
            const response = await getArqueoDiario();
            setArqueo(response.data);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cargar el arqueo');
        } finally {
            setLoading(false);
        }
    };

    // Icono de dinero (total ingresos)
    const MoneyIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
            <path d="M12 3v3m0 12v3" />
        </svg>
    );

    // Icono de transacciones (lista)
    const TransactionsIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
            <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5m2 0v1.5m0 -9v1.5" />
        </svg>
    );

    // Icono de reloj (primer cobro)
    const ClockIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 7v5l3 3" />
        </svg>
    );

    // Icono de reloj último (último cobro)
    const LastClockIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 12l-3 2" />
            <path d="M12 7v5" />
        </svg>
    );


    return (
        <div className="arqueo-container">
            <div className="page-header">
                <h1>Arqueo de Caja Diario</h1>
                <span className="badge-green">Actualizado al momento</span>
            </div>

            <CobrosTabs />

            {/* Tarjetas de estadísticas */}
            <div className="cards-row">
                <div className="stat-card">
                    <div className="icon-box blue">
                        <MoneyIcon />
                    </div>
                    <div className="label">Total ingresos del día</div>
                    <div className="value orange">
                        ${arqueo?.totalIngresos?.toFixed(2) || '0.00'}
                    </div>
                    <div className="sub">Actualizado en tiempo real</div>
                </div>

                <div className="stat-card">
                    <div className="icon-box green">
                        <TransactionsIcon />
                    </div>
                    <div className="label">Transacciones</div>
                    <div className="value">{arqueo?.totalTransacciones || 0}</div>
                    <div className="sub">Cobros registrados</div>
                </div>

                <div className="stat-card">
                    <div className="icon-box red">
                        <ClockIcon />
                    </div>
                    <div className="label">Primer cobro</div>
                    <div className="value small">{arqueo?.primerCobroHora || '—'}</div>
                    <div className="sub">Inicio del día</div>
                </div>

                <div className="stat-card">
                    <div className="icon-box orange">
                        <LastClockIcon />
                    </div>
                    <div className="label">Último cobro</div>
                    <div className="value small">{arqueo?.ultimoCobroHora || '—'}</div>
                    <div className="sub">Más reciente</div>
                </div>
            </div>

            {/* Tabla de transacciones */}
            <div className="panel">
                <div className="panel-header">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5" style={{ marginRight: '8px' }}>
                            <path d="M9 6l11 0" />
                            <path d="M9 12l11 0" />
                            <path d="M9 18l11 0" />
                            <path d="M5 6l0 .01" />
                            <path d="M5 12l0 .01" />
                            <path d="M5 18l0 .01" />
                        </svg>
                        Transacciones del día · {new Date().toLocaleDateString('es-ES')}
                    </h3>
                    <span className="pill-green">En vivo</span>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Hora</th>
                                <th>Orden</th>
                                <th>Servicio</th>
                                <th>Monto</th>
                                <th>Empleado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!arqueo?.transacciones || arqueo.transacciones.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        No hay transacciones registradas hoy
                                    </td>
                                </tr>
                            ) : (
                                arqueo.transacciones.map((t, index) => (
                                    <tr key={index}>
                                        <td style={{ color: '#a0a0a0' }}>{t.numero || index + 1}</td>
                                        <td style={{ color: '#a0a0a0' }}>{t.hora}</td>
                                        <td style={{ color: '#ff8c42', fontWeight: '600' }}>{t.numOrden}</td>
                                        <td>{t.servicioNombre}</td>
                                        <td style={{ color: '#97c459', fontWeight: '600' }}>${t.monto.toFixed(2)}</td>
                                        <td style={{ color: '#a0a0a0' }}>{t.empleadoUsername}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>{arqueo?.totalTransacciones || 0} transacciones registradas hoy</span>
                    <span className="total-highlight">
                        Total: ${arqueo?.totalIngresos?.toFixed(2) || '0.00'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ArqueoDiario;