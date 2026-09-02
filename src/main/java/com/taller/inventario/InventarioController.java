package com.taller.inventario;

import com.taller.model.MovimientoInventario;
import com.taller.model.Producto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.taller.dto.MovimientoInventarioDTO;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    // =========================
    // PRODUCTOS
    // =========================

    @GetMapping("/productos")
    public List<Producto> obtenerProductos() {
        return inventarioService.obtenerProductos();
    }

    @PostMapping("/productos")
    public Producto guardarProducto(
            @Valid @RequestBody Producto producto) {

        return inventarioService.guardarProducto(producto);
    }

    @PutMapping("/productos/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody Producto producto) {

        return inventarioService.actualizarProducto(id, producto);
    }

    @DeleteMapping("/productos/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        inventarioService.eliminarProducto(id);
    }

    // =========================
    // MOVIMIENTOS
    // =========================

    @GetMapping("/movimientos")
    public List<MovimientoInventarioDTO> obtenerMovimientos() {
        return inventarioService.obtenerMovimientos();
    }

    @PostMapping("/movimientos")
    public MovimientoInventario registrarMovimiento(
            @Valid @RequestBody MovimientoInventario movimiento) {

        return inventarioService.registrarMovimiento(movimiento);
    }
}