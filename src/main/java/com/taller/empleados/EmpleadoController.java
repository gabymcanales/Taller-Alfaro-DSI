package com.taller.empleados;

import com.taller.dto.EmpleadoDTO;
import com.taller.dto.EmpleadoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    public List<EmpleadoDTO> obtenerTodos() {
        return empleadoService.obtenerTodos();
    }

    @PostMapping
    public EmpleadoDTO crear(@RequestBody EmpleadoRequest request) {
        return empleadoService.crear(request);
    }

    @PutMapping("/{id}")
    public EmpleadoDTO actualizar(@PathVariable Long id, @RequestBody EmpleadoRequest request) {
        return empleadoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public EmpleadoDTO cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        return empleadoService.cambiarEstado(id, activo);
    }
}
