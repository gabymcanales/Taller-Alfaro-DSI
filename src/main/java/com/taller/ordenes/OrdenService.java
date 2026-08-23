package com.taller.ordenes;

import com.taller.dto.*;
import com.taller.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taller.cobros.ServicioRepository;

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
    public OrdenResponseDTO crearOrden(OrdenRequestDTO request, String username) {

        
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

       
        Vehiculo vehiculo = vehiculoRepository.findById(request.getIdVehiculo())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (!vehiculo.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new RuntimeException("El vehículo no pertenece a este cliente");
        }

     
        if (request.getServicios() == null || request.getServicios().isEmpty()) {
            throw new RuntimeException("La orden debe tener al menos un servicio");
        }

        // Obtener el empleado que crea la orden
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

           
            boolean tieneEspecialidad = empleado.getEspecialidades().stream()
                    .anyMatch(e -> e.getIdServicio().equals(servicio.getIdServicio()));
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
        historial.setEstadoNuevo(estadoNuevo != null ? estadoNuevo : estadoAnterior);
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