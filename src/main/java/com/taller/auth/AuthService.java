package com.taller.auth;

import com.taller.model.Empleado;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmpleadoRepository empleadoRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public String login(String username, String password) {
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, empleado.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (Boolean.FALSE.equals(empleado.getActivo())) {
            throw new RuntimeException("El empleado está inhabilitado");
        }

        return jwtUtil.generateToken(empleado.getUsername(), empleado.getRolEmpleado());
    }
}