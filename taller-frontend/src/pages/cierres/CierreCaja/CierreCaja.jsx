import { useState, useEffect } from 'react';
import { cerrarDiario, getCierreDiario, getTotalVentasMes, cerrarMensual } from '../../../services/cierreService';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import './CierreCaja.css';

const CierreCaja = () => {
    // Estado para cierre diario
    const [montoFisico, setMontoFisico] = useState('');
    const [totalEsperado, setTotalEsperado] = useState(0);
    const [totalTransacciones, setTotalTransacciones] = useState(0);
    const [diferencia, setDiferencia] = useState(null);
    const [loadingDiario, setLoadingDiario] = useState(false);
    const [mensajeDiario, setMensajeDiario] = useState('');
    const [errorDiario, setErrorDiario] = useState('');
    const [cierreExistente, setCierreExistente] = useState(false);

    // Estado para cierre mensual
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [totalVentasMes, setTotalVentasMes] = useState(0);
    const [loadingMensual, setLoadingMensual] = useState(false);
    const [mensajeMensual, setMensajeMensual] = useState('');
    const [errorMensual, setErrorMensual] = useState('');

    // Cargar datos al iniciar
    useEffect(() => {
        cargarCierreDiario();
        cargarTotalVentasMes();
    }, []);

    // Cargar cierre diario existente
    const cargarCierreDiario = async () => {
        try {
            const response = await getCierreDiario();
            if (response.data) {
                setTotalEsperado(response.data.montoEsperado);
                setTotalTransacciones(4); // Esto debería venir del backend
                setCierreExistente(true);
                setMensajeDiario(`Ya existe un cierre para hoy. Total: $${response.data.montoEsperado}`);
            }
        } catch (err) {
            // No hay cierre aún, es normal
            setCierreExistente(false);
        }
    };

    // Cargar total de ventas del mes
    const cargarTotalVentasMes = async () => {
        try {
            const response = await getTotalVentasMes(mes, anio);
            setTotalVentasMes(response.data);
        } catch (err) {
            console.error('Error al cargar total del mes:', err);
        }
    };

    // Calcular diferencia en tiempo real
    const calcularDiferencia = (fisico) => {
        if (fisico && totalEsperado) {
            const dif = parseFloat(fisico) - totalEsperado;
            setDiferencia(dif);
        } else {
            setDiferencia(null);
        }
    };

    const handleMontoFisicoChange = (e) => {
        const valor = e.target.value;
        setMontoFisico(valor);
        calcularDiferencia(valor);
        setErrorDiario('');
        setMensajeDiario('');
    };

    // Ejecutar cierre diario
    const handleCierreDiario = async () => {
        if (!montoFisico || parseFloat(montoFisico) <= 0) {
            setErrorDiario('Ingrese el monto físico contado');
            return;
        }

        setLoadingDiario(true);
        setErrorDiario('');
        setMensajeDiario('');

        try {
            const response = await cerrarDiario({ montoFisico: parseFloat(montoFisico) });
            setMensajeDiario(response.data.mensaje || 'Cierre diario completado exitosamente');
            setCierreExistente(true);
            setTotalEsperado(response.data.montoEsperado);
        } catch (err) {
            setErrorDiario(err.response?.data?.mensaje || 'Error al realizar el cierre diario');
        } finally {
            setLoadingDiario(false);
        }
    };

    // Ejecutar cierre mensual
    const handleCierreMensual = async () => {
        setLoadingMensual(true);
        setErrorMensual('');
        setMensajeMensual('');

        try {
            const response = await cerrarMensual({ mes, anio });
            setMensajeMensual(response.data.mensaje || 'Cierre mensual completado exitosamente');
            setTotalVentasMes(response.data.montoTotal);
        } catch (err) {
            setErrorMensual(err.response?.data?.mensaje || 'Error al realizar el cierre mensual');
        } finally {
            setLoadingMensual(false);
        }
    };

    const limpiarCierreDiario = () => {
        setMontoFisico('');
        setDiferencia(null);
        setErrorDiario('');
        setMensajeDiario('');
    };

    // Nombres de los meses
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="cierres-container">
            <div className="page-header">
                <h1>Cierre de Caja</h1>
            
                <span className="badge-date">{new Date().toLocaleDateString('es-ES')}</span>
            </div>

            <CobrosTabs />

            <div className="two-panels">
                {/* Panel de Cierre Diario */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                                <path d="M8 12a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1l0 -3" />
                                <path d="M10 11v-2a2 2 0 1 1 4 0v2" />
                                <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                            </svg>
                            Cierre diario
                        </h3>
                        <span className="status-pill pill-orange">{new Date().toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="panel-body">
                        <div className="close-info">
                            <div className="info-card">
                                <div className="ic-label">Total esperado (sistema)</div>
                                <div className="ic-val orange">${totalEsperado.toFixed(2)}</div>
                                <div className="ic-sub">{totalTransacciones} transacciones</div>
                            </div>
                            <div className={`info-card ${diferencia !== null ? (diferencia >= 0 ? 'positive' : 'negative') : ''}`}>
                                <div className="ic-label">Diferencia</div>
                                <div className="ic-val">
                                    {diferencia !== null ? (
                                        <span style={{ color: diferencia >= 0 ? '#97c459' : '#f09595' }}>
                                            {diferencia >= 0 ? `+$${diferencia.toFixed(2)}` : `-$${Math.abs(diferencia).toFixed(2)}`}
                                        </span>
                                    ) : '—'}
                                </div>
                                <div className="ic-sub">
                                    {diferencia !== null ? (diferencia >= 0 ? 'Sobrante' : 'Faltante') : 'Ingresa el monto físico'}
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label>Monto físico contado ($)</label>
                            <input
                                type="number"
                                value={montoFisico}
                                onChange={handleMontoFisicoChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                disabled={cierreExistente}
                            />
                        </div>

                        {mensajeDiario && (
                            <div className="alert-success">
                                <span>✓</span> {mensajeDiario}
                            </div>
                        )}

                        {errorDiario && (
                            <div className="alert-warn">
                                <span>⚠</span> {errorDiario}
                            </div>
                        )}

                        <div className="alert-info">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef9f27" strokeWidth="1.5">
                                <path d="M12 9v4" />
                                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                                <path d="M12 16h.01" />
                            </svg>
                            <span>Una vez cerrado, las transacciones de esta jornada no podrán modificarse.</span>
                        </div>

                        <div className="btn-row">
                            <button className="btn-outline" onClick={limpiarCierreDiario} disabled={cierreExistente}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleCierreDiario} 
                                disabled={loadingDiario || cierreExistente}
                            >
                                {loadingDiario ? 'Procesando...' : 'Ejecutar cierre diario'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel de Cierre Mensual */}
                <div className="panel">
                    <div className="panel-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                                <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
                                <path d="M18 14v4h4" />
                                <path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                                <path d="M15 3v4" />
                                <path d="M7 3v4" />
                                <path d="M3 11h16" />
                            </svg>
                            Cierre mensual
                        </h3>
                        <span className="status-pill pill-yellow">{meses[mes - 1]} {anio}</span>
                    </div>
                    <div className="panel-body">
                        <div className="close-info">
                            <div className="info-card">
                                <div className="ic-label">Total ventas del mes</div>
                                <div className="ic-val orange">${totalVentasMes.toFixed(2)}</div>
                                <div className="ic-sub">Transacciones del mes</div>
                            </div>
                            <div className="info-card">
                                <div className="ic-label">Mes seleccionado</div>
                                <div className="ic-val">{meses[mes - 1]}</div>
                                <div className="ic-sub">{anio}</div>
                            </div>
                        </div>

                        <div className="selector-mes">
                            <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
                                {meses.map((m, idx) => (
                                    <option key={idx} value={idx + 1}>{m}</option>
                                ))}
                            </select>
                            <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))}>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                            </select>
                            <button className="btn-ghost" onClick={cargarTotalVentasMes}>
                                Actualizar
                            </button>
                        </div>

                        <div className="summary-row">
                            <span style={{ color: '#a0a0a0' }}>Total del mes</span>
                            <span style={{ color: '#ff8c42', fontWeight: 'bold' }}>${totalVentasMes.toFixed(2)}</span>
                        </div>

                        {mensajeMensual && (
                            <div className="alert-success">{mensajeMensual}</div>
                        )}

                        {errorMensual && (
                            <div className="alert-warn">{errorMensual}</div>
                        )}

                        <div className="alert-warn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef9f27" strokeWidth="1.5">
                                <path d="M12 9v4" />
                                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                                <path d="M12 16h.01" />
                            </svg>
                            <span>Una vez cerrado, ningún registro de este mes podrá editarse ni eliminarse.</span>
                        </div>

                        <div className="btn-row">
                            <button className="btn-outline" onClick={() => {
                                setMensajeMensual('');
                                setErrorMensual('');
                            }}>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={handleCierreMensual} disabled={loadingMensual}>
                                {loadingMensual ? 'Procesando...' : 'Cerrar mes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CierreCaja;