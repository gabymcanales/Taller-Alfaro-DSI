package com.taller.ordenes;

import com.taller.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenes() {
        return ResponseEntity.ok(ordenService.getOrdenes());
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Long>> getEstadisticas() {
        return ResponseEntity.ok(ordenService.getEstadisticas());
    }

    @GetMapping("/empleado")
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenesPorEmpleado(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.getOrdenesPorEmpleado(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponseDTO> getOrdenById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ordenService.getOrdenById(id, authentication.getName()));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenesByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ordenService.getOrdenesByCliente(clienteId));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenesByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ordenService.getOrdenesByEstado(estado));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/servicios/{idServicio}/empleados")
    public ResponseEntity<List<EmpleadoDTO>> getEmpleadosPorServicio(
            @PathVariable Long idServicio) {
        return ResponseEntity.ok(ordenService.getEmpleadosPorServicio(idServicio));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<OrdenResponseDTO> crearOrden(
            @RequestBody OrdenRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.crearOrden(request, username));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<OrdenResponseDTO> editarOrden(
            @PathVariable Long id,
            @RequestBody EditarOrdenRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.editarOrden(id, request, username));
    }

    @PatchMapping("/{idOrden}/servicios/{idServicio}/iniciar")
    public ResponseEntity<OrdenServicioDTO> iniciarServicio(
            @PathVariable Long idOrden,
            @PathVariable Long idServicio,
            @RequestBody(required = false) IniciarServicioRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        String comentario = request != null ? request.getComentario() : null;
        return ResponseEntity.ok(ordenService.iniciarServicio(idOrden, idServicio, comentario, username));
    }

    @PatchMapping("/{idOrden}/servicios/{idServicio}/finalizar")
    public ResponseEntity<OrdenServicioDTO> finalizarServicio(
            @PathVariable Long idOrden,
            @PathVariable Long idServicio,
            @RequestBody FinalizarServicioRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.finalizarServicio(idOrden, idServicio, request, username));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<OrdenResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.cambiarEstadoOrden(id, estado, username));
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialEstadoDTO>> getHistorial(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ordenService.getHistorial(id, authentication.getName()));
    }

    @GetMapping("/estadisticas/empleado")
    public ResponseEntity<Map<String, Long>> getEstadisticasPorEmpleado(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.getEstadisticasPorEmpleado(username));
    }

    @GetMapping("/productos-inventario")
    public ResponseEntity<List<ProductoSimpleDTO>> getProductosPorCategoria(@RequestParam String categoria) {
        return ResponseEntity.ok(ordenService.getProductosPorCategoria(categoria));
    }
}