package com.taller.scheduler;

import com.taller.cierres.CierreDiarioRepository;
import com.taller.cierres.CierreService;
import com.taller.model.Empleado;
import com.taller.ordenes.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CierreAutomaticoScheduler {

    private final CierreDiarioRepository cierreDiarioRepository;
    private final CierreService cierreService;
    private final EmpleadoRepository empleadoRepository;

    
    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void cerrarDiaAutomaticamente() {
        LocalDate hoy = LocalDate.now();
        
        System.out.println(" Ejecutando cierre automático para el día: " + hoy);
        
        
        if (cierreDiarioRepository.existsByFechaCierre(hoy)) {
            System.out.println(" El día " + hoy + " ya tiene cierre. No se ejecuta automático.");
            return;
        }
        
        try {
      
            List<Empleado> empleados = empleadoRepository.findAll();
            if (empleados.isEmpty()) {
                System.err.println(" No hay empleados registrados. No se puede ejecutar cierre automático.");
                return;
            }
            
            Empleado empleadoSistema = empleados.get(0);
            
            
            BigDecimal totalEsperado = cierreService.calcularTotalEsperadoDelDia(hoy);
            
            
            if (totalEsperado.compareTo(BigDecimal.ZERO) == 0) {
                System.out.println(" No hay transacciones en el día " + hoy + ". No se realiza cierre automático.");
                return;
            }
            
            
            cierreService.realizarCierreDiario(totalEsperado, empleadoSistema);
            
            System.out.println(" Cierre automático ejecutado correctamente para el día " + hoy);
            System.out.println("   Total: $" + totalEsperado);
            
        } catch (Exception e) {
            System.err.println(" Error en cierre automático: " + e.getMessage());
            e.printStackTrace();
        }
    }
}