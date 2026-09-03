package com.taller.ordenes;

import com.taller.cobros.ServicioRepository;
import com.taller.cobros.TransaccionRepository;
import com.taller.dto.*;
import com.taller.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final TransaccionRepository transaccionRepository;

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

        registrarHistorial(orden, null, "PENDIENTE", "Orden creada", empleadoCrea);

        BigDecimal totalCalculado = BigDecimal.ZERO;

        for (OrdenRequestDTO.ServicioAsignadoDTO servicioReq : request.getServicios()) {
            Servicio servicio = servicioRepository.findById(servicioReq.getIdServicio())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

            Empleado empleado = empleadoRepository.findById(servicioReq.getIdEmpleado())
                    .orElseThrow(() -> new RuntimeException(
                            "Empleado no encontrado para el servicio: " + servicioReq.getIdServicio()));

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

            registrarHistorial(orden, null, "PENDIENTE", mensaje, empleado);
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

    public List<OrdenResponseDTO> getOrdenesPorEmpleado(String username) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<OrdenServicio> serviciosAsignados = ordenServicioRepository.findByEmpleado(empleado);

        List<Long> ordenIds = serviciosAsignados.stream()
                .map(os -> os.getOrden().getIdOrden())
                .distinct()
                .collect(Collectors.toList());

        if (ordenIds.isEmpty()) {
            return new ArrayList<>();
        }

        return ordenRepository.findAllById(ordenIds).stream()
                .map(this::convertToDTO)
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

        String estadoAnterior = ordenServicio.getEstadoServicioOrden();
        ordenServicio.setEstadoServicioOrden("EN_PROCESO");
        ordenServicio = ordenServicioRepository.save(ordenServicio);

        actualizarEstadoOrdenPorServicios(idOrden);

        Orden orden = ordenServicio.getOrden();

        registrarHistorial(orden, estadoAnterior, "EN_PROCESO",
                "Servicio " + ordenServicio.getServicio().getNombreServicio() +
                        " iniciado por " + empleado.getNombreEmpleado(),
                empleado);

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

        String estadoAnterior = ordenServicio.getEstadoServicioOrden();
        ordenServicio.setEstadoServicioOrden("FINALIZADO");
        ordenServicio = ordenServicioRepository.save(ordenServicio);

        actualizarTotalOrden(idOrden);

        actualizarEstadoOrdenPorServicios(idOrden);

        Orden orden = ordenServicio.getOrden();

        registrarHistorial(orden, estadoAnterior, "FINALIZADO",
                "Servicio " + servicio.getNombreServicio() + " finalizado por " +
                        empleado.getNombreEmpleado() + " - Precio: $" + ordenServicio.getPrecioAplicado(),
                empleado);

        return convertToServicioDTO(ordenServicio);
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

        Transaccion transaccion = new Transaccion();
        transaccion.setOrden(orden);
        transaccion.setMontoTotal(totalFinal);
        transaccion.setMontoRecibido(request.getMontoRecibido());
        transaccion.setCambio(request.getMontoRecibido().subtract(totalFinal));
        transaccion.setFechaHoraTransaccion(LocalDateTime.now());
        transaccion.setEmpleado(empleado);
        transaccion.setCierreAsociado(false);
        transaccion.setCierreMensualAsociado(false);
        transaccion = transaccionRepository.save(transaccion);

        orden.setPrecioFinal(totalFinal);
        orden.setEstadoOrden("ENTREGADO");
        orden = ordenRepository.save(orden);

        registrarHistorial(orden, "FINALIZADO", "ENTREGADO",
                "Orden cobrada por " + empleado.getNombreEmpleado() +
                        " - Total: $" + totalFinal,
                empleado);

        return convertToDTO(orden);
    }

    private void actualizarEstadoOrdenPorServicios(Long idOrden) {
        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        List<OrdenServicio> servicios = orden.getOrdenServicios();
        if (servicios.isEmpty())
            return;

        boolean todosPendientes = servicios.stream()
                .allMatch(os -> "PENDIENTE".equals(os.getEstadoServicioOrden()));
        boolean todosFinalizados = servicios.stream()
                .allMatch(os -> "FINALIZADO".equals(os.getEstadoServicioOrden()));
        boolean todosEnProceso = servicios.stream()
                .allMatch(os -> "EN_PROCESO".equals(os.getEstadoServicioOrden()) ||
                        "FINALIZADO".equals(os.getEstadoServicioOrden()));

        String nuevoEstado = null;
        if (todosPendientes && !"PENDIENTE".equals(orden.getEstadoOrden())) {
            nuevoEstado = "PENDIENTE";
        } else if (todosFinalizados && !"FINALIZADO".equals(orden.getEstadoOrden())) {
            nuevoEstado = "FINALIZADO";
        } else if (todosEnProceso && !"EN_PROCESO".equals(orden.getEstadoOrden()) &&
                !"FINALIZADO".equals(orden.getEstadoOrden())) {
            nuevoEstado = "EN_PROCESO";
        }

        if (nuevoEstado != null && !nuevoEstado.equals(orden.getEstadoOrden())) {
            String estadoAnterior = orden.getEstadoOrden();
            orden.setEstadoOrden(nuevoEstado);
            orden = ordenRepository.save(orden);

            log.info("Orden {} cambió automáticamente: {} → {}",
                    orden.getNumOrden(), estadoAnterior, nuevoEstado);
        }
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

    private OrdenServicio getOrdenServicio(Long idOrden, Long idServicio) {
        OrdenServicioId id = new OrdenServicioId();
        id.setIdOrden(idOrden);
        id.setIdServicio(idServicio);
        return ordenServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado en la orden"));
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
            String estadoNuevo, String comentario, Empleado empleado) {
        HistorialEstadoOrden historial = new HistorialEstadoOrden();
        historial.setOrden(orden);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo);
        historial.setFechaCambio(LocalDateTime.now());
        historial.setComentario(comentario);
        historial.setEmpleado(empleado);
        historialEstadoOrdenRepository.save(historial);
    }

    public Map<String, Long> getEstadisticas() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalOrdenes", ordenRepository.count());
        stats.put("pendientes", ordenRepository.countByEstadoIn(List.of("PENDIENTE")));
        stats.put("enProceso", ordenRepository.countByEstadoIn(List.of("EN_PROCESO")));
        stats.put("finalizadas", ordenRepository.countByEstadoIn(List.of("FINALIZADO")));
        stats.put("entregadas", ordenRepository.countByEstadoIn(List.of("ENTREGADO")));
        return stats;
    }

    public Map<String, Long> getEstadisticasPorEmpleado(String username) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<OrdenServicio> serviciosAsignados = ordenServicioRepository.findByEmpleado(empleado);

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalOrdenes", 0L);
        stats.put("pendientes", 0L);
        stats.put("enProceso", 0L);
        stats.put("finalizadas", 0L);
        stats.put("entregadas", 0L);

        if (serviciosAsignados.isEmpty()) {
            return stats;
        }

        Map<Long, List<OrdenServicio>> serviciosPorOrden = serviciosAsignados.stream()
                .collect(Collectors.groupingBy(os -> os.getOrden().getIdOrden()));

        List<Long> ordenIds = new ArrayList<>(serviciosPorOrden.keySet());

        List<Orden> ordenes = ordenRepository.findAllById(ordenIds);
        Map<Long, String> estadoOrdenMap = ordenes.stream()
                .collect(Collectors.toMap(Orden::getIdOrden, Orden::getEstadoOrden));

        long pendientes = 0;
        long enProceso = 0;
        long finalizados = 0;
        long entregadas = 0;

        for (OrdenServicio servicio : serviciosAsignados) {
            Long ordenId = servicio.getOrden().getIdOrden();
            String estadoOrden = estadoOrdenMap.getOrDefault(ordenId, "PENDIENTE");
            String estadoServicio = servicio.getEstadoServicioOrden();

            if ("ENTREGADO".equals(estadoOrden)) {
                entregadas++;
            } else if ("PENDIENTE".equals(estadoServicio)) {
                pendientes++;
            } else if ("EN_PROCESO".equals(estadoServicio)) {
                enProceso++;
            } else if ("FINALIZADO".equals(estadoServicio)) {
                finalizados++;
            }
        }

        stats.put("totalOrdenes", (long) ordenIds.size());
        stats.put("pendientes", pendientes);
        stats.put("enProceso", enProceso);
        stats.put("finalizadas", finalizados);
        stats.put("entregadas", entregadas);

        return stats;
    }

    public List<HistorialEstadoDTO> getHistorial(Long idOrden) {
        return historialEstadoOrdenRepository.findByOrdenIdOrderByFechaCambioAsc(idOrden).stream()
                .map(this::convertToHistorialDTO)
                .collect(Collectors.toList());
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

        List<OrdenServicio> servicios = ordenServicioRepository.findByOrdenId(orden.getIdOrden());
        dto.setOrdenServicios(servicios.stream()
                .map(this::convertToServicioDTO)
                .collect(Collectors.toList()));

        List<HistorialEstadoOrden> historial = historialEstadoOrdenRepository
                .findByOrdenIdOrderByFechaCambioAsc(orden.getIdOrden());
        dto.setHistorialEstados(historial.stream()
                .map(this::convertToHistorialDTO)
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
        if (os.getEmpleado() != null) {
            empleadoDTO.setIdEmpleado(os.getEmpleado().getIdEmpleado());
            empleadoDTO.setNombreEmpleado(os.getEmpleado().getNombreEmpleado());
            empleadoDTO.setRolEmpleado(os.getEmpleado().getRolEmpleado());
            empleadoDTO.setUsername(os.getEmpleado().getUsername());
        } else {
            empleadoDTO.setIdEmpleado(null);
            empleadoDTO.setNombreEmpleado("Sin asignar");
            empleadoDTO.setRolEmpleado(null);
            empleadoDTO.setUsername(null);
        }
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
                "Cambio de estado por " + empleado.getNombreEmpleado(), empleado);

        return convertToDTO(orden);
    }
}