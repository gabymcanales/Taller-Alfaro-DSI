package com.taller.ordenes;

import com.taller.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlaca(String placa);

    @Query("SELECT v FROM Vehiculo v WHERE v.cliente.idCliente = :clienteId")
    List<Vehiculo> findByClienteId(@Param("clienteId") Long clienteId);

    boolean existsByPlaca(String placa);
}