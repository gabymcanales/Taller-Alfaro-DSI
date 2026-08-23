package com.taller.ordenes;

import com.taller.cobros.ServicioRepository;
import com.taller.dto.*;
import com.taller.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final OrdenServicioRepository ordenServicioRepository;
    private final HistorialEstadoOrdenRepository historialEstadoOrdenRepository;
    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ServicioRepository servicioRepository;

    @Transactional
    public OrdenResponseDTO crearOrden(OrdenRequestDTO request, String username) {
        log.info("Creando orden para cliente: {}", request.getIdCliente());

        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Vehiculo vehiculo = null;
        if (request.getIdVehiculo() != null) {
            vehiculo = vehiculoRepository.findById(request.getIdVehiculo())
                    .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

            if (!vehiculo.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
                throw new RuntimeException("El vehículo no pertenece a este cliente");
            }
        }

        if (request.getServicios() == null || request.getServicios().isEmpty()) {
            throw new RuntimeException("La orden debe tener al menos un servicio");
        }

        Empleado empleadoCrea = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        Orden orden = new Orden();
        orden.setCliente(cliente);
        orden.setVehiculo(vehiculo);
        orden.setEmpleado(empleadoCrea);
        orden.setEstadoOrden("PENDIENTE");
        orden.setFechaHoraOrden(LocalDateTime.now());
        orden.setNumOrden(generarNumeroOrden());
        orden.setTotalCalculadoOrden(BigDecimal.ZERO);
        orden.setPrecioFinal(null);
        orden = ordenRepository.save(orden);

        registrarHistorial(orden, null, "PENDIENTE", "Orden creada");

        BigDecimal totalCalculado = BigDecimal.ZERO;

        for (OrdenRequestDTO.ServicioAsignadoDTO servicioReq : request.getServicios()) {
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

            boolean tieneEspecialidad = empleado.getServicios().stream()
                    .anyMatch(s -> s.getIdServicio().equals(servicio.getIdServicio()));

            if (!tieneEspecialidad) {
                throw new RuntimeException("El empleado " + empleado.getNombreEmpleado() +
                        " no tiene la especialidad para " + servicio.getNombreServicio());
            }

            OrdenServicio ordenServicio = new OrdenServicio();
            OrdenServicioId id = new OrdenServicioId();
            id.setIdOrden(orden.getIdOrden());
            id.setIdServicio(servicio.getIdServicio());
            ordenServicio.setId(id);
            ordenServicio.setOrden(orden);
            ordenServicio.setServicio(servicio);
            ordenServicio.setEmpleado(empleado);
            ordenServicio.setEstadoServicioOrden("PENDIENTE");

            if ("FIJO".equals(servicio.getTipoPrecio())) {
                BigDecimal precio = servicio.getPrecioSugerido();
                if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new RuntimeException("El servicio fijo " + servicio.getNombreServicio() +
                            " no tiene precio definido");
                }
                ordenServicio.setPrecioAplicado(precio);
                totalCalculado = totalCalculado.add(precio);
            } else if ("VARIABLE".equals(servicio.getTipoPrecio())) {
                ordenServicio.setPrecioAplicado(null);
            } else {
                throw new RuntimeException("Tipo de precio no válido: " + servicio.getTipoPrecio());
            }

            ordenServicioRepository.save(ordenServicio);

            String mensaje = "Servicio " + servicio.getNombreServicio() +
                    " asignado a " + empleado.getNombreEmpleado();
            if ("VARIABLE".equals(servicio.getTipoPrecio())) {
                mensaje += " (precio variable)";
            }
            registrarHistorial(orden, null, "PENDIENTE", mensaje);
        }

        orden.setTotalCalculadoOrden(totalCalculado);
        orden = ordenRepository.save(orden);

        log.info("Orden creada: {}", orden.getNumOrden());
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

    public List<OrdenResponseDTO> getOrdenesByCliente(Long clienteId) {
        return ordenRepository.findByClienteId(clienteId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrdenResponseDTO> getOrdenesByEstado(String estado) {
        return ordenRepository.findByEstadoOrden(estado).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EmpleadoDTO> getEmpleadosPorServicio(Long idServicio) {
        return empleadoRepository.findEmpleadosByServicioId(idServicio).stream()
                .map(this::convertToEmpleadoDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrdenServicioDTO iniciarServicio(Long idOrden, Long idServicio, String username) {
        OrdenServicio ordenServicio = getOrdenServicio(idOrden, idServicio);

        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!"PENDIENTE".equals(ordenServicio.getEstadoServicioOrden())) {
            throw new RuntimeException("El servicio debe estar PENDIENTE para iniciarlo");
        }

        if (!ordenServicio.getEmpleado().getIdEmpleado().equals(empleado.getIdEmpleado())) {
            throw new RuntimeException("Solo el empleado asignado puede iniciar este servicio");
        }

        ordenServicio.setEstadoServicioOrden("EN_PROCESO");
        ordenServicio = ordenServicioRepository.save(ordenServicio);

        actualizarEstadoOrdenPorServicios(idOrden);

        Orden orden = ordenServicio.getOrden();
        registrarHistorial(orden, null, orden.getEstadoOrden(),
                "Servicio " + ordenServicio.getServicio().getNombreServicio() +
                        " iniciado por " + empleado.getNombreEmpleado());

        return convertToServicioDTO(ordenServicio);
    }

    @Transactional
    public OrdenServicioDTO finalizarServicio(Long idOrden, Long idServicio,
            FinalizarServicioRequest request, String username) {
        OrdenServicio ordenServicio = getOrdenServicio(idOrden, idServicio);

        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (!"EN_PROCESO".equals(ordenServicio.getEstadoServicioOrden())) {
            throw new RuntimeException("El servicio debe estar EN_PROCESO para finalizarlo");
        }

        if (!ordenServicio.getEmpleado().getIdEmpleado().equals(empleado.getIdEmpleado())) {
            throw new RuntimeException("Solo el empleado asignado puede finalizar este servicio");
        }

        Servicio servicio = ordenServicio.getServicio();

        if ("VARIABLE".equals(servicio.getTipoPrecio())) {
            if (request.getPrecioFinal() == null || request.getPrecioFinal().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Debe definir un precio válido para el servicio variable");
            }
            ordenServicio.setPrecioAplicado(request.getPrecioFinal());
        } else {
            if (ordenServicio.getPrecioAplicado() == null) {
                throw new RuntimeException("El servicio fijo no tiene precio definido");
            }
        }

        ordenServicio.setEstadoServicioOrden("FINALIZADO");
        ordenServicio = ordenServicioRepository.save(ordenServicio);

        actualizarTotalOrden(idOrden);
        actualizarEstadoOrdenPorServicios(idOrden);

        Orden orden = ordenServicio.getOrden();
        registrarHistorial(orden, null, orden.getEstadoOrden(),
                "Servicio " + servicio.getNombreServicio() + " finalizado por " +
                        empleado.getNombreEmpleado() + " - Precio: $" + ordenServicio.getPrecioAplicado());

        return convertToServicioDTO(ordenServicio);
    }

    @Transactional
    public OrdenResponseDTO cambiarEstadoOrden(Long idOrden, String nuevoEstado, String username) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        validarTransicionEstado(orden.getEstadoOrden(), nuevoEstado);

        String estadoAnterior = orden.getEstadoOrden();
        orden.setEstadoOrden(nuevoEstado);
        orden = ordenRepository.save(orden);

        registrarHistorial(orden, estadoAnterior, nuevoEstado,
                "Cambio de estado por " + empleado.getNombreEmpleado());

        return convertToDTO(orden);
    }

    public List<HistorialEstadoDTO> getHistorial(Long idOrden) {
        return historialEstadoOrdenRepository.findByOrdenIdOrderByFechaCambioAsc(idOrden).stream()
                .map(this::convertToHistorialDTO)
                .collect(Collectors.toList());
    }

    private OrdenServicio getOrdenServicio(Long idOrden, Long idServicio) {
        OrdenServicioId id = new OrdenServicioId();
        id.setIdOrden(idOrden);
        id.setIdServicio(idServicio);
        return ordenServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado en la orden"));
    }

    private void actualizarTotalOrden(Long idOrden) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        BigDecimal total = orden.getOrdenServicios().stream()
                .filter(os -> "FINALIZADO".equals(os.getEstadoServicioOrden()))
                .map(OrdenServicio::getPrecioAplicado)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        orden.setTotalCalculadoOrden(total);
        ordenRepository.save(orden);
    }

    private void actualizarEstadoOrdenPorServicios(Long idOrden) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        List<OrdenServicio> servicios = orden.getOrdenServicios();
        if (servicios.isEmpty())
            return;

        boolean todosFinalizados = servicios.stream()
                .allMatch(os -> "FINALIZADO".equals(os.getEstadoServicioOrden()));

        boolean todosEnProceso = servicios.stream()
                .allMatch(os -> "EN_PROCESO".equals(os.getEstadoServicioOrden()) ||
                        "FINALIZADO".equals(os.getEstadoServicioOrden()));

        String nuevoEstado = null;
        if (todosFinalizados && !"FINALIZADO".equals(orden.getEstadoOrden())) {
            nuevoEstado = "FINALIZADO";
        } else if (todosEnProceso && !"EN_PROCESO".equals(orden.getEstadoOrden()) &&
                !"FINALIZADO".equals(orden.getEstadoOrden())) {
            nuevoEstado = "EN_PROCESO";
        }

        if (nuevoEstado != null) {
            String estadoAnterior = orden.getEstadoOrden();
            orden.setEstadoOrden(nuevoEstado);
            ordenRepository.save(orden);
            registrarHistorial(orden, estadoAnterior, nuevoEstado,
                    "Cambio automático basado en estado de servicios");
        }
    }

    private void validarTransicionEstado(String estadoActual, String nuevoEstado) {
        List<String> estados = List.of("PENDIENTE", "EN_PROCESO", "FINALIZADO", "ENTREGADO");

        if (!estados.contains(nuevoEstado)) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado);
        }

        int indiceActual = estados.indexOf(estadoActual);
        int indiceNuevo = estados.indexOf(nuevoEstado);

        if (indiceNuevo < indiceActual) {
            throw new RuntimeException("No se puede retroceder de " + estadoActual + " a " + nuevoEstado);
        }
        if (indiceNuevo > indiceActual + 1) {
            throw new RuntimeException("No se puede saltar de " + estadoActual + " a " + nuevoEstado);
        }
    }

    private String generarNumeroOrden() {
        LocalDateTime ahora = LocalDateTime.now();
        String fecha = ahora.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = ordenRepository.countByFechaHoraOrdenBetween(
                ahora.toLocalDate().atStartOfDay(),
                ahora.toLocalDate().atTime(23, 59, 59));
        return String.format("ORD-%s-%03d", fecha, count + 1);
    }

    private void registrarHistorial(Orden orden, String estadoAnterior,
            String estadoNuevo, String comentario) {
        HistorialEstadoOrden historial = new HistorialEstadoOrden();
        historial.setOrden(orden);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo);
        historial.setFechaCambio(LocalDateTime.now());
        historial.setComentario(comentario);
        historial.setEmpleado(orden.getEmpleado());
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

        if (orden.getVehiculo() != null) {
            OrdenResponseDTO.VehiculoInfoDTO vehiculoDTO = new OrdenResponseDTO.VehiculoInfoDTO();
            vehiculoDTO.setIdVehiculo(orden.getVehiculo().getIdVehiculo());
            vehiculoDTO.setPlaca(orden.getVehiculo().getPlaca());
            vehiculoDTO.setMarca(orden.getVehiculo().getMarca());
            vehiculoDTO.setModelo(orden.getVehiculo().getModelo());
            vehiculoDTO.setAnio(orden.getVehiculo().getAnio());
            vehiculoDTO.setColor(orden.getVehiculo().getColor());
            dto.setVehiculo(vehiculoDTO);
        }

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
        dto.setTipoPrecio(os.getServicio().getTipoPrecio());
        dto.setPrecioAplicado(os.getPrecioAplicado());
        dto.setEstadoServicioOrden(os.getEstadoServicioOrden());
        dto.setEsPrecioVariable("VARIABLE".equals(os.getServicio().getTipoPrecio()));

        OrdenServicioDTO.EmpleadoInfoDTO empleadoDTO = new OrdenServicioDTO.EmpleadoInfoDTO();
        empleadoDTO.setIdEmpleado(os.getEmpleado().getIdEmpleado());
        empleadoDTO.setNombreEmpleado(os.getEmpleado().getNombreEmpleado());
        empleadoDTO.setRolEmpleado(os.getEmpleado().getRolEmpleado());
        empleadoDTO.setUsername(os.getEmpleado().getUsername());
        dto.setEmpleado(empleadoDTO);

        return dto;
    }

    private EmpleadoDTO convertToEmpleadoDTO(Empleado empleado) {
        EmpleadoDTO dto = new EmpleadoDTO();
        dto.setIdEmpleado(empleado.getIdEmpleado());
        dto.setNombreEmpleado(empleado.getNombreEmpleado());
        dto.setUsername(empleado.getUsername());
        dto.setRolEmpleado(empleado.getRolEmpleado());
        dto.setActivo(empleado.getActivo());
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

    @Transactional
    public OrdenResponseDTO cobrarOrden(Long idOrden, CobroRequest request, String username) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!"FINALIZADO".equals(orden.getEstadoOrden())) {
            throw new RuntimeException("La orden debe estar FINALIZADA para poder cobrarla");
        }

        BigDecimal totalFinal = orden.getOrdenServicios().stream()
                .map(OrdenServicio::getPrecioAplicado)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (request.getMontoRecibido() == null || request.getMontoRecibido().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto recibido debe ser mayor a 0");
        }

        if (request.getMontoRecibido().compareTo(totalFinal) < 0) {
            throw new RuntimeException("El monto recibido es menor al total de la orden");
        }

        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        orden.setPrecioFinal(totalFinal);
        orden.setEstadoOrden("ENTREGADO");
        orden = ordenRepository.save(orden);

        registrarHistorial(orden, "FINALIZADO", "ENTREGADO",
                "Orden cobrada por " + empleado.getNombreEmpleado() +
                        " - Total: $" + totalFinal);

        return convertToDTO(orden);
    }
}