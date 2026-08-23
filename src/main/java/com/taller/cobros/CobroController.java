package com.taller.cobros;

import com.taller.ordenes.OrdenService;
import com.taller.dto.RegistroCobroRequest;
import com.taller.dto.RegistroCobroResponse;
import com.taller.model.Cliente;
import com.taller.model.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.taller.dto.ArqueoDiarioDTO;
import com.taller.dto.CobroRequest;
import com.taller.dto.HistorialTransaccionDTO;
import com.taller.dto.OrdenResponseDTO;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cobros")
@RequiredArgsConstructor
public class CobroController {

    private final CobrosService cobrosService;
    private final OrdenService ordenService;

    @PostMapping("/registrar")
    public ResponseEntity<RegistroCobroResponse> registrarCobro(
            @RequestBody RegistroCobroRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        RegistroCobroResponse response = cobrosService.registrarCobro(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/servicios")
    public ResponseEntity<List<Servicio>> listarServicios() {
        return ResponseEntity.ok(cobrosService.listarServicios());
    }

    @GetMapping("/arqueo")
    public ResponseEntity<ArqueoDiarioDTO> getArqueoDiario() {
        return ResponseEntity.ok(cobrosService.getArqueoDiario());
    }

    @GetMapping("/historial")
    public ResponseEntity<List<HistorialTransaccionDTO>> getHistorial(
            @RequestParam(required = false) String numOrden,
            @RequestParam(required = false) String cliente,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta) {
        List<HistorialTransaccionDTO> historial = cobrosService.getHistorialTransacciones(
                numOrden, cliente, fechaDesde, fechaHasta);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<Cliente>> buscarClientes(@RequestParam String nombre) {
        List<Cliente> clientes = cobrosService.buscarClientesPorNombre(nombre);
        return ResponseEntity.ok(clientes);
    }

    @PostMapping("/{id}/cobrar")
    public ResponseEntity<OrdenResponseDTO> cobrarOrden(
            @PathVariable Long id,
            @RequestBody CobroRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ordenService.cobrarOrden(id, request, username));
    }
}