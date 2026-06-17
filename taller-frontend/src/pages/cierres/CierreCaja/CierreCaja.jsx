import { useState, useEffect } from 'react';
import { cerrarDiario, getCierreDiario, cerrarMensual, getCierreMensual, getTotalVentasMes } from '../../../services/cierreService';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import ModalConfirmarCierreDiario from '../../../components/common/ModalConfirmarCierreDiario/ModalConfirmarCierreDiario';
import ModalConfirmarCierreMensual from '../../../components/common/ModalConfirmarCierreMensual/ModalConfirmarCierreMensual';
import './CierreCaja.css';

const CierreCaja = () => {
    // ========== ESTADOS CIERRE DIARIO ==========
    const [montoFisico, setMontoFisico] = useState('');
    const [totalEsperado, setTotalEsperado] = useState(0);
    const [diferencia, setDiferencia] = useState(null);
    const [loadingDiario, setLoadingDiario] = useState(false);
    const [cierreExistente, setCierreExistente] = useState(false);
    const [showModalDiario, setShowModalDiario] = useState(false);
    const [datosCierreDiario, setDatosCierreDiario] = useState(null);
    const [errorDiario, setErrorDiario] = useState('');

    // ========== ESTADOS CIERRE MENSUAL ==========
    const [totalVentasMes, setTotalVentasMes] = useState(0);
    const [cierreMensualExistente, setCierreMensualExistente] = useState(false);
    const [loadingMensual, setLoadingMensual] = useState(false);
    const [showModalMensual, setShowModalMensual] = useState(false);
    const [datosCierreMensual, setDatosCierreMensual] = useState(null);

    // ========== FUNCIONES CIERRE DIARIO ==========
    const cargarCierreDiario = async () => {
        try {
            const response = await getCierreDiario();
            if (response.data) {
                setTotalEsperado(response.data.montoEsperado);
                
                setCierreExistente(response.data.cerrado === true);
            }
        } catch {
            setCierreExistente(false);
        }
    };

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
    };

    const cargarDatosParaModalDiario = async () => {
        try {
            const response = await getCierreDiario();
            if (response.data && response.data.cerrado === true) {
                setCierreExistente(true);
                return;
            }
        } catch {
            // No hay cierre, continuar
        }

        setDatosCierreDiario({
            fecha: new Date().toLocaleDateString('es-ES'),
            totalEsperado: totalEsperado,
            montoFisico: parseFloat(montoFisico),
            diferencia: diferencia,
            usuario: 'Admin',
            horaCierre: new Date().toLocaleTimeString('es-ES')
        });
        setShowModalDiario(true);
    };

    const handleCierreDiario = async () => {
        if (!montoFisico || parseFloat(montoFisico) <= 0) {
            setErrorDiario('Ingrese el monto físico contado');
            return;
        }

        setLoadingDiario(true);
        try {
            const response = await cerrarDiario({ montoFisico: parseFloat(montoFisico) });
            setCierreExistente(true);
            setTotalEsperado(response.data.montoEsperado);
            setShowModalDiario(false);
        } catch (err) {
            setErrorDiario(err.response?.data?.mensaje || 'Error al realizar el cierre diario');
        } finally {
            setLoadingDiario(false);
        }
    };

    const limpiarCierreDiario = () => {
        setMontoFisico('');
        setDiferencia(null);
        setErrorDiario('');
    };

    // ========== FUNCIONES CIERRE MENSUAL ==========
    const cargarDatosMensuales = async () => {
        const mes = new Date().getMonth() + 1;
        const anio = new Date().getFullYear();

        try {
            const response = await getCierreMensual(mes, anio);
            if (response.data && response.data.cerrado === true) {
                setCierreMensualExistente(true);
                setTotalVentasMes(response.data.montoTotal);
                return;
            } else {
                setCierreMensualExistente(false);
            }
        } catch {
            setCierreMensualExistente(false);
        }

        try {
            const response = await getTotalVentasMes(mes, anio);
            setTotalVentasMes(response.data);
        } catch {
            console.error('Error al cargar datos mensuales');
            setTotalVentasMes(0);
        }
    };

    const cargarDatosParaModalMensual = async () => {
        const mes = new Date().getMonth() + 1;
        const anio = new Date().getFullYear();

        try {
            const response = await getCierreMensual(mes, anio);
            if (response.data && response.data.cerrado === true) {
                setCierreMensualExistente(true);
                return;
            }
        } catch {
            // No hay cierre, continuar
        }

        setDatosCierreMensual({
            mes: mes,
            anio: anio,
            totalMes: totalVentasMes,
            diasTrabajados: 0,
            totalTransacciones: 0,
            usuario: 'Admin'
        });
        setShowModalMensual(true);
    };

    const handleCierreMensual = async () => {
        setLoadingMensual(true);
        try {
            const response = await cerrarMensual({
                mes: new Date().getMonth() + 1,
                anio: new Date().getFullYear()
            });
            setCierreMensualExistente(true);
            setTotalVentasMes(response.data.montoTotal);
            setShowModalMensual(false);
        } catch (err) {
            console.error('Error al realizar cierre mensual:', err);
        } finally {
            setLoadingMensual(false);
        }
    };

    useEffect(() => {
        const inicializarDatos = async () => {
            await cargarCierreDiario();
            await cargarDatosMensuales();
        };
        inicializarDatos();
    }, []);

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
                {/* Panel Cierre Diario */}
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

                        {errorDiario && (
                            <div className="alert-warn">
                                <span>⚠</span> {errorDiario}
                            </div>
                        )}

                        {cierreExistente && (
                            <div className="alert-info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#85b7eb" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>El día ya ha sido cerrado. No se puede realizar otro cierre.</span>
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
                                onClick={cargarDatosParaModalDiario}
                                disabled={loadingDiario || cierreExistente || !montoFisico}
                            >
                                {loadingDiario ? 'Procesando...' : 'Ejecutar cierre diario'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel Cierre Mensual */}
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
                        <span className="status-pill pill-yellow">{meses[new Date().getMonth()]} {new Date().getFullYear()}</span>
                    </div>
                    <div className="panel-body">
                        <div className="close-info">
                            <div className="info-card">
                                <div className="ic-label">Total ventas del mes</div>
                                <div className="ic-val orange">${totalVentasMes.toFixed(2)}</div>
                                <div className="ic-sub">Total acumulado</div>
                            </div>
                            <div className="info-card">
                                <div className="ic-label">Mes actual</div>
                                <div className="ic-val">{meses[new Date().getMonth()]}</div>
                                <div className="ic-sub">{new Date().getFullYear()}</div>
                            </div>
                        </div>

                        <div className="summary-row">
                            <span style={{ color: '#a0a0a0' }}>Total del mes</span>
                            <span style={{ color: '#ff8c42', fontWeight: 'bold' }}>${totalVentasMes.toFixed(2)}</span>
                        </div>

                        {cierreMensualExistente && (
                            <div className="alert-info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#85b7eb" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>El mes ya ha sido cerrado. No se puede realizar otro cierre.</span>
                            </div>
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
                            <button className="btn-outline" onClick={() => { }}>
                                Cancelar
                            </button>
                            <button
                                className="btn-primary"
                                onClick={cargarDatosParaModalMensual}
                                disabled={loadingMensual || cierreMensualExistente}
                            >
                                {loadingMensual ? 'Procesando...' : 'Cerrar mes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <ModalConfirmarCierreDiario
                isOpen={showModalDiario}
                onClose={() => setShowModalDiario(false)}
                onConfirm={handleCierreDiario}
                data={datosCierreDiario}
            />

            <ModalConfirmarCierreMensual
                isOpen={showModalMensual}
                onClose={() => setShowModalMensual(false)}
                onConfirm={handleCierreMensual}
                data={datosCierreMensual}
            />
        </div>
    );
};

export default CierreCaja;