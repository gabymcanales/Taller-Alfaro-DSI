package com.taller.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ErrorDTO {
    private int status;
    private String mensaje;
    private LocalDateTime timestamp;

    public ErrorDTO(int status, String mensaje) {
        this.status = status;
        this.mensaje = mensaje;
        this.timestamp = LocalDateTime.now();
    }
}