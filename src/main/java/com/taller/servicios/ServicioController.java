package com.taller.servicios;

import com.taller.model.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<Servicio>> obtenerTodos() {
        return ResponseEntity.ok(servicioService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<?> guardar(
            @Valid @RequestBody Servicio servicio) {

        try {
            Servicio guardado = servicioService.guardar(servicio);
            return ResponseEntity.ok(guardado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Servicio servicio) {

        try {
            Servicio actualizado = servicioService.actualizar(id, servicio);

            return ResponseEntity.ok(actualizado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {

        try {
            servicioService.eliminar(id);
            return ResponseEntity.ok().build();

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}