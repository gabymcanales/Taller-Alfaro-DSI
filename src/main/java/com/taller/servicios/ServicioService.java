package com.taller.servicios;

import com.taller.model.Servicio;
import com.taller.cobros.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public List<Servicio> obtenerTodos() {
        return servicioRepository.findAll();
    }

    public Servicio guardar(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public Servicio actualizar(Long id, Servicio servicioActualizado) {

        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        servicio.setNombreServicio(servicioActualizado.getNombreServicio());
        servicio.setAreaServicio(servicioActualizado.getAreaServicio());
        servicio.setPrecioServicio(servicioActualizado.getPrecioServicio());
        servicio.setDuracionServicio(servicioActualizado.getDuracionServicio());
        servicio.setEstadoServicio(servicioActualizado.getEstadoServicio());

        return servicioRepository.save(servicio);
    }

    public void eliminar(Long id) {

        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        servicioRepository.delete(servicio);
    }
}