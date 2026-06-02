package com.taller;

import com.taller.model.Empleado;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@RequiredArgsConstructor
public class TallerAlfaroApplication {

    public static void main(String[] args) {
        SpringApplication.run(TallerAlfaroApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(EmpleadoRepository empleadoRepository,
                                PasswordEncoder passwordEncoder) {
        return args -> {
            if (empleadoRepository.findByUsername("admin").isEmpty()) {
                Empleado admin = new Empleado();
                admin.setNombreEmpleado("Administrador");
                admin.setRolEmpleado("ADMINISTRADOR");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                empleadoRepository.save(admin);
                System.out.println(">>> Admin creado con contraseña: admin123");
            }
        };
    }
}