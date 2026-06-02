package com.taller.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Data
@Embeddable
public class OrdenServicioId implements Serializable {

    @Column(name = "id_orden")
    private Long idOrden;

    @Column(name = "id_servicio")
    private Long idServicio;
}