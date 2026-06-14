package com.taller.cierres;

import com.taller.dto.CierreDiarioRequest;
import com.taller.dto.CierreDiarioResponse;
import com.taller.model.Empleado;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.taller.dto.CierreMensualRequest;
import com.taller.dto.CierreMensualResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/cierres")
@RequiredArgsConstructor
public class CierreController {

    private final CierreService cierreService;
    private final EmpleadoRepository empleadoRepository;

    @PostMapping("/diario")
    public ResponseEntity<CierreDiarioResponse> realizarCierreDiario(
            @RequestBody CierreDiarioRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        var cierre = cierreService.realizarCierreDiario(request.getMontoFisico(), empleado);

        CierreDiarioResponse response = new CierreDiarioResponse();
        response.setIdCierreDiario(cierre.getIdCierreDiario());
        response.setFechaCierre(cierre.getFechaCierre());
        response.setHoraCierre(cierre.getHoraCierre());
        response.setMontoEsperado(cierre.getMontoEsperado());
        response.setMontoFisico(cierre.getMontoFisico());
        response.setDiferencia(cierre.getDiferencia().abs());
        response.setTipoDiferencia(
                cierre.getDiferencia().compareTo(BigDecimal.ZERO) > 0 ? "SOBRANTE"
                        : cierre.getDiferencia().compareTo(BigDecimal.ZERO) < 0 ? "FALTANTE" : "IGUAL");
        response.setCerrado(cierre.getCerrado());
        response.setEmpleadoUsername(empleado.getUsername());

        String mensaje;
        if (response.getTipoDiferencia().equals("SOBRANTE")) {
            mensaje = "Cierre completado. Sobrante: $" + response.getDiferencia();
        } else if (response.getTipoDiferencia().equals("FALTANTE")) {
            mensaje = "Cierre completado. Faltante: $" + response.getDiferencia();
        } else {
            mensaje = "Cierre completado. Todo en orden.";
        }
        response.setMensaje(mensaje);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/diario")
    public ResponseEntity<CierreDiarioResponse> obtenerCierreDelDia() {
        LocalDate hoy = LocalDate.now();

        // Buscar si existe un cierre para hoy
        var cierreExistente = cierreService.getCierrePorFechaSinExcepcion(hoy);

        if (cierreExistente != null) {
            // Si existe cierre, devolver los datos del cierre
            CierreDiarioResponse response = new CierreDiarioResponse();
            response.setIdCierreDiario(cierreExistente.getIdCierreDiario());
            response.setFechaCierre(cierreExistente.getFechaCierre());
            response.setHoraCierre(cierreExistente.getHoraCierre());
            response.setMontoEsperado(cierreExistente.getMontoEsperado());
            response.setMontoFisico(cierreExistente.getMontoFisico());
            response.setDiferencia(cierreExistente.getDiferencia().abs());
            response.setTipoDiferencia(
                    cierreExistente.getDiferencia().compareTo(BigDecimal.ZERO) > 0 ? "SOBRANTE"
                            : cierreExistente.getDiferencia().compareTo(BigDecimal.ZERO) < 0 ? "FALTANTE" : "IGUAL");
            response.setCerrado(cierreExistente.getCerrado());
            response.setEmpleadoUsername(cierreExistente.getEmpleado().getUsername());
            return ResponseEntity.ok(response);
        } else {
            // Si no hay cierre, devolver solo el total esperado del día
            BigDecimal totalEsperado = cierreService.calcularTotalEsperadoDelDia(hoy);

            CierreDiarioResponse response = new CierreDiarioResponse();
            response.setMontoEsperado(totalEsperado);
            response.setCerrado(false);
            response.setMensaje("Aún no hay cierre para hoy. Total esperado: $" + totalEsperado);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/mensual")
    public ResponseEntity<CierreMensualResponse> realizarCierreMensual(
            @RequestBody CierreMensualRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        var cierre = cierreService.realizarCierreMensual(request.getMes(), request.getAnio(), empleado);

        CierreMensualResponse response = new CierreMensualResponse();
        response.setIdCierreMensual(cierre.getIdCierreMensual());
        response.setMes(cierre.getMes());
        response.setAnio(cierre.getAnio());
        response.setMontoTotal(cierre.getMontoTotal());
        response.setFechaCierre(cierre.getFechaCierre());
        response.setCerrado(cierre.getCerrado());
        response.setEmpleadoUsername(empleado.getUsername());
        response.setMensaje("Cierre mensual completado. Total: $" + cierre.getMontoTotal());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/mensual")
    public ResponseEntity<CierreMensualResponse> obtenerCierrePorMes(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {
        var cierre = cierreService.getCierrePorMes(mes, anio);

        CierreMensualResponse response = new CierreMensualResponse();
        response.setIdCierreMensual(cierre.getIdCierreMensual());
        response.setMes(cierre.getMes());
        response.setAnio(cierre.getAnio());
        response.setMontoTotal(cierre.getMontoTotal());
        response.setFechaCierre(cierre.getFechaCierre());
        response.setCerrado(cierre.getCerrado());
        response.setEmpleadoUsername(cierre.getEmpleado().getUsername());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/mensual/total")
    public ResponseEntity<BigDecimal> getTotalVentasMes(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {
        return ResponseEntity.ok(cierreService.getTotalVentasMes(mes, anio));
    }
}