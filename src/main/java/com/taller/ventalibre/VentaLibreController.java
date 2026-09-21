package com.taller.ventalibre;

import com.taller.dto.VentaLibreRequestDTO;
import com.taller.dto.VentaLibreResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas-libres")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class VentaLibreController {

    private final VentaLibreService ventaLibreService;

    @PostMapping
    public ResponseEntity<VentaLibreResponseDTO> registrarVenta(
            @RequestBody VentaLibreRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ventaLibreService.registrarVenta(request, username));
    }
}
