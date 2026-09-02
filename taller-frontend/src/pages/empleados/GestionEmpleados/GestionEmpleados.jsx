import { useEffect, useState } from 'react';
import {
    getEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    cambiarEstadoEmpleado
} from '../../../services/empleadoService';
import { getServicios } from '../../../services/servicioService';
import './GestionEmpleados.css';
import { FaEdit, FaBan, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMPLEADO_VACIO = {
    nombreEmpleado: '',
    username: '',
    password: '',
    rolEmpleado: 'EMPLEADO',
    servicioIds: []
};

const GestionEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [nuevoEmpleado, setNuevoEmpleado] = useState(EMPLEADO_VACIO);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const [mostrarConfirmEstado, setMostrarConfirmEstado] = useState(false);
    const [empleadoEstado, setEmpleadoEstado] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resEmpleados, resServicios] = await Promise.all([
                getEmpleados(),
                getServicios()
            ]);
            setEmpleados(resEmpleados.data);
            setServicios(resServicios.data);
        } catch (error) {
            console.error(error);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setModoEdicion(false);
        setIdEditar(null);
        setNuevoEmpleado(EMPLEADO_VACIO);
        setMostrarPassword(false);
    };

    const toggleServicio = (idServicio) => {
        setNuevoEmpleado(prev => {
            const yaSeleccionado = prev.servicioIds.includes(idServicio);
            return {
                ...prev,
                servicioIds: yaSeleccionado
                    ? prev.servicioIds.filter(id => id !== idServicio)
                    : [...prev.servicioIds, idServicio]
            };
        });
    };

    const guardarEmpleado = async () => {
        try {
            if (!nuevoEmpleado.nombreEmpleado || !nuevoEmpleado.username || !nuevoEmpleado.rolEmpleado) {
                toast.error('Complete todos los campos obligatorios');
                return;
            }
            if (!modoEdicion && !nuevoEmpleado.password) {
                toast.error('La contraseña es obligatoria para un nuevo empleado');
                return;
            }

            const datosEmpleado = {
                nombreEmpleado: nuevoEmpleado.nombreEmpleado,
                username: nuevoEmpleado.username,
                password: nuevoEmpleado.password || null,
                rolEmpleado: nuevoEmpleado.rolEmpleado,
                servicioIds: nuevoEmpleado.servicioIds
            };

            if (modoEdicion) {
                await actualizarEmpleado(idEditar, datosEmpleado);
                toast.success('Empleado actualizado correctamente');
            } else {
                await crearEmpleado(datosEmpleado);
                toast.success('Empleado creado correctamente');
            }

            await cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.mensaje || 'Error al guardar empleado');
        }
    };

    const editarEmpleadoHandler = (empleado) => {
        setModoEdicion(true);
        setIdEditar(empleado.idEmpleado);
        setNuevoEmpleado({
            nombreEmpleado: empleado.nombreEmpleado,
            username: empleado.username,
            password: '',
            rolEmpleado: empleado.rolEmpleado,
            servicioIds: empleado.servicios?.map(s => s.idServicio) || []
        });
        setMostrarModal(true);
    };

    const cambiarEstadoHandler = (empleado) => {
        setEmpleadoEstado(empleado);
        setMostrarConfirmEstado(true);
    };

    const confirmarCambioEstado = async () => {
        try {
            const nuevoEstado = !empleadoEstado.activo;
            await cambiarEstadoEmpleado(empleadoEstado.idEmpleado, nuevoEstado);
            toast.success(nuevoEstado ? 'Empleado habilitado' : 'Empleado inhabilitado');
            await cargarDatos();
            setMostrarConfirmEstado(false);
            setEmpleadoEstado(null);
        } catch (error) {
            console.error(error);
            toast.error('Error al cambiar el estado del empleado');
        }
    };

    const empleadosFiltrados = empleados.filter(e =>
        e.nombreEmpleado.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.username.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="gestion-empleados">
            <div className="empleados-header">
                <div>
                    <h1>Gestión de Empleados</h1>
                    <p>Administra los usuarios que tienen acceso al sistema</p>
                </div>
                <button className="btn-nuevo" onClick={() => setMostrarModal(true)}>
                    + Nuevo Empleado
                </button>
            </div>

            <input
                className="buscador"
                placeholder="Buscar por nombre o usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="cards-container">
                {empleadosFiltrados.map(empleado => (
                    <div className="empleado-card" key={empleado.idEmpleado}>
                        <div className="empleado-card-header">
                            <h3>{empleado.nombreEmpleado}</h3>
                            <div className="acciones-empleado">
                                <FaEdit
                                    className="icono-editar"
                                    onClick={() => editarEmpleadoHandler(empleado)}
                                />
                                {empleado.activo ? (
                                    <FaBan
                                        className="icono-inhabilitar"
                                        title="Inhabilitar"
                                        onClick={() => cambiarEstadoHandler(empleado)}
                                    />
                                ) : (
                                    <FaCheckCircle
                                        className="icono-habilitar"
                                        title="Habilitar"
                                        onClick={() => cambiarEstadoHandler(empleado)}
                                    />
                                )}
                            </div>
                        </div>
                        <p className="empleado-username">@{empleado.username}</p>
                        <div className="empleado-badges">
                            <span className="rol-badge">{empleado.rolEmpleado}</span>
                            <span className={`estado ${empleado.activo ? 'activo' : 'inactivo'}`}>
                                {empleado.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <div className="empleado-servicios">
                            {empleado.servicios?.length > 0
                                ? empleado.servicios.map(s => (
                                    <span className="servicio-tag" key={s.idServicio}>{s.nombreServicio}</span>
                                ))
                                : <span className="sin-servicios">Sin servicios asignados</span>}
                        </div>
                    </div>
                ))}
                {empleadosFiltrados.length === 0 && (
                    <p className="sin-datos">No se encontraron empleados</p>
                )}
            </div>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-empleado">
                        <h2>{modoEdicion ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                        <div className="form-field">
                            <label>Nombre completo</label>
                            <input
                                placeholder="Nombre completo"
                                value={nuevoEmpleado.nombreEmpleado}
                                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombreEmpleado: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label>Usuario</label>
                            <input
                                placeholder="Usuario"
                                value={nuevoEmpleado.username}
                                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, username: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label>Contraseña</label>
                            <div className="password-field">
                                <input
                                    type={modoEdicion || mostrarPassword ? 'text' : 'password'}
                                    placeholder={modoEdicion ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                                    value={nuevoEmpleado.password}
                                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, password: e.target.value })}
                                />
                                {!modoEdicion && (
                                    <span
                                        className="toggle-password"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                    >
                                        {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Rol</label>
                            <select
                                value={nuevoEmpleado.rolEmpleado}
                                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, rolEmpleado: e.target.value })}
                            >
                                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                                <option value="EMPLEADO">EMPLEADO</option>
                            </select>
                        </div>

                        <div className="servicios-select">
                            <label>Servicios en los que trabajará</label>
                            <div className="servicios-checklist">
                                {servicios.map(s => (
                                    <label className="servicio-check" key={s.idServicio}>
                                        <input
                                            type="checkbox"
                                            checked={nuevoEmpleado.servicioIds.includes(s.idServicio)}
                                            onChange={() => toggleServicio(s.idServicio)}
                                        />
                                        {s.nombreServicio}
                                    </label>
                                ))}
                                {servicios.length === 0 && (
                                    <span className="sin-servicios">No hay servicios cargados todavía</span>
                                )}
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button onClick={cerrarModal}>Cancelar</button>
                            <button onClick={guardarEmpleado}>
                                {modoEdicion ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarConfirmEstado && (
                <div className="modal-overlay">
                    <div className="modal-empleado">
                        <h2>{empleadoEstado?.activo ? 'Inhabilitar empleado' : 'Habilitar empleado'}</h2>
                        <p>
                            ¿Desea {empleadoEstado?.activo ? 'inhabilitar' : 'habilitar'} a
                            <strong> {empleadoEstado?.nombreEmpleado}</strong>?
                            {empleadoEstado?.activo && ' No podrá iniciar sesión mientras esté inhabilitado.'}
                        </p>
                        <div className="modal-buttons">
                            <button onClick={() => {
                                setMostrarConfirmEstado(false);
                                setEmpleadoEstado(null);
                            }}>
                                Cancelar
                            </button>
                            <button onClick={confirmarCambioEstado}>
                                {empleadoEstado?.activo ? 'Inhabilitar' : 'Habilitar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={2500} theme="dark" />
        </div>
    );
};

export default GestionEmpleados;
