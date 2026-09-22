import { useState, useEffect, useRef } from 'react';
import { getProductosDisponibles } from '../../../services/ordenService';
import { buscarClientesPorNombre } from '../../../services/clienteService';
import { registrarVentaLibre } from '../../../services/ventaLibreService';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import '../RegistrarCobro/RegistrarCobro.css';
import './VentaLibre.css';

const ChangeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#97c459" strokeWidth="1.5">
        <path d="M7 20l10 0" />
        <path d="M6 6l6 -1l6 1" />
        <path d="M12 3l0 17" />
        <path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
        <path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
    </svg>
);

const VentaLibre = () => {
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidadProducto, setCantidadProducto] = useState('1');
    const [productosAgregados, setProductosAgregados] = useState([]);

    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [showClientes, setShowClientes] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const [montoRecibido, setMontoRecibido] = useState('');
    const [cambio, setCambio] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(null);

    const buscadorRef = useRef(null);

    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        if (busquedaCliente.length >= 2) {
            const timer = setTimeout(() => {
                buscarClientesPorNombre(busquedaCliente)
                    .then(res => {
                        setClientesSugeridos(res.data || []);
                        setShowClientes(true);
                    })
                    .catch(() => setClientesSugeridos([]));
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setClientesSugeridos([]);
            setShowClientes(false);
        }
    }, [busquedaCliente]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
                setShowClientes(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cargarProductos = async () => {
        try {
            const res = await getProductosDisponibles();
            setProductosDisponibles(res.data || []);
        } catch (err) {
            console.error('Error cargando productos:', err);
        }
    };

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setBusquedaCliente(cliente.nombreCliente);
        setClientesSugeridos([]);
        setShowClientes(false);
    };

    const quitarCliente = () => {
        setClienteSeleccionado(null);
        setBusquedaCliente('');
    };

    const agregarProducto = () => {
        if (!productoSeleccionado) {
            setError('Seleccione un producto');
            return;
        }

        const cantidad = parseInt(cantidadProducto);
        if (!cantidad || cantidad <= 0) {
            setError('Ingrese una cantidad válida');
            return;
        }

        const producto = productosDisponibles.find(p => p.idProducto === parseInt(productoSeleccionado));
        if (!producto) {
            setError('Producto no encontrado');
            return;
        }

        const yaAgregado = productosAgregados.find(p => p.idProducto === producto.idProducto);
        const cantidadPrevia = yaAgregado ? yaAgregado.cantidad : 0;

        if (cantidad + cantidadPrevia > producto.stockActual) {
            setError(`Stock insuficiente. Disponible: ${producto.stockActual}`);
            return;
        }

        if (yaAgregado) {
            setProductosAgregados(prev => prev.map(p =>
                p.idProducto === producto.idProducto
                    ? { ...p, cantidad: p.cantidad + cantidad, subtotal: (p.cantidad + cantidad) * producto.precio }
                    : p
            ));
        } else {
            setProductosAgregados(prev => [...prev, {
                idProducto: producto.idProducto,
                nombre: producto.nombre,
                unidadMedida: producto.unidadMedida,
                precio: producto.precio,
                cantidad,
                subtotal: cantidad * producto.precio
            }]);
        }

        setProductoSeleccionado('');
        setCantidadProducto('1');
        setError('');
    };

    const obtenerUnidadSinCantidad = (unidadMedida) => {
        if (!unidadMedida) return 'unidad(es)';
        const partes = unidadMedida.trim().split(' ');
        if (partes.length > 1 && !isNaN(partes[0])) {
            return partes.slice(1).join(' ') || 'unidad(es)';
        }
        return unidadMedida;
    };

    const eliminarProducto = (index) => {
        setProductosAgregados(prev => prev.filter((_, i) => i !== index));
    };

    const total = productosAgregados.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    const handleMontoRecibidoChange = (e) => {
        const value = e.target.value;
        setMontoRecibido(value);
        setError('');

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= total && total > 0) {
            setCambio(numValue - total);
        } else {
            setCambio(null);
        }
    };

    const handleAbrirConfirmacion = (e) => {
        e.preventDefault();

        if (productosAgregados.length === 0) {
            setError('Agregue al menos un producto');
            return;
        }

        const recibido = parseFloat(montoRecibido);
        if (isNaN(recibido) || recibido <= 0) {
            setError('Ingrese un monto recibido válido (mayor a 0)');
            return;
        }

        if (recibido < total) {
            setError('El monto recibido no puede ser menor al total');
            return;
        }

        setError('');
        setShowConfirm(true);
    };

    const limpiarFormulario = () => {
        setProductosAgregados([]);
        setProductoSeleccionado('');
        setCantidadProducto('1');
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setMontoRecibido('');
        setCambio(null);
        setError('');
    };

    const handleConfirmarVenta = async () => {
        setShowConfirm(false);
        setLoading(true);
        setError('');

        try {
            const recibido = parseFloat(montoRecibido);
            const payload = {
                idCliente: clienteSeleccionado?.idCliente || null,
                productos: productosAgregados.map(p => ({
                    idProducto: p.idProducto,
                    cantidad: p.cantidad
                })),
                montoRecibido: recibido
            };

            const response = await registrarVentaLibre(payload);

            setSuccess({
                ...response.data,
                clienteNombreMostrado: clienteSeleccionado?.nombreCliente || 'Venta libre (mostrador)'
            });

            limpiarFormulario();
            cargarProductos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar la venta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cobros-container">
            <div className="page-header">
                <h1>Venta Libre</h1>
            </div>

            <CobrosTabs />

            <div className="form-panel">
                <div className="form-header">
                    <h3>Venta de productos de mostrador</h3>
                    <span className="badge-estado badge-finalizado">No requiere orden de trabajo</span>
                </div>

                <form onSubmit={handleAbrirConfirmacion}>
                    <div className="form-grid">
                        <div className="form-col">
                            <div className="field">
                                <label>Cliente (opcional)</label>
                                <div className="buscador-orden" ref={buscadorRef}>
                                    <input
                                        type="text"
                                        placeholder=" Buscar cliente registrado (opcional) "
                                        value={busquedaCliente}
                                        onChange={(e) => {
                                            setBusquedaCliente(e.target.value);
                                            if (!e.target.value) quitarCliente();
                                        }}
                                        onFocus={() => {
                                            if (busquedaCliente.length >= 2) setShowClientes(true);
                                        }}
                                    />
                                    {showClientes && clientesSugeridos.length > 0 && (
                                        <div className="resultados-ordenes">
                                            {clientesSugeridos.map(cliente => (
                                                <div
                                                    key={cliente.idCliente}
                                                    className="resultado-orden"
                                                    onClick={() => seleccionarCliente(cliente)}
                                                >
                                                    <div className="orden-info">
                                                        <span className="orden-cliente">{cliente.nombreCliente}</span>
                                                    </div>
                                                    <span className="orden-monto">{cliente.telefonoCliente}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showClientes && busquedaCliente.length >= 2 && clientesSugeridos.length === 0 && (
                                        <div className="resultados-ordenes sin-resultados">
                                            <span>No se encontraron clientes</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <label>Productos</label>
                                <div className="venta-productos-agregar">
                                    <select
                                        value={productoSeleccionado}
                                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                                    >
                                        <option value="">— Seleccione un producto —</option>
                                        {productosDisponibles.map(p => (
                                            <option key={p.idProducto} value={p.idProducto}>
                                                {p.nombre} - ${Number(p.precio || 0).toFixed(2)} (Stock: {p.stockActual})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        className="venta-cantidad-input"
                                        value={cantidadProducto}
                                        onChange={(e) => setCantidadProducto(e.target.value)}
                                    />
                                    <button type="button" className="btn-agregar-venta" onClick={agregarProducto}>
                                        + Agregar
                                    </button>
                                </div>

                                {productosAgregados.length > 0 && (
                                    <div className="venta-productos-lista">
                                        {productosAgregados.map((p, index) => (
                                            <div key={index} className="venta-producto-item">
                                                <span className="venta-producto-nombre">
                                                    {p.nombre} - {p.cantidad} {obtenerUnidadSinCantidad(p.unidadMedida)}
                                                </span>
                                                <span className="venta-producto-subtotal">${Number(p.subtotal).toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    className="btn-eliminar-producto-venta"
                                                    onClick={() => eliminarProducto(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-col">
                            <div className="field">
                                <label>Total a cobrar ($)</label>
                                <input
                                    type="text"
                                    value={`$${total.toFixed(2)}`}
                                    readOnly
                                    className="total-readonly"
                                />
                            </div>

                            <div className="field">
                                <label>Monto recibido ($)</label>
                                <input
                                    type="number"
                                    value={montoRecibido}
                                    onChange={handleMontoRecibidoChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    disabled={productosAgregados.length === 0}
                                />
                            </div>

                            {cambio !== null && cambio >= 0 && (
                                <div className="change-box">
                                    <div>
                                        <div className="change-label">Cambio a entregar</div>
                                        <div className="change-val">${cambio.toFixed(2)}</div>
                                    </div>
                                    <span className="change-icon"><ChangeIcon /></span>
                                </div>
                            )}

                            {success && (
                                <div className="venta-exito">
                                    <strong>¡Venta {success.numVenta} registrada!</strong>
                                    <span>Cliente: {success.clienteNombreMostrado}</span>
                                    <span>Total: ${Number(success.total).toFixed(2)} — Cambio: ${Number(success.cambio).toFixed(2)}</span>
                                </div>
                            )}

                            {error && (
                                <div className="alert-error">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <circle cx="12" cy="16" r="0.5" fill="#f09595" stroke="none" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-outline" onClick={limpiarFormulario}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || productosAgregados.length === 0}>
                            {loading ? 'Procesando...' : 'Registrar venta'}
                        </button>
                    </div>
                </form>
            </div>

            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="venta-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirmar venta libre</h3>
                        <p className="venta-confirm-cliente">
                            Cliente: {clienteSeleccionado?.nombreCliente || 'Venta libre (mostrador)'}
                        </p>
                        <div className="venta-confirm-lista">
                            {productosAgregados.map((p, i) => (
                                <div key={i} className="venta-confirm-item">
                                    <span>{p.nombre} x{p.cantidad}</span>
                                    <span>${Number(p.subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="venta-confirm-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="venta-confirm-total">
                            <span>Recibido</span>
                            <span>${parseFloat(montoRecibido || 0).toFixed(2)}</span>
                        </div>
                        <div className="venta-confirm-total">
                            <span>Cambio</span>
                            <span>${(parseFloat(montoRecibido || 0) - total).toFixed(2)}</span>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-outline" onClick={() => setShowConfirm(false)}>
                                Volver
                            </button>
                            <button type="button" className="btn-primary" onClick={handleConfirmarVenta} disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VentaLibre;
