import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrdenes, getMisServicios } from '../../services/ordenService';
import TablaOrdenesAdmin from './components/TablaOrdenesAdmin';
import TablaServiciosEmpleado from './components/TablaServiciosEmpleado';
import ModalNuevaOrden from './components/ModalNuevaOrden';
import './OrdenesTrabajo.css';

/**
 * Página principal del módulo de órdenes de trabajo.
 * Cambia su vista según el rol del usuario autenticado:
 * - Admin: Ve todas las órdenes, puede crear, asignar y cobrar
 * - Empleado: Ve solo sus servicios asignados, puede actualizar estados
 */
const OrdenesTrabajo = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModalNueva, setShowModalNueva] = useState(false);
    const [filtros, setFiltros] = useState({
        estado: '',
        fecha: '',
        busqueda: ''
    });

    const esAdmin = user?.rol === 'ADMINISTRADOR';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            if (esAdmin) {
                const response = await getOrdenes();
                setOrdenes(response.data);
            } else {
                const response = await getMisServicios();
                setOrdenes(response.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <div className="ordenes-container">
            {/* Encabezado */}
            <div className="page-header">
                <div>
                    <h1>{esAdmin ? 'Órdenes de Trabajo' : 'Mis Servicios Asignados'}</h1>
                    <p>
                        {esAdmin 
                            ? 'Creación, asignación y seguimiento de estados — Módulo 4'
                            : 'Servicios que tienes asignados para realizar'
                        }
                    </p>
                </div>
                {esAdmin && (
                    <button 
                        className="btn-nuevo-orden"
                        onClick={() => setShowModalNueva(true)}
                    >
                        + Nueva Orden
                    </button>
                )}
            </div>

            {/* Tabs de navegación (solo para Admin) */}
            {esAdmin && (
                <div className="ordenes-tabs">
                    <button className="tab active">Todas las órdenes</button>
                    <button className="tab">Pendientes</button>
                    <button className="tab">En proceso</button>
                    <button className="tab">Finalizados</button>
                    <button className="tab">Entregados</button>
                </div>
            )}

            {/* Contenido según rol */}
            {esAdmin ? (
                <TablaOrdenesAdmin 
                    ordenes={ordenes}
                    onActualizar={cargarDatos}
                    filtros={filtros}
                    setFiltros={setFiltros}
                />
            ) : (
                <TablaServiciosEmpleado 
                    servicios={ordenes}
                    onActualizar={cargarDatos}
                />
            )}

            {/* Modal Nueva Orden (solo Admin) */}
            {showModalNueva && (
                <ModalNuevaOrden
                    onClose={() => setShowModalNueva(false)}
                    onSuccess={cargarDatos}
                />
            )}
        </div>
    );
};

export default OrdenesTrabajo;