import { useEffect, useState } from 'react';
import {
    getProductos,
    crearProducto,
    eliminarProducto,
    actualizarProducto,
    registrarMovimiento,
    getMovimientos
} from '../../../services/inventarioService';
//import { useAuth } from '../../../context/AuthContext';

import { getEmpleados } from '../../../services/empleadoService';

import './GestionInventario.css';

import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GestionInventario = () => {

    // const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [empleadoActual, setEmpleadoActual] = useState(null);
    const [mostrarMovimiento, setMostrarMovimiento] = useState(false);
    const [productoMovimiento, setProductoMovimiento] = useState(null);
    const [movimiento, setMovimiento] = useState({
        tipoMovimiento: 'COMPRA',
        cantidad: '',
        motivo: ''
    });
    const [busqueda, setBusqueda] = useState('');
    const [movimientos, setMovimientos] = useState([]);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    const [mostrarEliminar, setMostrarEliminar] = useState(false);
    const [productoEliminar, setProductoEliminar] = useState(null);

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        marca: '',
        cantidadUnidad: '',
        unidadMedida: '',
        precio: '',
        stockActual: '',
        stockMinimo: '',
        estado: 'ACTIVO'
    });

    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const [paginaActual, setPaginaActual] = useState(1);
    const movimientosPorPagina = 10;

    useEffect(() => {
        setPaginaActual(1);
    }, [fechaDesde, fechaHasta]);

    // =========================
    // CARGAR PRODUCTOS
    // =========================

    /* use effect anterior
    useEffect(() => {

        const cargarDatos = async () => {

            try {

                const responseProductos = await getProductos();
                setProductos(responseProductos.data);

                const responseEmpleados = await getEmpleados();

                const empleado = responseEmpleados.data.find(
                    (empleado) => empleado.username === user?.username
                );

                setEmpleadoActual(empleado);

            } catch (error) {

                console.error(error);

                toast.error('Error al cargar los datos');

            }

        };

        cargarDatos();

    }, [user]);

    */
   // useEffect(() nuevo
    useEffect(() => {

        const cargarDatos = async () => {

            try {

                const responseProductos = await getProductos();

                setProductos(responseProductos.data);

                const responseMovimientos = await getMovimientos();

                setMovimientos(responseMovimientos.data);

                const responseEmpleados = await getEmpleados();

                const username = localStorage.getItem('username');

                const empleado = responseEmpleados.data.find(
                    empleado => empleado.username === username
                );

                setEmpleadoActual(empleado || null);

            } catch (error) {

                console.error(error);

                toast.error('Error al cargar los datos');

            }

        };

        cargarDatos();

    }, []);

    // =========================
    // GUARDAR / ACTUALIZAR
    // =========================

    const guardarProducto = async () => {

        try {

            if (
                !nuevoProducto.nombre ||
                !nuevoProducto.cantidadUnidad ||
                !nuevoProducto.unidadMedida ||
                !nuevoProducto.precio ||
                (!modoEdicion && nuevoProducto.stockActual === '') ||
                nuevoProducto.stockMinimo === ''
            )
            
            {

                toast.error('Complete los campos obligatorios');

                return;
            }

            const datosProducto = {
                nombre: nuevoProducto.nombre,
                descripcion: nuevoProducto.descripcion,
                categoria: nuevoProducto.categoria,
                marca: nuevoProducto.marca,
                unidadMedida: `${nuevoProducto.cantidadUnidad} ${nuevoProducto.unidadMedida}`.trim(),
                precio: Number(nuevoProducto.precio),
                stockActual: Number(nuevoProducto.stockActual),
                stockMinimo: Number(nuevoProducto.stockMinimo),
                estado: nuevoProducto.estado
            };

            if (modoEdicion) {

                await actualizarProducto(
                    idEditar,
                    datosProducto
                );

                toast.success(
                    'Producto actualizado correctamente'
                );

            } else {

                await crearProducto(
                    datosProducto
                );

                toast.success(
                    'Producto creado correctamente'
                );

            }

            const response = await getProductos();

            setProductos(response.data);

            cerrarModal();

        } catch (error) {

            console.error(error);

            toast.error(
                'Error al guardar producto'
            );

        }

    };

    const registrarMovimientoHandler = async (e) => {

        e.preventDefault();

        if (!empleadoActual) {
            toast.error('No se pudo identificar al empleado');
            return;
        }

        if (!movimiento.cantidad) {
            toast.error('Ingrese una cantidad');
            return;
        }

        if (!Number.isInteger(Number(movimiento.cantidad))) {
            toast.error('La cantidad debe ser un número entero');
            return;
        }

        if (Number(movimiento.cantidad) <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (!nuevoProducto.categoria) {
            toast.error('Seleccione una categoría');
            return;
        }

        if (!nuevoProducto.marca.trim()) {
            toast.error('Ingrese la marca del producto');
            return;
        }

        if (!nuevoProducto.cantidadUnidad || Number(nuevoProducto.cantidadUnidad) <= 0) {
            toast.error('Ingrese un contenido válido');
            return;
        }

        if (!nuevoProducto.unidadMedida) {
            toast.error('Seleccione una unidad de medida');
            return;
        }

        try {

            await registrarMovimiento({

                producto: {
                    idProducto: productoMovimiento.idProducto
                },

                empleado: {
                    idEmpleado: empleadoActual.idEmpleado
                },

                tipoMovimiento: movimiento.tipoMovimiento,

                cantidad: Number(movimiento.cantidad),

                fechaMovimiento: new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000
                ).toISOString().slice(0, 19),

                motivo: movimiento.motivo

            });

            toast.success('Movimiento registrado correctamente');

            const responseProductos = await getProductos();
            setProductos(responseProductos.data);

            const responseMovimientos = await getMovimientos();
            setMovimientos(responseMovimientos.data);

            setMostrarMovimiento(false);
            setProductoMovimiento(null);

            setMovimiento({
                tipoMovimiento: 'COMPRA',
                cantidad: '',
                motivo: ''
            });

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.mensaje ||
                error.response?.data?.message ||
                'Error al registrar el movimiento'
            );

        }
    };

    // =========================
    // EDITAR
    // =========================

    const editarProductoHandler = (producto) => {

        setModoEdicion(true);

        setIdEditar(producto.idProducto);

        const partesUnidad = (producto.unidadMedida || '').split(' ');

        setNuevoProducto({

            nombre: producto.nombre,

            descripcion: producto.descripcion,

            cantidadUnidad: partesUnidad[0] || '',

            unidadMedida: partesUnidad.slice(1).join(' ') || '',

            precio: producto.precio,

            stockActual: producto.stockActual,

            stockMinimo: producto.stockMinimo,

            estado: producto.estado

        });

        setMostrarModal(true);

    };

    // =========================
    // ELIMINAR
    // =========================

    const eliminarProductoHandler = (producto) => {

        setProductoEliminar(producto);

        setMostrarEliminar(true);

    };

    const confirmarEliminar = async () => {

        try {

            await eliminarProducto(
                productoEliminar.idProducto
            );

            toast.success(
                'Producto eliminado correctamente'
            );

            const response = await getProductos();

            setProductos(response.data);

            setMostrarEliminar(false);

            setProductoEliminar(null);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.mensaje
            );

        }

    };

    // =========================
    // MODAL
    // =========================

    const cerrarModal = () => {

        setMostrarModal(false);

        setModoEdicion(false);

        setIdEditar(null);

        setNuevoProducto({
            nombre: '',
            descripcion: '',
            categoria: '',
            marca: '',
            cantidadUnidad: '',
            unidadMedida: '',
            precio: '',
            stockActual: '',
            stockMinimo: '',
            estado: 'ACTIVO'
        });

    };

    // =========================
    // BUSCADOR
    // =========================

    const productosFiltrados = productos.filter(producto =>

        producto.nombre
            .toLowerCase()
            .includes(busqueda.toLowerCase())

        ||

        (producto.descripcion || '')
            .toLowerCase()
            .includes(busqueda.toLowerCase())

        ||

        (producto.unidadMedida || '')
            .toLowerCase()
            .includes(busqueda.toLowerCase())

    );

    // Nombres y marcas ya usados en productos existentes, para sugerirlos
    // como autocompletado al escribir en el formulario de nuevo producto.
    const nombresUnicos = [...new Set(productos.map(p => p.nombre).filter(Boolean))];
    const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))];

    const movimientosFiltrados = movimientos.filter(movimiento => {

        const fecha = new Date(movimiento.fechaMovimiento);

        if (fechaDesde && fecha < new Date(`${fechaDesde}T00:00:00`)) {
            return false;
        }

        if (fechaHasta && fecha > new Date(`${fechaHasta}T23:59:59`)) {
            return false;
        }

        return true;
    });

    const totalPaginas = Math.ceil(
        movimientosFiltrados.length / movimientosPorPagina
    );

    const indiceInicial =
        (paginaActual - 1) * movimientosPorPagina;

    const movimientosPaginados =
        movimientosFiltrados.slice(
            indiceInicial,
            indiceInicial + movimientosPorPagina
        );

    // =========================
    // RENDER
    // =========================

    return (

        <div className="gestion-inventario">

            <div className="inventario-header">

                <div>

                    <h1>Inventario</h1>

                    <p>
                        Administra los productos y existencias del taller
                    </p>

                </div>

                <button
                    className="btn-nuevo"
                    onClick={() => setMostrarModal(true)}
                >
                    + Nuevo Producto
                </button>

            </div>

            <input
                className="buscador"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) =>
                    setBusqueda(e.target.value)
                }
            />

            <div className="productos-container">

                {productosFiltrados.map(producto => (

                    <div
                        className="producto-card"
                        key={producto.idProducto}
                    >

                        <div className="producto-card-header">

                            <div>

                                <h3>
                                    {producto.nombre}
                                </h3>

                                <span>
                                    {producto.unidadMedida}
                                </span>

                            </div>

                            <div className="acciones-producto">

                                <button
                                    className="btn-movimiento"
                                    disabled={producto.estado === 'INACTIVO'}
                                    onClick={() => {
                                        setProductoMovimiento(producto);
                                        setMostrarMovimiento(true);
                                    }}
                                >
                                    {producto.estado === 'INACTIVO' ? 'Inactivo' : 'Movimiento'}
                                </button>

                                <FaEdit
                                    className="icono-editar"
                                    onClick={() =>
                                        editarProductoHandler(producto)
                                    }
                                />

                                <FaTrash
                                    className="icono-eliminar"
                                    onClick={() =>
                                        eliminarProductoHandler(producto)
                                    }
                                />

                            </div>

                        </div>

                        <p className="producto-descripcion">

                            {producto.descripcion}

                        </p>

                        <div className="producto-info">

                            <span>
                                Categoría: {producto.categoria || 'Sin categoría'}
                            </span>

                            <span>
                                Marca: {producto.marca || 'Sin marca'}
                            </span>

                            <span>
                                Precio: ${producto.precio}
                            </span>

                            <span
                                className={
                                    producto.stockActual <= producto.stockMinimo
                                        ? 'stock-bajo'
                                        : ''
                                }
                            >
                                Stock: {producto.stockActual}
                            </span>

                            <span>
                                Mínimo: {producto.stockMinimo}
                            </span>

                        </div>

                        {producto.stockActual <= producto.stockMinimo && (

                            <div className="alerta-stock">
                                ⚠ Stock bajo: se alcanzó el stock mínimo
                            </div>

                        )}

                        <div
                            className={`estado ${producto.estado.toLowerCase()
                                }`}
                        >
                            {producto.estado}
                        </div>

                    </div>

                ))}

            </div>

            {/* =========================
                HISTORIAL DE MOVIMIENTOS
            ========================= */}

            <div className="historial-container">

                <h2>Historial de Movimientos</h2>

                <div className="filtros-fecha">

                    <div>
                        <label>Desde</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Hasta</label>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </div>

                    {(fechaDesde || fechaHasta) && (
                        <button
                            onClick={() => {
                                setFechaDesde('');
                                setFechaHasta('');
                            }}
                        >
                            Limpiar
                        </button>
                    )}

                </div>

                {movimientos.length === 0 ? (

                    <p>No hay movimientos registrados.</p>

                ) : (

                    <div className="tabla-movimientos">

                        <div className="movimiento-fila movimiento-encabezado">

                            <div>Producto</div>
                            <div>Tipo</div>
                            <div>Cantidad</div>
                            <div>Empleado</div>
                            <div>Fecha</div>
                            <div>Motivo</div>

                        </div>

                            {movimientosPaginados.map((movimiento) => (

                            <div
                                className="movimiento-fila"
                                key={movimiento.idMovimiento}
                            >

                                <div className="producto-movimiento">
                                    {movimiento.producto}
                                </div>

                                <div
                                    className={`tipo-movimiento ${movimiento.tipoMovimiento.toLowerCase()}`}
                                >
                                    {movimiento.tipoMovimiento}
                                </div>

                                <div>
                                    {movimiento.cantidad}
                                </div>

                                <div>
                                    {movimiento.empleado}
                                </div>

                                <div>
                                    {new Date(
                                        movimiento.fechaMovimiento
                                    ).toLocaleString('es-SV', {
                                        timeZone: 'America/El_Salvador'
                                    })}
                                </div>

                                <div>
                                    {movimiento.motivo || 'Sin motivo'}
                                </div>

                            </div>

                        ))}
                            {totalPaginas > 1 && (
                                <div className="paginacion-movimientos">

                                    <button
                                        disabled={paginaActual === 1}
                                        onClick={() => setPaginaActual(paginaActual - 1)}
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {paginaActual} de {totalPaginas}
                                    </span>

                                    <button
                                        disabled={paginaActual === totalPaginas}
                                        onClick={() => setPaginaActual(paginaActual + 1)}
                                    >
                                        Siguiente
                                    </button>

                                </div>
                            )}
                    </div>

                )}

            </div>
            {/* =========================
                MODAL PRODUCTO
            ========================= */}

            {mostrarModal && (

                <div className="modal-overlay">

                    <div className="modal-producto">

                        <h2>

                            {modoEdicion
                                ? 'Editar Producto'
                                : 'Nuevo Producto'}

                        </h2>

                        <input
                            placeholder="Nombre"
                            value={nuevoProducto.nombre}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    nombre: e.target.value
                                })
                            }
                            list="nombres-productos"
                            autoComplete="off"
                        />
                        <datalist id="nombres-productos">
                            {nombresUnicos.map((nombre) => (
                                <option key={nombre} value={nombre} />
                            ))}
                        </datalist>

                        <select
                            value={nuevoProducto.categoria}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    categoria: e.target.value
                                })
                            }
                        >
                            <option value="">Seleccionar categoría</option>
                            <option value="Aceites">Aceites</option>
                            <option value="Filtros">Filtros</option>
                            <option value="Químicos">Químicos</option>
                            <option value="Carwash">Carwash</option>
                            <option value="Repuestos">Repuestos</option>
                            <option value="Accesorios">Accesorios</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Marca"
                            value={nuevoProducto.marca}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    marca: e.target.value
                                })
                            }
                            list="marcas-productos"
                            autoComplete="off"
                        />
                        <datalist id="marcas-productos">
                            {marcasUnicas.map((marca) => (
                                <option key={marca} value={marca} />
                            ))}
                        </datalist>

                        <div className="unidad-medida">

                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Contenido"
                                value={nuevoProducto.cantidadUnidad}
                                onChange={(e) =>
                                    setNuevoProducto({
                                        ...nuevoProducto,
                                        cantidadUnidad: e.target.value
                                    })
                                }
                            />

                            <select
                                value={nuevoProducto.unidadMedida}
                                onChange={(e) =>
                                    setNuevoProducto({
                                        ...nuevoProducto,
                                        unidadMedida: e.target.value
                                    })
                                }
                            >
                                <option value="">Unidad</option>
                                <option value="mL">mL</option>
                                <option value="L">L</option>
                                <option value="Gal">Gal</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="oz">oz</option>
                                <option value="lb">lb</option>
                                <option value="Unidad">Unidad</option>
                            </select>

                        </div>

                        <textarea
                            placeholder="Descripción"
                            value={nuevoProducto.descripcion}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    descripcion: e.target.value
                                })
                            }
                        />

                        <div className="campos-stock">

                            <div className="campo-precio">
                                <span>$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Precio"
                                    value={nuevoProducto.precio}
                                    onChange={(e) =>
                                        setNuevoProducto({
                                            ...nuevoProducto,
                                            precio: e.target.value
                                        })
                                    }
                                />
                            </div>

                            {!modoEdicion && (
                                <input
                                    type="number"
                                    placeholder="Stock actual"
                                    value={nuevoProducto.stockActual}
                                    onChange={(e) =>
                                        setNuevoProducto({
                                            ...nuevoProducto,
                                            stockActual: e.target.value
                                        })
                                    }
                                />
                            )}

                            <input
                                type="number"
                                placeholder="Stock mínimo"
                                value={nuevoProducto.stockMinimo}
                                onChange={(e) =>
                                    setNuevoProducto({
                                        ...nuevoProducto,
                                        stockMinimo: e.target.value
                                    })
                                }
                            />

                        </div>

                        <select
                            value={nuevoProducto.estado}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    estado: e.target.value
                                })
                            }
                        >

                            <option value="ACTIVO">
                                ACTIVO
                            </option>

                            <option value="INACTIVO">
                                INACTIVO
                            </option>

                        </select>

                        <div className="modal-buttons">

                            <button
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={guardarProducto}
                            >
                                {modoEdicion
                                    ? 'Actualizar'
                                    : 'Guardar'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =========================
                MODAL ELIMINAR
            ========================= */}

            {mostrarEliminar && (

                <div className="modal-overlay">

                    <div className="modal-producto">

                        <h2>
                            Eliminar producto
                        </h2>

                        <p>

                            ¿Desea eliminar el producto

                            <strong>
                                {' '}
                                {productoEliminar?.nombre}
                            </strong>

                            ?

                        </p>

                        <div className="modal-buttons">

                            <button
                                onClick={() => {

                                    setMostrarEliminar(false);

                                    setProductoEliminar(null);

                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-eliminar-modal"
                                onClick={confirmarEliminar}
                            >
                                Eliminar
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =========================
                 MODAL MOVIMIENTO
                ========================= */}

            {mostrarMovimiento && productoMovimiento && (

                <div className="modal-overlay">

                    <div className="modal-producto">

                        <h2>Registrar Movimiento</h2>

                        <div className="info-movimiento">
                            <p>
                                Producto: <strong>{productoMovimiento.nombre}</strong>
                            </p>

                            <p>
                                Stock actual: <strong>{productoMovimiento.stockActual}</strong>
                            </p>
                        </div>

                        <select
                            value={movimiento.tipoMovimiento}
                            onChange={(e) =>
                                setMovimiento({
                                    ...movimiento,
                                    tipoMovimiento: e.target.value
                                })
                            }
                        >

                            <option value="COMPRA">
                                COMPRA — Entrada
                            </option>

                            <option value="USO">
                                USO — Salida
                            </option>

                            <option value="VENTA">
                                VENTA — Salida
                            </option>

                        </select>

                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Cantidad"
                            value={movimiento.cantidad}
                            onChange={(e) =>
                                setMovimiento({
                                    ...movimiento,
                                    cantidad: e.target.value
                                })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Motivo"
                            value={movimiento.motivo}
                            onChange={(e) =>
                                setMovimiento({
                                    ...movimiento,
                                    motivo: e.target.value
                                })
                            }
                        />

                        <div className="modal-buttons">

                            <button
                                onClick={() => {
                                    setMostrarMovimiento(false);
                                    setProductoMovimiento(null);
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={registrarMovimientoHandler}
                            >
                                Registrar
                            </button>

                        </div>

                    </div>

                </div>

            )}

            <ToastContainer
                position="bottom-right"
                autoClose={2500}
                theme="dark"
            />

        </div>

    );

};

export default GestionInventario;