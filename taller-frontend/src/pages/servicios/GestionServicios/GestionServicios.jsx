import { useEffect, useState } from 'react';
import {
    getServicios,
    crearServicio,
    eliminarServicio,
    actualizarServicio
} from '../../../services/servicioService';
import './GestionServicios.css';

const GestionServicios = () => {

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    const [nuevoServicio, setNuevoServicio] = useState({
        nombreServicio: '',
        descripcionServicio: '',
        areaServicio: '',
        precioServicio: '',
        duracionServicio: '',
        estadoServicio: 'ACTIVO'
    });
    const [servicios, setServicios] = useState([]);

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

            const datosServicio = {
                nombreServicio: nuevoServicio.nombreServicio,
                descripcionServicio: nuevoServicio.descripcionServicio,
                areaServicio: nuevoServicio.areaServicio,
                precioServicio: Number(nuevoServicio.precioServicio),
                duracionServicio: Number(nuevoServicio.duracionServicio),
                estadoServicio: nuevoServicio.estadoServicio
            };

            if (modoEdicion) {

                await actualizarServicio(
                    idEditar,
                    datosServicio
                );

            } else {

                await crearServicio(
                    datosServicio
                );

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
                precioServicio: '',
                duracionServicio: '',
                estadoServicio: 'ACTIVO'
            });

        } catch (error) {

            console.error(error);

            alert('Error al guardar servicio');

        }

    };

    const eliminarServicioHandler = async (id) => {

        const confirmar = window.confirm(
            '¿Eliminar este servicio?'
        );

        if (!confirmar) {
            return;
        }

        try {

            await eliminarServicio(id);

            const response = await getServicios();

            setServicios(response.data);

        } catch (error) {

            console.error(error);

            alert('Error al eliminar');

        }

    };

    const editarServicioHandler = (servicio) => {

        setModoEdicion(true);

        setIdEditar(servicio.idServicio);

        setNuevoServicio({
            nombreServicio: servicio.nombreServicio,
            descripcionServicio: servicio.descripcionServicio,
            areaServicio: servicio.areaServicio,
            precioServicio: servicio.precioServicio,
            duracionServicio: servicio.duracionServicio,
            estadoServicio: servicio.estadoServicio
        });

        setMostrarModal(true);

    };

    const serviciosPorArea = servicios.reduce((acc, servicio) => {

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

                <button
                    className="btn-nuevo"
                    onClick={() => setMostrarModal(true)}
                >
                    + Nuevo Servicio
                </button>

            </div>

            <input
                className="buscador"
                placeholder="Buscar servicios..."
            />

            {Object.entries(serviciosPorArea).map(([area, lista]) => (

                <div key={area}>

                    <h2 className="area-titulo">
                        {area}
                    </h2>

                    <div className="cards-container">

                        {lista.map(servicio => (

                            <div
                                className="servicio-card"
                                key={servicio.idServicio}
                            >

                                <div className="servicio-card-header">

                                    <h3>
                                        {servicio.nombreServicio}
                                    </h3>

                                    <div>

                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '10px'
                                            }}
                                        >
                                            ✏️
                                        </span>

                                        <span
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() =>
                                                eliminarServicioHandler(
                                                    servicio.idServicio
                                                )
                                            }
                                        >
                                            🗑️
                                        </span>

                                    </div>

                                </div>

                                <p className="servicio-descripcion">
                                    {servicio.descripcionServicio}
                                </p>

                                <div className="servicio-info">

                                    <span>
                                        ${servicio.precioServicio}
                                    </span>

                                    <span>
                                        ⏱ {servicio.duracionServicio} min
                                    </span>

                                </div>

                                <div
                                    className={`estado ${servicio.estadoServicio.toLowerCase()}`}
                                >
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

                        <h2>Nuevo Servicio</h2>

                        <input
                            placeholder="Nombre"
                            value={nuevoServicio.nombreServicio}
                            onChange={(e) =>
                                setNuevoServicio({
                                    ...nuevoServicio,
                                    nombreServicio: e.target.value
                                })
                            }
                        />

                        <input
                            placeholder="Área"
                            value={nuevoServicio.areaServicio}
                            onChange={(e) =>
                                setNuevoServicio({
                                    ...nuevoServicio,
                                    areaServicio: e.target.value
                                })
                            }
                        />

                        <textarea
                            placeholder="Descripción"
                            value={nuevoServicio.descripcionServicio}
                            onChange={(e) =>
                                setNuevoServicio({
                                    ...nuevoServicio,
                                    descripcionServicio: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Precio"
                            value={nuevoServicio.precioServicio}
                            onChange={(e) =>
                                setNuevoServicio({
                                    ...nuevoServicio,
                                    precioServicio: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Duración"
                            value={nuevoServicio.duracionServicio}
                            onChange={(e) =>
                                setNuevoServicio({
                                    ...nuevoServicio,
                                    duracionServicio: e.target.value
                                    
                                })
                            }
                        />

                        <div className="modal-buttons">

                            <button
                                onClick={() => setMostrarModal(false)}
                            >
                                Cancelar
                            </button>

                            <button onClick={guardarServicio}>
                                Guardar
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default GestionServicios;