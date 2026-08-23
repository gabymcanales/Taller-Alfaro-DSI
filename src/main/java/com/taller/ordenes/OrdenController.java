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

   
    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialEstadoDTO>> getHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.getHistorial(id));
    }
}