import { useEffect, useState } from 'react';
import {
    getServicios,
    crearServicio,
    eliminarServicio,
    actualizarServicio
} from '../../../services/servicioService';
import './GestionServicios.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GestionServicios = () => {

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [mostrarEliminar, setMostrarEliminar] = useState(false);
    const [servicioEliminar, setServicioEliminar] = useState(null);

    const [nuevoServicio, setNuevoServicio] = useState({
        nombreServicio: '',
        descripcionServicio: '',
        areaServicio: '',
        precioSugerido: '',       
        tipoPrecio: 'FIJO',       
        estadoServicio: 'ACTIVO'
    });
    const [servicios, setServicios] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const cargarServicios = async () => {
            try {
                const response = await getServicios();
                setServicios(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        cargarServicios();
    }, []);

    const guardarServicio = async () => {
        try {
            if (
                !nuevoServicio.nombreServicio ||
                !nuevoServicio.areaServicio ||
                !nuevoServicio.descripcionServicio ||
                !nuevoServicio.tipoPrecio
            ) {
                toast.error('Complete todos los campos');
                return;
            }

            
            if (nuevoServicio.tipoPrecio === 'FIJO') {
                const precio = Number(nuevoServicio.precioSugerido);
                if (!nuevoServicio.precioSugerido || precio <= 0) {
                    toast.error('Los servicios fijos deben tener un precio sugerido mayor a 0');
                    return;
                }
            }

            const datosServicio = {
                nombreServicio: nuevoServicio.nombreServicio,
                descripcionServicio: nuevoServicio.descripcionServicio,
                areaServicio: nuevoServicio.areaServicio,
                precioSugerido: nuevoServicio.tipoPrecio === 'FIJO' 
                    ? Number(nuevoServicio.precioSugerido) 
                    : null,
                tipoPrecio: nuevoServicio.tipoPrecio,
                estadoServicio: nuevoServicio.estadoServicio
            };

            if (modoEdicion) {
                await actualizarServicio(idEditar, datosServicio);
                toast.success('Servicio actualizado correctamente');
            } else {
                await crearServicio(datosServicio);
                toast.success('Servicio guardado correctamente');
            }

            const response = await getServicios();
            setServicios(response.data);
            setMostrarModal(false);
            setModoEdicion(false);
            setIdEditar(null);
            setNuevoServicio({
                nombreServicio: '',
                descripcionServicio: '',
                areaServicio: '',
                precioSugerido: '',
                tipoPrecio: 'FIJO',
                estadoServicio: 'ACTIVO'
            });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data || 'Error al guardar servicio');
        }
    };

    const eliminarServicioHandler = (servicio) => {
        setServicioEliminar(servicio);
        setMostrarEliminar(true);
    };

    const confirmarEliminar = async () => {
        try {
            await eliminarServicio(servicioEliminar.idServicio);
            toast.success('Servicio eliminado correctamente');
            const response = await getServicios();
            setServicios(response.data);
            setMostrarEliminar(false);
            setServicioEliminar(null);
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar servicio');
        }
    };

    const editarServicioHandler = (servicio) => {
        setModoEdicion(true);
        setIdEditar(servicio.idServicio);
        setNuevoServicio({
            nombreServicio: servicio.nombreServicio,
            descripcionServicio: servicio.descripcionServicio || '',
            areaServicio: servicio.areaServicio || '',
            precioSugerido: servicio.precioSugerido || '',
            tipoPrecio: servicio.tipoPrecio || 'FIJO',
            estadoServicio: servicio.estadoServicio || 'ACTIVO'
        });
        setMostrarModal(true);
    };

    const textoBusqueda = busqueda.toLowerCase();

    const serviciosFiltrados = servicios.filter(servicio =>
        servicio.nombreServicio?.toLowerCase().includes(textoBusqueda) ||
        servicio.descripcionServicio?.toLowerCase().includes(textoBusqueda) ||
        servicio.areaServicio?.toLowerCase().includes(textoBusqueda)
    );

    const serviciosPorArea = serviciosFiltrados.reduce((acc, servicio) => {
        if (!acc[servicio.areaServicio]) {
            acc[servicio.areaServicio] = [];
        }
        acc[servicio.areaServicio].push(servicio);
        return acc;
    }, {});

    return (
        <div className="gestion-servicios">
            <div className="servicios-header">
                <div>
                    <h1>Catálogo de Servicios</h1>
                    <p>Administra los servicios que ofrece el taller</p>
                </div>
                <button className="btn-nuevo" onClick={() => setMostrarModal(true)}>
                    + Nuevo Servicio
                </button>
            </div>

            <input
                className="buscador"
                placeholder="Buscar servicios..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            {Object.entries(serviciosPorArea).map(([area, lista]) => (
                <div key={area}>
                    <h2 className="area-titulo">{area}</h2>
                    <div className="cards-container">
                        {lista.map(servicio => (
                            <div className="servicio-card" key={servicio.idServicio}>
                                <div className="servicio-card-header">
                                    <h3>{servicio.nombreServicio}</h3>
                                    <div className="acciones-servicio">
                                        <FaEdit
                                            className="icono-editar"
                                            onClick={() => editarServicioHandler(servicio)}
                                        />
                                        <FaTrash
                                            className="icono-eliminar"
                                            onClick={() => eliminarServicioHandler(servicio)}
                                        />
                                    </div>
                                </div>
                                <p className="servicio-descripcion">{servicio.descripcionServicio}</p>
                                <div className="servicio-info">
                                    
                                    {servicio.tipoPrecio === 'FIJO' ? (
                                        <span className="precio-fijo">${servicio.precioSugerido?.toFixed(2)}</span>
                                    ) : (
                                        <span className="precio-variable">Variable</span>
                                    )}
                                    
                                    <span className={`tipo-precio-badge ${servicio.tipoPrecio?.toLowerCase()}`}>
                                        {servicio.tipoPrecio || 'FIJO'}
                                    </span>
                                </div>
                                <div className={`estado ${servicio.estadoServicio?.toLowerCase() || ""}`}>
                                    {servicio.estadoServicio}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-servicio">
                        <h2>{modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                        <input
                            placeholder="Nombre"
                            value={nuevoServicio.nombreServicio}
                            onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombreServicio: e.target.value })}
                        />
                        <input
                            placeholder="Área"
                            value={nuevoServicio.areaServicio}
                            onChange={(e) => setNuevoServicio({ ...nuevoServicio, areaServicio: e.target.value })}
                        />
                        <textarea
                            placeholder="Descripción"
                            value={nuevoServicio.descripcionServicio}
                            onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcionServicio: e.target.value })}
                        />

                  
                        <select
                            value={nuevoServicio.tipoPrecio}
                            onChange={(e) => {
                                setNuevoServicio({ 
                                    ...nuevoServicio, 
                                    tipoPrecio: e.target.value,
                                    precioSugerido: e.target.value === 'VARIABLE' ? '' : nuevoServicio.precioSugerido
                                });
                            }}
                        >
                            <option value="FIJO">Fijo</option>
                            <option value="VARIABLE">Variable</option>
                        </select>

                      
                        {nuevoServicio.tipoPrecio === 'FIJO' ? (
                            <input
                                type="number"
                                placeholder="Precio sugerido ($)"
                                value={nuevoServicio.precioSugerido}
                                onChange={(e) => setNuevoServicio({ ...nuevoServicio, precioSugerido: e.target.value })}
                                step="0.01"
                                min="0.01"
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="Precio variable (se define al finalizar)"
                                value="Se define al finalizar"
                                disabled
                                style={{ color: '#ff8c42' }}
                            />
                        )}

                        

                        <select
                            value={nuevoServicio.estadoServicio}
                            onChange={(e) => setNuevoServicio({ ...nuevoServicio, estadoServicio: e.target.value })}
                        >
                            <option value="ACTIVO">ACTIVO</option>
                            <option value="INACTIVO">INACTIVO</option>
                        </select>
                        <div className="modal-buttons">
                            <button onClick={() => {
                                setMostrarModal(false);
                                setModoEdicion(false);
                                setIdEditar(null);
                                setNuevoServicio({
                                    nombreServicio: '',
                                    descripcionServicio: '',
                                    areaServicio: '',
                                    precioSugerido: '',
                                    tipoPrecio: 'FIJO',
                                    estadoServicio: 'ACTIVO'
                                });
                            }}>
                                Cancelar
                            </button>
                            <button onClick={guardarServicio}>
                                {modoEdicion ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarEliminar && (
                <div className="modal-overlay">
                    <div className="modal-servicio">
                        <h2>Eliminar servicio</h2>
                        <p>
                            ¿Desea eliminar el servicio
                            <strong> {servicioEliminar?.nombreServicio}</strong>?
                        </p>
                        <div className="modal-buttons">
                            <button onClick={() => {
                                setMostrarEliminar(false);
                                setServicioEliminar(null);
                            }}>
                                Cancelar
                            </button>
                            <button onClick={confirmarEliminar}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={2500} theme="dark" />
        </div>
    );
};

export default GestionServicios;