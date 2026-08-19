import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrdenes, getMisServicios } from '../../services/ordenService'
import TablaOrdenesAdmin from './components/ModalNuevaOrden/TablaOrdenesAdmin';
import TablaServiciosEmpleado from './components/TablaServiciosEmpleado';
import ModalNuevaOrden from './components/ModalNuevaOrden/ModalNuevaOrden';
import './OrdenesTrabajo.css';

const OrdenesTrabajo = () => {
    // Obtener usuario autenticado del contexto
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModalNueva, setShowModalNueva] = useState(false);
    const [filtros, setFiltros] = useState({
        estado: '',
        fecha: '',
        busqueda: ''
    });

    // Determinar si el usuario es administrador
    const esAdmin = user?.rol === 'ADMINISTRADOR';

    // FUNCIÓN PARA CARGAR DATOS - DEFINIDA UNA SOLA VEZ
    const cargarDatos = async () => {
        setLoading(true);
        try {
            if (esAdmin) {
                // Admin: cargar todas las órdenes
                const response = await getOrdenes();
                setOrdenes(response.data);
            } else {
                // Empleado: cargar solo sus servicios asignados
                const response = await getMisServicios();
                setOrdenes(response.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // Si falla la API, puedes usar datos mock para pruebas
            // setOrdenes(mockData);
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarDatos();
    }, []);

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <div className="ordenes-container">
            {/* ===== ENCABEZADO ===== */}
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
                {/* Solo Admin puede crear nuevas órdenes */}
                {esAdmin && (
                    <button 
                        className="btn-nuevo-orden"
                        onClick={() => setShowModalNueva(true)}
                    >
                        + Nueva Orden
                    </button>
                )}
            </div>

            {/* ===== TABS DE NAVEGACIÓN (SOLO ADMIN) ===== */}
            {esAdmin && (
                <div className="ordenes-tabs">
                    <button className="tab active">Todas las órdenes</button>
                    <button className="tab">Pendientes</button>
                    <button className="tab">En proceso</button>
                    <button className="tab">Finalizados</button>
                    <button className="tab">Entregados</button>
                </div>
            )}

            {/* ===== CONTENIDO SEGÚN ROL ===== */}
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

            {/* ===== MODAL NUEVA ORDEN (SOLO ADMIN) ===== */}
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