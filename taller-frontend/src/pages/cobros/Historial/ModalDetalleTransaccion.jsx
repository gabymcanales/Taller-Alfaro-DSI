import { useState, useEffect } from 'react';
import { getDetalleTransaccion } from '../../../services/cobroService';
import './ModalDetalleTransaccion.css';

const formatoMonto = (valor) => (valor != null ? `$${Number(valor).toFixed(2)}` : '—');

// Nombre de la unidad en singular/plural; las abreviaturas sin entrada (mL, kg, oz...) se dejan igual
const UNIDADES = {
    gal: ['galón', 'galones'],
    galon: ['galón', 'galones'],
    galón: ['galón', 'galones'],
    galones: ['galón', 'galones'],
    l: ['litro', 'litros'],
    litro: ['litro', 'litros'],
    litros: ['litro', 'litros'],
    cuarto: ['cuarto', 'cuartos'],
    cuartos: ['cuarto', 'cuartos'],
    unidad: ['unidad', 'unidades'],
    unidades: ['unidad', 'unidades'],
};

// unidadMedida viene como "1 Gal" (presentación); se quita el número y se ajusta a la cantidad vendida
const formatoCantidad = (cantidad, unidadMedida) => {
    const partes = (unidadMedida || '').trim().split(/\s+/);
    const unidad = (partes.length > 1 && !isNaN(partes[0]) ? partes.slice(1).join(' ') : partes.join(' ')) || 'unidad';
    const formas = UNIDADES[unidad.toLowerCase()];
    if (!formas) return `${cantidad} ${unidad}`;
    return `${cantidad} ${Number(cantidad) === 1 ? formas[0] : formas[1]}`;
};

const ModalDetalleTransaccion = ({ idTransaccion, onClose }) => {
    const [detalle, setDetalle] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelado = false;
        getDetalleTransaccion(idTransaccion)
            .then(res => { if (!cancelado) setDetalle(res.data); })
            .catch(err => {
                if (!cancelado) setError(err.response?.data?.mensaje || 'Error al cargar el detalle');
            });
        return () => { cancelado = true; };
    }, [idTransaccion]);

    const esOrden = detalle?.tipo === 'ORDEN';

    return (
        <div className="dt-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="dt-modal">
                <div className="dt-header">
                    <div>
                        <h3>{detalle ? `${esOrden ? 'Orden' : 'Venta'} ${detalle.numero}` : 'Detalle de transacción'}</h3>
                        {detalle && (
                            <span className="dt-tipo">{esOrden ? 'Orden de trabajo' : 'Venta libre'}</span>
                        )}
                    </div>
                    <button className="dt-close" onClick={onClose}>×</button>
                </div>

                <div className="dt-body">
                    {error && <div className="dt-error">{error}</div>}
                    {!error && !detalle && <div className="dt-cargando">Cargando detalle...</div>}

                    {detalle && (
                        <>
                            <div className="dt-info-grid">
                                <div className="dt-info-item">
                                    <label>Cliente</label>
                                    <span>{detalle.clienteNombre || '—'}</span>
                                    {detalle.clienteTelefono && <small>{detalle.clienteTelefono}</small>}
                                </div>
                                <div className="dt-info-item">
                                    <label>Fecha de cobro</label>
                                    <span>{detalle.fecha} {detalle.hora}</span>
                                </div>
                                {esOrden && (
                                    <div className="dt-info-item">
                                        <label>Vehículo</label>
                                        <span>{detalle.vehiculo || 'Sin vehículo'}</span>
                                    </div>
                                )}
                                <div className="dt-info-item">
                                    <label>Cobrado por</label>
                                    <span>{detalle.empleadoCobro}</span>
                                </div>
                            </div>

                            {detalle.descripcion && (
                                <div className="dt-info-item dt-descripcion">
                                    <label>Descripción</label>
                                    <span>{detalle.descripcion}</span>
                                </div>
                            )}

                            {esOrden && (
                                <div className="dt-seccion">
                                    <h4>Servicios</h4>
                                    <table className="dt-tabla">
                                        <thead>
                                            <tr>
                                                <th>Servicio</th>
                                                <th>Empleado</th>
                                                <th className="dt-num">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalle.servicios.length === 0 ? (
                                                <tr><td colSpan="3" className="dt-vacio">Sin servicios</td></tr>
                                            ) : detalle.servicios.map((s, i) => (
                                                <tr key={i}>
                                                    <td>{s.nombreServicio}</td>
                                                    <td>{s.empleado}</td>
                                                    <td className="dt-num">{formatoMonto(s.precio)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="dt-seccion">
                                <h4>Productos</h4>
                                <table className="dt-tabla">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th className="dt-num">Precio unit.</th>
                                            <th className="dt-num">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalle.productos.length === 0 ? (
                                            <tr><td colSpan="4" className="dt-vacio">Sin productos</td></tr>
                                        ) : detalle.productos.map((p, i) => (
                                            <tr key={i}>
                                                <td>{p.nombre}</td>
                                                <td>{formatoCantidad(p.cantidad, p.unidadMedida)}</td>
                                                <td className="dt-num">{formatoMonto(p.precioUnitario)}</td>
                                                <td className="dt-num">{formatoMonto(p.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="dt-totales">
                                <div><span>Total</span><strong>{formatoMonto(detalle.montoTotal)}</strong></div>
                                <div><span>Recibido</span><span>{formatoMonto(detalle.montoRecibido)}</span></div>
                                <div><span>Cambio</span><span>{formatoMonto(detalle.cambio)}</span></div>
                            </div>
                        </>
                    )}
                </div>

                <div className="dt-footer">
                    <button className="btn-ghost" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleTransaccion;
