import { useEffect, useState } from 'react';
import {
    getProductos,
    crearProducto,
    eliminarProducto,
    actualizarProducto
} from '../../../services/inventarioService';

import './GestionInventario.css';

import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GestionInventario = () => {

    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    const [mostrarEliminar, setMostrarEliminar] = useState(false);
    const [productoEliminar, setProductoEliminar] = useState(null);

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        unidadMedida: '',
        precio: '',
        stockActual: '',
        stockMinimo: '',
        estado: 'ACTIVO'
    });

    // =========================
    // CARGAR PRODUCTOS
    // =========================

    useEffect(() => {

        const cargarProductos = async () => {

            try {

                const response = await getProductos();

                setProductos(response.data);

            } catch (error) {

                console.error(error);

                toast.error('Error al cargar productos');

            }

        };

        cargarProductos();

    }, []);

    // =========================
    // GUARDAR / ACTUALIZAR
    // =========================

    const guardarProducto = async () => {

        try {

            if (
                !nuevoProducto.nombre ||
                !nuevoProducto.precio ||
                nuevoProducto.stockActual === '' ||
                nuevoProducto.stockMinimo === ''
            ) {

                toast.error('Complete los campos obligatorios');

                return;
            }

            const datosProducto = {

                nombre: nuevoProducto.nombre,

                descripcion: nuevoProducto.descripcion,

                unidadMedida: nuevoProducto.unidadMedida,

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

    // =========================
    // EDITAR
    // =========================

    const editarProductoHandler = (producto) => {

        setModoEdicion(true);

        setIdEditar(producto.idProducto);

        setNuevoProducto({

            nombre: producto.nombre,

            descripcion: producto.descripcion,

            unidadMedida: producto.unidadMedida,

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
                'Error al eliminar producto'
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
                                Precio: ${producto.precio}
                            </span>

                            <span>
                                Stock: {producto.stockActual}
                            </span>

                            <span>
                                Mínimo: {producto.stockMinimo}
                            </span>

                        </div>

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
                        />

                        <input
                            placeholder="Unidad de medida"
                            value={nuevoProducto.unidadMedida}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    unidadMedida: e.target.value
                                })
                            }
                        />

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

                        <input
                            type="number"
                            placeholder="Precio"
                            value={nuevoProducto.precio}
                            onChange={(e) =>
                                setNuevoProducto({
                                    ...nuevoProducto,
                                    precio: e.target.value
                                })
                            }
                        />

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
                                onClick={confirmarEliminar}
                            >
                                Eliminar
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