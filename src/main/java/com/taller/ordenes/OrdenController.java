package com.taller.ordenes;

import com.taller.dto.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;


    @PostMapping
    public ResponseEntity<OrdenResponseDTO> crearOrden(@RequestBody OrdenRequestDTO request) {
        return ResponseEntity.ok(ordenService.crearOrden(request));
    }

    @GetMapping
    public ResponseEntity<List<OrdenResponseDTO>> getOrdenes() {
        return ResponseEntity.ok(ordenService.getOrdenes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponseDTO> getOrdenById(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.getOrdenById(id));
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialEstadoDTO>> getHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.getHistorial(id));
    }

    @PostMapping("/{id}/cobrar")
    public ResponseEntity<Void> cobrarOrden(@PathVariable Long id) {
        ordenService.cobrarOrden(id);
        return ResponseEntity.ok().build();
    }

   
    @GetMapping("/mis-servicios")
    public ResponseEntity<List<OrdenServicioDTO>> getMisServicios(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.getMisServicios(username));
    }

    @PutMapping("/{idOrden}/servicios/{idServicio}/estado")
    public ResponseEntity<Void> updateEstadoServicio(
            @PathVariable Long idOrden,
            @PathVariable Long idServicio,
            @RequestBody EstadoRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        ordenService.updateEstadoServicio(idOrden, idServicio, request.getEstado(),
                request.getComentario(), username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{idOrden}/servicios/{idServicio}/precio")
    public ResponseEntity<Void> updatePrecioServicio(
            @PathVariable Long idOrden,
            @PathVariable Long idServicio,
            @RequestBody PrecioRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        ordenService.updatePrecioServicio(idOrden, idServicio, request.getPrecioAplicado(), username);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class EstadoRequestDTO {
        private String estado;
        private String comentario;
    }

    @Data
    public static class PrecioRequestDTO {
        private BigDecimal precioAplicado;
    }
}