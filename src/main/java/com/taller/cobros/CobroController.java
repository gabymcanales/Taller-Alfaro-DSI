package com.taller.cobros;

import com.taller.dto.RegistroCobroRequest;
import com.taller.dto.RegistroCobroResponse;
import com.taller.model.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cobros")
@RequiredArgsConstructor
public class CobroController {

    private final CobrosService cobrosService;

    @PostMapping("/registrar")
    public ResponseEntity<RegistroCobroResponse> registrarCobro(
            @RequestBody RegistroCobroRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        RegistroCobroResponse response = cobrosService.registrarCobro(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/servicios")
    public ResponseEntity<List<Servicio>> listarServicios() {
        return ResponseEntity.ok(cobrosService.listarServicios());
    }
}