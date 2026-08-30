package com.taller.ordenes;

import com.taller.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByTelefonoCliente(String telefonoCliente);

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.vehiculos WHERE c.idCliente = :id")
    Optional<Cliente> findByIdWithVehiculos(@Param("id") Long id);

    List<Cliente> findByNombreClienteContainingIgnoreCase(String nombre);

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.vehiculos")
    List<Cliente> findAllWithVehiculos();
}