package com.taller.servicios;

import com.taller.model.Servicio;
import com.taller.cobros.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public List<Servicio> obtenerTodos() {
        return servicioRepository.findAll();
    }

    public Servicio guardar(Servicio servicio) {
       
        if ("FIJO".equals(servicio.getTipoPrecio())) {
            if (servicio.getPrecioSugerido() == null || 
                servicio.getPrecioSugerido().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Los servicios fijos deben tener un precio sugerido mayor a 0");
            }
        } else {
           
            servicio.setPrecioSugerido(null);
        }

        return servicioRepository.save(servicio);
    }

    public Servicio actualizar(Long id, Servicio servicioActualizado) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        servicio.setNombreServicio(servicioActualizado.getNombreServicio());
        servicio.setAreaServicio(servicioActualizado.getAreaServicio());
        servicio.setDescripcionServicio(servicioActualizado.getDescripcionServicio());
        servicio.setEstadoServicio(servicioActualizado.getEstadoServicio());
        
        
        servicio.setTipoPrecio(servicioActualizado.getTipoPrecio());
        
        
        if ("FIJO".equals(servicioActualizado.getTipoPrecio())) {
            if (servicioActualizado.getPrecioSugerido() == null || 
                servicioActualizado.getPrecioSugerido().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Los servicios fijos deben tener un precio sugerido mayor a 0");
            }
            servicio.setPrecioSugerido(servicioActualizado.getPrecioSugerido());
        } else {
            servicio.setPrecioSugerido(null);
        }

        return servicioRepository.save(servicio);
    }

    public void eliminar(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        servicioRepository.delete(servicio);
    }
}