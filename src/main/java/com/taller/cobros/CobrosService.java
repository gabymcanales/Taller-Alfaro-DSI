package com.taller.cobros;

import com.taller.dto.RegistroCobroRequest;
import com.taller.dto.RegistroCobroResponse;
import com.taller.exception.*;
import com.taller.model.*;
import com.taller.ordenes.ClienteRepository;
import com.taller.ordenes.EmpleadoRepository;
import com.taller.ordenes.OrdenRepository;
import com.taller.ordenes.OrdenService;
import com.taller.ordenes.OrdenServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taller.dto.ArqueoDiarioDTO;
import com.taller.dto.HistorialTransaccionDTO;

import com.taller.dto.OrdenRequestDTO;
import com.taller.dto.OrdenResponseDTO;
import com.taller.dto.CobroRequest;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import com.taller.cierres.CierreDiarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CobrosService {

    private final TransaccionRepository transaccionRepository;
    private final OrdenRepository ordenRepository;
    private final ServicioRepository servicioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final OrdenServicioRepository ordenServicioRepository;
    private final CierreDiarioRepository cierreDiarioRepository;
    private final OrdenService ordenService;

    @Transactional
    public RegistroCobroResponse registrarCobro(RegistroCobroRequest request, String usernameEmpleado) {

        LocalDate hoy = LocalDate.now();
        if (cierreDiarioRepository.existsByFechaCierre(hoy)) {
            throw new RuntimeException("No se pueden registrar cobros: el día " + hoy + " ya está cerrado.");
        }

        
        Servicio servicio = servicioRepository.findById(request.getIdServicio())
                .orElseThrow(() -> new ServicioNoEncontradoException(request.getIdServicio()));

        
        Cliente cliente = clienteRepository.findByTelefonoCliente(request.getTelefonoCliente())
                .orElseGet(() -> {
                    Cliente nuevoCliente = new Cliente();
                    nuevoCliente.setNombreCliente(request.getNombreCliente());
                    nuevoCliente.setTelefonoCliente(request.getTelefonoCliente());
                    return clienteRepository.save(nuevoCliente);
                });

      
        if (request.getMontoRecibido().compareTo(request.getMontoTotal()) < 0) {
            throw new MontoInsuficienteException();
        }

      
        Empleado empleado = empleadoRepository.findByUsername(usernameEmpleado)
                .orElseThrow(() -> new EmpleadoNoEncontradoException(usernameEmpleado));

       
        BigDecimal cambio = request.getMontoRecibido().subtract(request.getMontoTotal());

        OrdenRequestDTO ordenRequest = new OrdenRequestDTO();
        ordenRequest.setIdCliente(cliente.getIdCliente());

        OrdenRequestDTO.ServicioAsignadoDTO servicioDTO = new OrdenRequestDTO.ServicioAsignadoDTO();
        servicioDTO.setIdServicio(request.getIdServicio());
        servicioDTO.setIdEmpleado(empleado.getIdEmpleado());
        ordenRequest.setServicios(List.of(servicioDTO));

        OrdenResponseDTO ordenResponse = ordenService.crearOrden(ordenRequest, usernameEmpleado);

        
        Orden orden = ordenRepository.findById(ordenResponse.getIdOrden())
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        
        CobroRequest cobroRequest = new CobroRequest();
        cobroRequest.setMontoRecibido(request.getMontoRecibido());
        ordenService.cobrarOrden(orden.getIdOrden(), cobroRequest, usernameEmpleado);

        
        Transaccion transaccion = transaccionRepository.findByOrdenId(orden.getIdOrden())
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));

        return mapearARespuesta(transaccion, orden, cliente, servicio, empleado, cambio);
    }


    private RegistroCobroResponse mapearARespuesta(Transaccion transaccion, Orden orden,
            Cliente cliente, Servicio servicio,
            Empleado empleado, BigDecimal cambio) {
        RegistroCobroResponse response = new RegistroCobroResponse();
        response.setOrdenId(orden.getIdOrden());
        response.setNumOrden(orden.getNumOrden());
        response.setClienteNombre(cliente.getNombreCliente());
        response.setTelefonoCliente(cliente.getTelefonoCliente());
        response.setServicioNombre(servicio.getNombreServicio());
        response.setMontoTotal(transaccion.getMontoTotal());
        response.setMontoRecibido(transaccion.getMontoRecibido());
        response.setCambio(cambio);
        response.setEstado(orden.getEstadoOrden());
        response.setFechaHora(transaccion.getFechaHoraTransaccion());
        response.setEmpleadoUsername(empleado.getUsername());
        return response;
    }

    public List<Servicio> listarServicios() {
        return servicioRepository.findAll();
    }

    public ArqueoDiarioDTO getArqueoDiario() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(inicioDia, finDia);

        BigDecimal totalIngresos = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long totalTransacciones = (long) transacciones.size();

        String primerCobroHora = "";
        String ultimoCobroHora = "";

        if (!transacciones.isEmpty()) {
            LocalDateTime primera = transacciones.get(0).getFechaHoraTransaccion();
            LocalDateTime ultima = transacciones.get(transacciones.size() - 1).getFechaHoraTransaccion();

            primerCobroHora = primera.format(DateTimeFormatter.ofPattern("hh:mm a"));
            ultimoCobroHora = ultima.format(DateTimeFormatter.ofPattern("hh:mm a"));
        }

        List<ArqueoDiarioDTO.TransaccionArqueoDTO> transaccionesDTO = new ArrayList<>();
        int contador = 1;

        for (Transaccion t : transacciones) {
            ArqueoDiarioDTO.TransaccionArqueoDTO dto = new ArqueoDiarioDTO.TransaccionArqueoDTO();
            dto.setNumero(contador++);
            dto.setHora(t.getFechaHoraTransaccion().format(DateTimeFormatter.ofPattern("hh:mm a")));
            dto.setNumOrden(t.getOrden().getNumOrden());

            String nombreServicio = "Sin servicio";
            if (t.getOrden().getOrdenServicios() != null && !t.getOrden().getOrdenServicios().isEmpty()) {
                nombreServicio = t.getOrden().getOrdenServicios().get(0).getServicio().getNombreServicio();
            }
            dto.setServicioNombre(nombreServicio);

            dto.setMonto(t.getMontoTotal());
            dto.setEmpleadoUsername(t.getEmpleado().getUsername());
            transaccionesDTO.add(dto);
        }

        ArqueoDiarioDTO response = new ArqueoDiarioDTO();
        response.setTotalIngresos(totalIngresos);
        response.setTotalTransacciones(totalTransacciones);
        response.setPrimerCobroHora(primerCobroHora);
        response.setUltimoCobroHora(ultimoCobroHora);
        response.setTransacciones(transaccionesDTO);

        return response;
    }

    public List<HistorialTransaccionDTO> getHistorialTransacciones(
            String numOrden,
            String cliente,
            LocalDate fechaDesde,
            LocalDate fechaHasta) {

        List<Transaccion> transacciones;
        LocalDateTime inicio = fechaDesde != null ? fechaDesde.atStartOfDay() : null;
        LocalDateTime fin = fechaHasta != null ? fechaHasta.atTime(23, 59, 59) : null;

        boolean tieneNumOrden = numOrden != null && !numOrden.isEmpty();
        boolean tieneCliente = cliente != null && !cliente.isEmpty();
        boolean tieneFechas = inicio != null && fin != null;

        if (tieneCliente && tieneNumOrden && tieneFechas) {
            transacciones = transaccionRepository
                    .findByClienteAndNumOrdenAndFechaHoraTransaccionBetween(
                            cliente, numOrden, inicio, fin);
        }

        else if (tieneCliente && tieneFechas) {
            transacciones = transaccionRepository
                    .findByClienteNombreContainingIgnoreCaseAndFechaHoraTransaccionBetween(
                            cliente, inicio, fin);
        }

        else if (tieneCliente) {
            transacciones = transaccionRepository
                    .findByClienteNombreContainingIgnoreCase(cliente);
        }

        else if (tieneNumOrden && tieneFechas) {
            transacciones = transaccionRepository
                    .findByOrdenNumOrdenContainingIgnoreCaseAndFechaHoraTransaccionBetween(
                            numOrden, inicio, fin);
        }

        else if (tieneNumOrden) {
            transacciones = transaccionRepository
                    .findByOrdenNumOrdenContainingIgnoreCase(numOrden);
        }

        else if (tieneFechas) {
            transacciones = transaccionRepository
                    .findByFechaHoraTransaccionBetween(inicio, fin);
        }

        else {
            transacciones = transaccionRepository.findAll();
        }

        return transacciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    private HistorialTransaccionDTO convertirADTO(Transaccion t) {
        HistorialTransaccionDTO dto = new HistorialTransaccionDTO();

        dto.setFecha(t.getFechaHoraTransaccion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        dto.setHora(t.getFechaHoraTransaccion().format(DateTimeFormatter.ofPattern("hh:mm a")));
        dto.setNumOrden(t.getOrden().getNumOrden());

        String nombresServicios = "";
        if (t.getOrden().getOrdenServicios() != null && !t.getOrden().getOrdenServicios().isEmpty()) {
            nombresServicios = t.getOrden().getOrdenServicios().stream()
                    .map(os -> os.getServicio().getNombreServicio())
                    .collect(Collectors.joining(" + "));
        }
        dto.setServicios(nombresServicios);

        if (t.getOrden().getCliente() != null) {
            dto.setClienteNombre(t.getOrden().getCliente().getNombreCliente());
        } else {
            dto.setClienteNombre("—");
        }

        dto.setMonto(t.getMontoTotal());
        dto.setEmpleadoUsername(t.getEmpleado().getUsername());

        return dto;
    }

    public List<Cliente> buscarClientesPorNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return List.of();
        }
        return clienteRepository.findByNombreClienteContainingIgnoreCase(nombre);
    }

}