package com.taller.clientes;

import com.taller.dto.VehiculoRequestDTO;
import com.taller.dto.VehiculoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoService vehiculoService;


    @PostMapping
    public ResponseEntity<VehiculoResponseDTO> crearVehiculo(@RequestBody VehiculoRequestDTO request) {
        return ResponseEntity.ok(vehiculoService.crearVehiculo(request));
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResponseDTO>> getVehiculos() {
        return ResponseEntity.ok(vehiculoService.getVehiculos());
    }
    
    @GetMapping("/placa")
    public ResponseEntity<VehiculoResponseDTO> buscarPorPlaca(@RequestParam String placa) {
        return ResponseEntity.ok(vehiculoService.buscarPorPlaca(placa));
    }
   
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VehiculoResponseDTO>> getVehiculosByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(vehiculoService.getVehiculosByCliente(clienteId));
    }

   
    @GetMapping("/{id}")
    public ResponseEntity<VehiculoResponseDTO> getVehiculoById(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculoService.getVehiculoById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehiculoResponseDTO> actualizarVehiculo(
            @PathVariable Long id,
            @RequestBody VehiculoRequestDTO request) {
        return ResponseEntity.ok(vehiculoService.actualizarVehiculo(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVehiculo(@PathVariable Long id) {
        vehiculoService.eliminarVehiculo(id);
        return ResponseEntity.ok().build();
    }
}