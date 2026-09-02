package com.taller.cobros;

import com.taller.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    // ========== EXISTENTES ==========
    List<Transaccion> findByFechaHoraTransaccionBetween(
            LocalDateTime inicio,
            LocalDateTime fin);

    List<Transaccion> findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(
            LocalDateTime inicio,
            LocalDateTime fin);

    List<Transaccion> findByFechaHoraTransaccionBetweenAndCierreMensualAsociadoFalse(
            LocalDateTime inicio,
            LocalDateTime fin);

    List<Transaccion> findByOrdenNumOrdenContainingIgnoreCase(String numOrden);

    List<Transaccion> findByOrdenNumOrdenContainingIgnoreCaseAndFechaHoraTransaccionBetween(
            String numOrden,
            LocalDateTime inicio,
            LocalDateTime fin);

    @Query("SELECT t FROM Transaccion t WHERE LOWER(t.orden.cliente.nombreCliente) LIKE LOWER(CONCAT('%', :cliente, '%'))")
    List<Transaccion> findByClienteNombreContainingIgnoreCase(@Param("cliente") String cliente);

    @Query("SELECT t FROM Transaccion t WHERE LOWER(t.orden.cliente.nombreCliente) LIKE LOWER(CONCAT('%', :cliente, '%')) AND t.fechaHoraTransaccion BETWEEN :inicio AND :fin")
    List<Transaccion> findByClienteNombreContainingIgnoreCaseAndFechaHoraTransaccionBetween(
            @Param("cliente") String cliente,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    @Query("SELECT t FROM Transaccion t WHERE LOWER(t.orden.cliente.nombreCliente) LIKE LOWER(CONCAT('%', :cliente, '%')) AND LOWER(t.orden.numOrden) LIKE LOWER(CONCAT('%', :numOrden, '%')) AND t.fechaHoraTransaccion BETWEEN :inicio AND :fin")
    List<Transaccion> findByClienteAndNumOrdenAndFechaHoraTransaccionBetween(
            @Param("cliente") String cliente,
            @Param("numOrden") String numOrden,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}