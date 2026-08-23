package com.taller.empleados;

import com.taller.cobros.ServicioRepository;
import com.taller.dto.EmpleadoDTO;
import com.taller.dto.EmpleadoRequest;
import com.taller.exception.EmpleadoNoEncontradoException;
import com.taller.exception.UsernameYaExisteException;
import com.taller.model.Empleado;
import com.taller.model.Servicio;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final ServicioRepository servicioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmpleadoDTO> obtenerTodos() {
        return empleadoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmpleadoDTO crear(EmpleadoRequest request) {
        validarCamposObligatorios(request, true);

        if (empleadoRepository.existsByUsername(request.getUsername())) {
            throw new UsernameYaExisteException(request.getUsername());
        }

        Empleado empleado = new Empleado();
        empleado.setNombreEmpleado(request.getNombreEmpleado());
        empleado.setUsername(request.getUsername());
        empleado.setPassword(passwordEncoder.encode(request.getPassword()));
        empleado.setRolEmpleado(request.getRolEmpleado());
        empleado.setActivo(true);
        empleado.setServicios(resolverServicios(request.getServicioIds()));

        return toDTO(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoDTO actualizar(Long id, EmpleadoRequest request) {
        validarCamposObligatorios(request, false);

        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new EmpleadoNoEncontradoException(id));

        if (empleadoRepository.existsByUsernameAndIdEmpleadoNot(request.getUsername(), id)) {
            throw new UsernameYaExisteException(request.getUsername());
        }

        empleado.setNombreEmpleado(request.getNombreEmpleado());
        empleado.setUsername(request.getUsername());
        empleado.setRolEmpleado(request.getRolEmpleado());
        empleado.setServicios(resolverServicios(request.getServicioIds()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            empleado.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toDTO(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoDTO cambiarEstado(Long id, boolean activo) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new EmpleadoNoEncontradoException(id));
        empleado.setActivo(activo);
        return toDTO(empleadoRepository.save(empleado));
    }

    private void validarCamposObligatorios(EmpleadoRequest request, boolean esCreacion) {
        if (request.getNombreEmpleado() == null || request.getNombreEmpleado().isBlank()) {
            throw new IllegalArgumentException("El nombre del empleado es obligatorio");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }
        if (request.getRolEmpleado() == null || request.getRolEmpleado().isBlank()) {
            throw new IllegalArgumentException("El rol del empleado es obligatorio");
        }
        if (esCreacion && (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
    }

    private List<Servicio> resolverServicios(List<Long> servicioIds) {
        if (servicioIds == null || servicioIds.isEmpty()) {
            return new ArrayList<>();
        }
        return servicioIds.stream()
                .map(servicioRepository::getReferenceById)
                .collect(Collectors.toList());
    }

    private EmpleadoDTO toDTO(Empleado empleado) {
        EmpleadoDTO dto = new EmpleadoDTO();
        dto.setIdEmpleado(empleado.getIdEmpleado());
        dto.setNombreEmpleado(empleado.getNombreEmpleado());
        dto.setUsername(empleado.getUsername());
        dto.setRolEmpleado(empleado.getRolEmpleado());
        dto.setActivo(empleado.getActivo());
        dto.setServicios(empleadoRepository.findServiciosResumenByEmpleadoId(empleado.getIdEmpleado()));
        return dto;
    }
}
