package com.taller.cobros;

import com.taller.model.Cliente;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByTelefonoCliente(String telefonoCliente);

    List<Cliente> findByNombreClienteContainingIgnoreCase(String nombre);
}