package com.taller.ordenes;

import com.taller.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByTelefonoCliente(String telefonoCliente);

    List<Cliente> findByNombreClienteContainingIgnoreCase(String nombre);
}   