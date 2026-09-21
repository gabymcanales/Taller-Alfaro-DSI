package com.taller.ventalibre;

import com.taller.cobros.TransaccionRepository;
import com.taller.dto.ProductoUsadoDTO;
import com.taller.dto.VentaLibreRequestDTO;
import com.taller.dto.VentaLibreResponseDTO;
import com.taller.inventario.InventarioService;
import com.taller.inventario.ProductoRepository;
import com.taller.model.*;
import com.taller.ordenes.ClienteRepository;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaLibreService {

    private final VentaLibreRepository ventaLibreRepository;
    private final DetalleVentaLibreRepository detalleVentaLibreRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TransaccionRepository transaccionRepository;
    private final InventarioService inventarioService;

    @Transactional
    public VentaLibreResponseDTO registrarVenta(VentaLibreRequestDTO request, String username) {

        if (request.getProductos() == null || request.getProductos().isEmpty()) {
            throw new RuntimeException("Debe agregar al menos un producto");
        }

        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        Cliente cliente = null;
        if (request.getIdCliente() != null) {
            cliente = clienteRepository.findById(request.getIdCliente())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        }

        VentaLibre venta = new VentaLibre();
        venta.setNumVenta(generarNumeroVenta());
        venta.setFechaHoraVenta(LocalDateTime.now());
        venta.setCliente(cliente);
        venta.setEmpleado(empleado);
        venta.setSubtotal(BigDecimal.ZERO);
        venta.setTotal(BigDecimal.ZERO);
        venta = ventaLibreRepository.save(venta);

        BigDecimal total = BigDecimal.ZERO;
        List<DetalleVentaLibre> detallesGuardados = new ArrayList<>();

        for (ProductoUsadoDTO productoReq : request.getProductos()) {
            if (productoReq.getIdProducto() == null) {
                throw new RuntimeException("Debe seleccionar un producto");
            }
            if (productoReq.getCantidad() == null || productoReq.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a 0");
            }

            Producto producto = productoRepository.findById(productoReq.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (!"ACTIVO".equalsIgnoreCase(producto.getEstado())) {
                throw new RuntimeException("El producto " + producto.getNombre() + " está INACTIVO");
            }

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setEmpleado(empleado);
            movimiento.setTipoMovimiento("VENTA");
            movimiento.setCantidad(productoReq.getCantidad());
            movimiento.setMotivo("Venta libre " + venta.getNumVenta());
            movimiento.setVentaLibre(venta);
            inventarioService.registrarMovimiento(movimiento);

            BigDecimal subtotalLinea = producto.getPrecio().multiply(BigDecimal.valueOf(productoReq.getCantidad()));

            DetalleVentaLibre detalle = new DetalleVentaLibre();
            detalle.setVentaLibre(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(productoReq.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotalLinea);
            detalle = detalleVentaLibreRepository.save(detalle);
            detallesGuardados.add(detalle);

            total = total.add(subtotalLinea);
        }

        if (request.getMontoRecibido() == null || request.getMontoRecibido().compareTo(total) < 0) {
            throw new RuntimeException("El monto recibido debe ser mayor o igual al total de la venta");
        }

        venta.setSubtotal(total);
        venta.setTotal(total);
        venta = ventaLibreRepository.save(venta);

        Transaccion transaccion = new Transaccion();
        transaccion.setOrden(null);
        transaccion.setMontoTotal(total);
        transaccion.setMontoRecibido(request.getMontoRecibido());
        transaccion.setCambio(request.getMontoRecibido().subtract(total));
        transaccion.setFechaHoraTransaccion(LocalDateTime.now());
        transaccion.setEmpleado(empleado);
        transaccion.setCierreAsociado(false);
        transaccion.setCierreMensualAsociado(false);
        transaccion = transaccionRepository.save(transaccion);

        venta.setTransaccion(transaccion);
        venta = ventaLibreRepository.save(venta);

        return convertToDTO(venta, detallesGuardados);
    }

    private String generarNumeroVenta() {
        LocalDateTime ahora = LocalDateTime.now();
        String fecha = ahora.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefijo = "VL-" + fecha + "-";

        int siguiente = ventaLibreRepository.findTopByNumVentaStartingWithOrderByNumVentaDesc(prefijo)
                .map(v -> {
                    try {
                        return Integer.parseInt(v.getNumVenta().substring(prefijo.length())) + 1;
                    } catch (NumberFormatException e) {
                        return 1;
                    }
                })
                .orElse(1);

        String numVenta = String.format("%s%03d", prefijo, siguiente);
        while (ventaLibreRepository.existsByNumVenta(numVenta)) {
            siguiente++;
            numVenta = String.format("%s%03d", prefijo, siguiente);
        }

        return numVenta;
    }

    private VentaLibreResponseDTO convertToDTO(VentaLibre venta, List<DetalleVentaLibre> detalles) {
        VentaLibreResponseDTO dto = new VentaLibreResponseDTO();
        dto.setIdVentaLibre(venta.getIdVentaLibre());
        dto.setNumVenta(venta.getNumVenta());
        dto.setFechaHoraVenta(venta.getFechaHoraVenta());
        dto.setClienteNombre(venta.getCliente() != null ? venta.getCliente().getNombreCliente() : null);
        dto.setEmpleadoNombre(venta.getEmpleado().getNombreEmpleado());
        dto.setSubtotal(venta.getSubtotal());
        dto.setTotal(venta.getTotal());

        if (venta.getTransaccion() != null) {
            dto.setMontoRecibido(venta.getTransaccion().getMontoRecibido());
            dto.setCambio(venta.getTransaccion().getCambio());
        }

        dto.setDetalles(detalles.stream().map(d -> {
            VentaLibreResponseDTO.DetalleVentaLibreDTO detalleDTO = new VentaLibreResponseDTO.DetalleVentaLibreDTO();
            detalleDTO.setIdProducto(d.getProducto().getIdProducto());
            detalleDTO.setNombreProducto(d.getProducto().getNombre());
            detalleDTO.setCantidad(d.getCantidad());
            detalleDTO.setPrecioUnitario(d.getPrecioUnitario());
            detalleDTO.setSubtotal(d.getSubtotal());
            return detalleDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
}
