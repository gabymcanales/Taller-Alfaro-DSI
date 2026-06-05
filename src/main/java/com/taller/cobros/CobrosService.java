package com.taller.cobros;

import com.taller.dto.RegistroCobroRequest;
import com.taller.dto.RegistroCobroResponse;
import com.taller.exception.*;
import com.taller.model.*;
import com.taller.ordenes.OrdenRepository;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taller.dto.ArqueoDiarioDTO;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CobrosService {

    private final TransaccionRepository transaccionRepository;
    private final OrdenRepository ordenRepository;
    private final ServicioRepository servicioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final OrdenServicioRepository ordenServicioRepository;

    private static final Long CLIENTE_FIJO_ID = 1L;

    @Transactional
    public RegistroCobroResponse registrarCobro(RegistroCobroRequest request, String usernameEmpleado) {

        // 1. Validar servicio
        Servicio servicio = servicioRepository.findById(request.getIdServicio())
                .orElseThrow(() -> new ServicioNoEncontradoException(request.getIdServicio()));

        // 2. Validar cliente fijo
        Cliente cliente = clienteRepository.findById(CLIENTE_FIJO_ID)
                .orElseThrow(() -> new ClienteNoEncontradoException(CLIENTE_FIJO_ID));

        // 3. Validar monto
        if (request.getMontoRecibido().compareTo(request.getMontoTotal()) < 0) {
            throw new MontoInsuficienteException();
        }

        // 4. Validar empleado
        Empleado empleado = empleadoRepository.findByUsername(usernameEmpleado)
                .orElseThrow(() -> new EmpleadoNoEncontradoException(usernameEmpleado));

        // 5. Calcular cambio
        BigDecimal cambio = request.getMontoRecibido().subtract(request.getMontoTotal());

        // 6. Crear orden
        Orden orden = new Orden();
        orden.setCliente(cliente);
        orden.setEmpleado(empleado);
        orden.setTotalCalculadoOrden(request.getMontoTotal());
        orden.setEstadoOrden("FINALIZADO");
        orden.setFechaHoraOrden(LocalDateTime.now());
        orden.setNumOrden(generarNumeroOrden());
        orden = ordenRepository.save(orden);

        // 7. Crear la relación orden-servicio
        OrdenServicio ordenServicio = new OrdenServicio();
        OrdenServicioId ordenServicioId = new OrdenServicioId();
        ordenServicioId.setIdOrden(orden.getIdOrden());
        ordenServicioId.setIdServicio(request.getIdServicio());
        ordenServicio.setId(ordenServicioId);
        ordenServicio.setOrden(orden);
        ordenServicio.setServicio(servicio);
        ordenServicio.setPrecioAplicado(request.getMontoTotal());
        ordenServicioRepository.save(ordenServicio);

        // 8. Crear transacción
        Transaccion transaccion = new Transaccion();
        transaccion.setOrden(orden);
        transaccion.setMontoTotal(request.getMontoTotal());
        transaccion.setMontoRecibido(request.getMontoRecibido());
        transaccion.setCambio(cambio);
        transaccion.setFechaHoraTransaccion(LocalDateTime.now());
        transaccion.setEmpleado(empleado);
        transaccion = transaccionRepository.save(transaccion);

        // 9. Cambiar orden a ENTREGADO
        orden.setEstadoOrden("ENTREGADO");
        ordenRepository.save(orden);

        // 10. Retornar respuesta
        return mapearARespuesta(transaccion, orden, cliente, servicio, empleado, cambio);
    }

    private String generarNumeroOrden() {
    LocalDate hoy = LocalDate.now();
    LocalDateTime inicioDia = hoy.atStartOfDay();
    LocalDateTime finDia = hoy.atTime(23, 59, 59);
    
    
    long count = ordenRepository.countByFechaHoraOrdenBetween(inicioDia, finDia);
    
    
    return String.format("ORD-%03d", count + 1);
}

    private RegistroCobroResponse mapearARespuesta(Transaccion transaccion, Orden orden,
            Cliente cliente, Servicio servicio,
            Empleado empleado, BigDecimal cambio) {
        RegistroCobroResponse response = new RegistroCobroResponse();
        response.setOrdenId(orden.getIdOrden());
        response.setNumOrden(orden.getNumOrden());
        response.setClienteNombre(cliente.getNombreCliente());
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

        List<Transaccion> transacciones = transaccionRepository.findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(inicioDia, finDia);

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

}