package com.taller.ordenes;

import com.taller.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PostMapping
    public ResponseEntity<OrdenResponseDTO> crearOrden(
            @RequestBody OrdenRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.crearOrden(request, username));
    }

    @GetMapping
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenes() {
        return ResponseEntity.ok(ordenService.getOrdenes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponseDTO> getOrdenById(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.getOrdenById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenesByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ordenService.getOrdenesByCliente(clienteId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenesByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ordenService.getOrdenesByEstado(estado));
    }

    @GetMapping("/servicios/{idServicio}/empleados")
    public ResponseEntity<List<EmpleadoDTO>> getEmpleadosPorServicio(
            @PathVariable Long idServicio) {
        return ResponseEntity.ok(ordenService.getEmpleadosPorServicio(idServicio));
    }

    @PatchMapping("/{idOrden}/servicios/{idServicio}/iniciar")
    public ResponseEntity<OrdenServicioDTO> iniciarServicio(
            @PathVariable Long idOrden,
            @PathVariable Long idServicio,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.iniciarServicio(idOrden, idServicio, username));
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

    @PatchMapping("/{id}/estado")
    public ResponseEntity<OrdenResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.cambiarEstadoOrden(id, estado, username));
    }


    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialEstadoDTO>> getHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.getHistorial(id));
    }
}