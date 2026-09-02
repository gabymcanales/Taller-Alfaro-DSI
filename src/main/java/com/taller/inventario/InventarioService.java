package com.taller.inventario;

import com.taller.model.MovimientoInventario;
import com.taller.model.Producto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.taller.dto.MovimientoInventarioDTO;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    // =========================
    // PRODUCTOS
    // =========================

    public List<Producto> obtenerProductos() {
        return productoRepository.findAll();
    }

    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(Long id, Producto productoActualizado) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setUnidadMedida(productoActualizado.getUnidadMedida());
        producto.setPrecio(productoActualizado.getPrecio());
        producto.setStockMinimo(productoActualizado.getStockMinimo());
        producto.setEstado(productoActualizado.getEstado());

        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        productoRepository.delete(producto);
    }

    // =========================
    // MOVIMIENTOS
    // =========================

    public List<MovimientoInventarioDTO> obtenerMovimientos() {

        return movimientoInventarioRepository.findAllByOrderByFechaMovimientoDesc()
                .stream()
                .map(movimiento -> {

                    MovimientoInventarioDTO dto = new MovimientoInventarioDTO();

                    dto.setIdMovimiento(movimiento.getIdMovimiento());
                    dto.setProducto(movimiento.getProducto().getNombre());
                    dto.setTipoMovimiento(movimiento.getTipoMovimiento());
                    dto.setCantidad(movimiento.getCantidad());
                    dto.setFechaMovimiento(movimiento.getFechaMovimiento());
                    dto.setEmpleado(movimiento.getEmpleado().getNombreEmpleado());

                    return dto;
                })
                .toList();
    }

    public MovimientoInventario registrarMovimiento(
            MovimientoInventario movimiento) {

        Producto producto = productoRepository.findById(
                movimiento.getProducto().getIdProducto())
                 .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        String tipo = movimiento.getTipoMovimiento().toUpperCase();

        if (!tipo.equals("COMPRA")
                && !tipo.equals("USO")
                && !tipo.equals("VENTA")) {

            throw new RuntimeException(
                    "Tipo de movimiento inválido. Use COMPRA, USO o VENTA");
        }

        int cantidad = movimiento.getCantidad();

        if (tipo.equals("COMPRA")) {
            producto.setStockActual(
                    producto.getStockActual() + cantidad);
        } else {
            if (producto.getStockActual() < cantidad) {
                throw new RuntimeException(
                        "Stock insuficiente para realizar el movimiento");
            }

            producto.setStockActual(
                    producto.getStockActual() - cantidad);
        }

        movimiento.setTipoMovimiento(tipo);

        if (movimiento.getFechaMovimiento() == null) {
            movimiento.setFechaMovimiento(LocalDateTime.now());
        }

        productoRepository.save(producto);

        return movimientoInventarioRepository.save(movimiento);
    }
}