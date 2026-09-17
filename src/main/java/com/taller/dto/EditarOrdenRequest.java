package com.taller.dto;

import lombok.Data;
import java.util.List;

@Data
public class EditarOrdenRequest {
    private List<OrdenRequestDTO.ServicioAsignadoDTO> servicios;
}
