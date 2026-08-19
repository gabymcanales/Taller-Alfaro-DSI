package com.taller.ordenes;

import com.taller.dto.*;
import com.taller.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taller.cobros.ServicioRepository;
import com.taller.ordenes.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final OrdenServicioRepository ordenServicioRepository;
    private final HistorialEstadoOrdenRepository historialEstadoOrdenRepository;
    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ServicioRepository servicioRepository;


    @Transactional
    public OrdenResponseDTO crearOrden(OrdenRequestDTO request) {
        // 1. Validar cliente
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 2. Validar vehículo
        Vehiculo vehiculo = vehiculoRepository.findById(request.getIdVehiculo())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (!vehiculo.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new RuntimeException("El vehículo no pertenece a este cliente");
        }

        if (request.getServicios() == null || request.getServicios().isEmpty()) {
            throw new RuntimeException("La orden debe tener al menos un servicio");
        }

        // 3. Crear orden
        Orden orden = new Orden();
        orden.setCliente(cliente);
        orden.setVehiculo(vehiculo);
        orden.setEstadoOrden("PENDIENTE");
        orden.setFechaHoraOrden(LocalDateTime.now());
        orden.setNumOrden(generarNumeroOrden());
        orden.setTotalCalculadoOrden(BigDecimal.ZERO);
        orden.setPrecioFinal(null);
        orden = ordenRepository.save(orden);

        // 4. Registrar estado inicial
        registrarHistorial(orden, null, "PENDIENTE", "Orden creada");

        // 5. Procesar servicios
        BigDecimal totalCalculado = BigDecimal.ZERO;

        for (OrdenRequestDTO.ServicioRequestDTO servicioReq : request.getServicios()) {
            Servicio servicio = servicioRepository.findById(servicioReq.getIdServicio())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

            Empleado empleado = empleadoRepository.findById(servicioReq.getIdEmpleado())
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

            if (!empleado.getActivo()) {
                throw new RuntimeException("El empleado " + empleado.getNombreEmpleado() + " no está activo");
            }

            if ("ADMINISTRADOR".equals(empleado.getRolEmpleado())) {
                throw new RuntimeException("No se puede asignar un Administrador a un servicio");
            }

            // Validar especialidad
            boolean tieneEspecialidad = empleado.getEspecialidades().stream()
                    .anyMatch(e -> e.getIdServicio().equals(servicio.getIdServicio()));
            if (!tieneEspecialidad) {
                throw new RuntimeException("El empleado " + empleado.getNombreEmpleado() +
                        " no tiene la especialidad para " + servicio.getNombreServicio());
            }

            // Crear OrdenServicio
            OrdenServicio ordenServicio = new OrdenServicio();
            OrdenServicioId id = new OrdenServicioId();
            id.setIdOrden(orden.getIdOrden());
            id.setIdServicio(servicio.getIdServicio());
            ordenServicio.setId(id);
            ordenServicio.setOrden(orden);
            ordenServicio.setServicio(servicio);
            ordenServicio.setEmpleado(empleado);
            ordenServicio.setEstadoServicioOrden("PENDIENTE");

            // Precio
            if (servicioReq.getPrecioAplicado() != null) {
                ordenServicio.setPrecioAplicado(servicioReq.getPrecioAplicado());
                totalCalculado = totalCalculado.add(servicioReq.getPrecioAplicado());
            } else if ("FIJO".equals(servicio.getTipoPrecio())) {
                BigDecimal precio = servicio.getPrecioSugerido();
                if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new RuntimeException("El servicio " + servicio.getNombreServicio() +
                            " no tiene precio definido");
                }
                ordenServicio.setPrecioAplicado(precio);
                totalCalculado = totalCalculado.add(precio);
            } else {
                ordenServicio.setPrecioAplicado(null);
            }

            ordenServicioRepository.save(ordenServicio);

            registrarHistorial(orden, null, "PENDIENTE",
                    "Servicio " + servicio.getNombreServicio() + " asignado a " + empleado.getNombreEmpleado());
        }

        orden.setTotalCalculadoOrden(totalCalculado);
        orden = ordenRepository.save(orden);

        return convertToDTO(orden);
    }


    public List<OrdenResponseDTO> getOrdenes() {
        return ordenRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    public OrdenResponseDTO getOrdenById(Long id) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        return convertToDTO(orden);
    }


    public List<HistorialEstadoDTO> getHistorial(Long idOrden) {
        List<HistorialEstadoOrden> historial = historialEstadoOrdenRepository
                .findByOrdenIdOrderByFechaCambioAsc(idOrden);

        return historial.stream()
                .map(this::convertToHistorialDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cobrarOrden(Long idOrden) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!"FINALIZADO".equals(orden.getEstadoOrden())) {
            throw new RuntimeException("Solo se pueden cobrar órdenes en estado FINALIZADO");
        }

        boolean todosFinalizados = orden.getOrdenServicios().stream()
                .allMatch(os -> "FINALIZADO".equals(os.getEstadoServicioOrden()));
        if (!todosFinalizados) {
            throw new RuntimeException("No todos los servicios están finalizados");
        }

        if (orden.getPrecioFinal() == null) {
            throw new RuntimeException("La orden no tiene precio final definido");
        }

        String estadoAnterior = orden.getEstadoOrden();
        orden.setEstadoOrden("ENTREGADO");
        ordenRepository.save(orden);

        registrarHistorial(orden, estadoAnterior, "ENTREGADO", "Orden cobrada y entregada");
    }

    public List<OrdenServicioDTO> getMisServicios(String username) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<OrdenServicio> servicios = ordenServicioRepository.findByEmpleado(empleado);

        return servicios.stream()
                .map(this::convertToServicioDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateEstadoServicio(Long idOrden, Long idServicio, String nuevoEstado,
                                     String comentario, String username) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        OrdenServicioId id = new OrdenServicioId();
        id.setIdOrden(idOrden);
        id.setIdServicio(idServicio);

        OrdenServicio ordenServicio = ordenServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (!ordenServicio.getEmpleado().getIdEmpleado().equals(empleado.getIdEmpleado())) {
            throw new RuntimeException("No tienes permiso para modificar este servicio");
        }

        String estadoActual = ordenServicio.getEstadoServicioOrden();
        if (estadoActual == null) estadoActual = "PENDIENTE";

        if (!isValidTransition(estadoActual, nuevoEstado)) {
            throw new RuntimeException("No se puede pasar de " + estadoActual + " a " + nuevoEstado);
        }

        if ("FINALIZADO".equals(nuevoEstado) &&
            "VARIABLE".equals(ordenServicio.getServicio().getTipoPrecio()) &&
            ordenServicio.getPrecioAplicado() == null) {
            throw new RuntimeException("El servicio variable debe tener un precio definido");
        }

        ordenServicio.setEstadoServicioOrden(nuevoEstado);
        ordenServicioRepository.save(ordenServicio);

        registrarHistorial(ordenServicio.getOrden(), estadoActual, nuevoEstado, comentario);

        
        Orden orden = ordenServicio.getOrden();
        boolean todosFinalizados = orden.getOrdenServicios().stream()
                .allMatch(os -> "FINALIZADO".equals(os.getEstadoServicioOrden()));

        if (todosFinalizados) {
            BigDecimal precioFinal = orden.getOrdenServicios().stream()
                    .map(OrdenServicio::getPrecioAplicado)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            orden.setPrecioFinal(precioFinal);
            orden.setEstadoOrden("FINALIZADO");
            ordenRepository.save(orden);

            registrarHistorial(orden, "EN_PROCESO", "FINALIZADO",
                    "Todos los servicios completados. Orden lista para cobrar.");
        }
    }

    @Transactional
    public void updatePrecioServicio(Long idOrden, Long idServicio, BigDecimal precioAplicado,
                                     String username) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        OrdenServicioId id = new OrdenServicioId();
        id.setIdOrden(idOrden);
        id.setIdServicio(idServicio);

        OrdenServicio ordenServicio = ordenServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (!ordenServicio.getEmpleado().getIdEmpleado().equals(empleado.getIdEmpleado())) {
            throw new RuntimeException("No tienes permiso para modificar este servicio");
        }

        if (!"VARIABLE".equals(ordenServicio.getServicio().getTipoPrecio())) {
            throw new RuntimeException("Este servicio no es de precio variable");
        }

        if (precioAplicado == null || precioAplicado.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0");
        }

        ordenServicio.setPrecioAplicado(precioAplicado);
        ordenServicioRepository.save(ordenServicio);

        Orden orden = ordenServicio.getOrden();
        BigDecimal total = orden.getOrdenServicios().stream()
                .map(OrdenServicio::getPrecioAplicado)
                .filter(p -> p != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        orden.setTotalCalculadoOrden(total);
        ordenRepository.save(orden);

        registrarHistorial(orden, null, null,
                "Precio definido para " + ordenServicio.getServicio().getNombreServicio() +
                ": $" + precioAplicado);
    }


    private String generarNumeroOrden() {
        LocalDateTime ahora = LocalDateTime.now();
        String fecha = ahora.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = ordenRepository.countByFechaHoraOrdenBetween(
                ahora.toLocalDate().atStartOfDay(),
                ahora.toLocalDate().atTime(23, 59, 59)
        );
        return String.format("ORD-%s-%03d", fecha, count + 1);
    }

    private boolean isValidTransition(String actual, String nuevo) {
        return switch (actual) {
            case "PENDIENTE" -> "EN_PROCESO".equals(nuevo);
            case "EN_PROCESO" -> "FINALIZADO".equals(nuevo);
            case "FINALIZADO" -> false;
            default -> false;
        };
    }

    private void registrarHistorial(Orden orden, String estadoAnterior,
                                     String estadoNuevo, String comentario) {
        HistorialEstadoOrden historial = new HistorialEstadoOrden();
        historial.setOrden(orden);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo != null ? estadoNuevo : estadoAnterior);
        historial.setFechaCambio(LocalDateTime.now());
        historial.setComentario(comentario);
        historial.setEmpleado(null);
        historialEstadoOrdenRepository.save(historial);
    }


    private OrdenResponseDTO convertToDTO(Orden orden) {
        OrdenResponseDTO dto = new OrdenResponseDTO();
        dto.setIdOrden(orden.getIdOrden());
        dto.setNumOrden(orden.getNumOrden());
        dto.setEstadoOrden(orden.getEstadoOrden());
        dto.setFechaHoraOrden(orden.getFechaHoraOrden());
        dto.setTotalCalculadoOrden(orden.getTotalCalculadoOrden());
        dto.setPrecioFinal(orden.getPrecioFinal());

        OrdenResponseDTO.ClienteInfoDTO clienteDTO = new OrdenResponseDTO.ClienteInfoDTO();
        clienteDTO.setIdCliente(orden.getCliente().getIdCliente());
        clienteDTO.setNombreCliente(orden.getCliente().getNombreCliente());
        clienteDTO.setTelefonoCliente(orden.getCliente().getTelefonoCliente());
        dto.setCliente(clienteDTO);

        OrdenResponseDTO.VehiculoInfoDTO vehiculoDTO = new OrdenResponseDTO.VehiculoInfoDTO();
        vehiculoDTO.setIdVehiculo(orden.getVehiculo().getIdVehiculo());
        vehiculoDTO.setPlaca(orden.getVehiculo().getPlaca());
        vehiculoDTO.setMarca(orden.getVehiculo().getMarca());
        vehiculoDTO.setModelo(orden.getVehiculo().getModelo());
        vehiculoDTO.setAnio(orden.getVehiculo().getAnio());
        vehiculoDTO.setColor(orden.getVehiculo().getColor());
        dto.setVehiculo(vehiculoDTO);

        dto.setOrdenServicios(orden.getOrdenServicios().stream()
                .map(this::convertToServicioDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private OrdenServicioDTO convertToServicioDTO(OrdenServicio os) {
        OrdenServicioDTO dto = new OrdenServicioDTO();
        dto.setIdOrden(os.getOrden().getIdOrden());
        dto.setIdServicio(os.getServicio().getIdServicio());
        dto.setNombreServicio(os.getServicio().getNombreServicio());
        dto.setAreaServicio(os.getServicio().getAreaServicio());
        dto.setPrecioAplicado(os.getPrecioAplicado());
        dto.setEstadoServicioOrden(os.getEstadoServicioOrden());

        OrdenServicioDTO.EmpleadoInfoDTO empleadoDTO = new OrdenServicioDTO.EmpleadoInfoDTO();
        empleadoDTO.setIdEmpleado(os.getEmpleado().getIdEmpleado());
        empleadoDTO.setNombreEmpleado(os.getEmpleado().getNombreEmpleado());
        empleadoDTO.setRolEmpleado(os.getEmpleado().getRolEmpleado());
        empleadoDTO.setUsername(os.getEmpleado().getUsername());
        dto.setEmpleado(empleadoDTO);

        return dto;
    }

    private HistorialEstadoDTO convertToHistorialDTO(HistorialEstadoOrden h) {
        HistorialEstadoDTO dto = new HistorialEstadoDTO();
        dto.setIdHistorial(h.getIdHistorial());
        dto.setEstadoAnterior(h.getEstadoAnterior());
        dto.setEstadoNuevo(h.getEstadoNuevo());
        dto.setFechaCambio(h.getFechaCambio());
        dto.setComentario(h.getComentario());
        dto.setNombreEmpleado(h.getEmpleado() != null ? h.getEmpleado().getNombreEmpleado() : "Sistema");
        return dto;
    }
}