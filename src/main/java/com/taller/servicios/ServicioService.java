package com.taller.servicios;

import com.taller.model.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.taller.cobros.ServicioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public List<Servicio> obtenerTodos() {
        return servicioRepository.findAll();
    }
}