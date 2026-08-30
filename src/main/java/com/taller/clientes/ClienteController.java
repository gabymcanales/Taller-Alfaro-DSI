package com.taller.clientes;

import com.taller.dto.ClienteRequestDTO;
import com.taller.dto.ClienteResponseDTO;
import com.taller.dto.VehiculoRequestDTO;
import com.taller.dto.VehiculoResponseDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> crearCliente(@RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.crearCliente(request));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> getClientes() {
        return ResponseEntity.ok(clienteService.getClientes());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ClienteResponseDTO>> buscarClientes(@RequestParam String nombre) {
        return ResponseEntity.ok(clienteService.buscarClientesPorNombre(nombre));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> getClienteById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.getClienteById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> actualizarCliente(
            @PathVariable Long id,
            @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.actualizarCliente(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> getEstadisticas() {
        return ResponseEntity.ok(clienteService.getEstadisticas());
    }

    @PostMapping("/{id}/vehiculos")
    public ResponseEntity<VehiculoResponseDTO> agregarVehiculo(
            @PathVariable Long id,
            @RequestBody VehiculoRequestDTO request) {
        return ResponseEntity.ok(clienteService.agregarVehiculo(id, request));
    }
}