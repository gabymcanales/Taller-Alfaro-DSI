package com.taller.servicios;

import com.taller.model.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {
    private final ServicioService servicioService;

    @GetMapping
    public List<Servicio> obtenerTodos() {
        return servicioService.obtenerTodos();
    }

    @PostMapping
    public Servicio guardar(@Valid @RequestBody Servicio servicio) {
        return servicioService.guardar(servicio);
    }

    @PutMapping("/{id}")
    public Servicio actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Servicio servicio) {
        return servicioService.actualizar(id, servicio);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        servicioService.eliminar(id);
    }
}
