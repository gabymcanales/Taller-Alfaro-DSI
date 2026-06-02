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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CobrosService {

    private final TransaccionRepository transaccionRepository;
    private final OrdenRepository ordenRepository;  
    private final ServicioRepository servicioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final Long CLIENTE_FIJO_ID = 1L;

    @Transactional
    public RegistroCobroResponse registrarCobro(RegistroCobroRequest request, String usernameEmpleado) {
        
        // 1. Validar que el servicio existe
        Servicio servicio = servicioRepository.findById(request.getIdServicio())
                .orElseThrow(() -> new ServicioNoEncontradoException(request.getIdServicio()));
        
        // 2. Validar que el cliente fijo existe
        Cliente cliente = clienteRepository.findById(CLIENTE_FIJO_ID)
                .orElseThrow(() -> new ClienteNoEncontradoException(CLIENTE_FIJO_ID));
        
        // 3. Validar monto recibido no sea menor al total a pagar
        if (request.getMontoRecibido().compareTo(request.getMontoTotal()) < 0) {
            throw new MontoInsuficienteException();
        }
        
        // 4. Validar que el empleado existe
        Empleado empleado = empleadoRepository.findByUsername(usernameEmpleado)
                .orElseThrow(() -> new EmpleadoNoEncontradoException(usernameEmpleado));
        
        // 5. Calcular cambio automáticamente
        BigDecimal cambio = request.getMontoRecibido().subtract(request.getMontoTotal());
        
        // 6. Crear orden automáticamente con estado FINALIZADO
        Orden orden = new Orden();
        orden.setCliente(cliente);
        orden.setEmpleado(empleado);
        orden.setTotalCalculadoOrden(request.getMontoTotal());
        orden.setEstadoOrden("FINALIZADO");
        orden.setFechaHoraOrden(LocalDateTime.now());
        orden.setNumOrden(generarNumeroOrden());
        
        orden = ordenRepository.save(orden);
        
        // 7. Crear transacción
        Transaccion transaccion = new Transaccion();
        transaccion.setOrden(orden);
        transaccion.setMontoTotal(request.getMontoTotal());
        transaccion.setMontoRecibido(request.getMontoRecibido());
        transaccion.setCambio(cambio);
        transaccion.setFechaHoraTransaccion(LocalDateTime.now());
        transaccion.setEmpleado(empleado);
        
        transaccion = transaccionRepository.save(transaccion);
        
        // 8. Cambiar orden a ENTREGADO al confirmar cobro
        orden.setEstadoOrden("ENTREGADO");
        ordenRepository.save(orden);
        
        // 9. Retornar DTO
        return mapearARespuesta(transaccion, orden, cliente, servicio, empleado, cambio);
    }
    
    private String generarNumeroOrden() {
    long count = ordenRepository.countByFechaHoraOrdenBetween(
        LocalDate.now().atStartOfDay(),
        LocalDate.now().atTime(23, 59, 59)
    );
    
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
}