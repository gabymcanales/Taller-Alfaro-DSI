package com.taller.clientes;

import com.taller.dto.ClienteRequestDTO;
import com.taller.dto.ClienteResponseDTO;
import com.taller.model.Cliente;
import com.taller.ordenes.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDTO crearCliente(ClienteRequestDTO request) {
        if (request.getNombreCliente() == null || request.getNombreCliente().trim().isEmpty()) {
            throw new RuntimeException("El nombre del cliente es obligatorio");
        }

        Cliente cliente = new Cliente();
        cliente.setNombreCliente(request.getNombreCliente());
        cliente.setTelefonoCliente(request.getTelefonoCliente());

        cliente = clienteRepository.save(cliente);
        return convertToDTO(cliente);
    }

    public List<ClienteResponseDTO> getClientes() {
        return clienteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ClienteResponseDTO getClienteById(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return convertToDTO(cliente);
    }

    @Transactional
    public ClienteResponseDTO actualizarCliente(Long id, ClienteRequestDTO request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (request.getNombreCliente() != null && !request.getNombreCliente().trim().isEmpty()) {
            cliente.setNombreCliente(request.getNombreCliente());
        }
        if (request.getTelefonoCliente() != null) {
            cliente.setTelefonoCliente(request.getTelefonoCliente());
        }

        cliente = clienteRepository.save(cliente);
        return convertToDTO(cliente);
    }

    @Transactional
    public void eliminarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        clienteRepository.delete(cliente);
    }

    private ClienteResponseDTO convertToDTO(Cliente cliente) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setIdCliente(cliente.getIdCliente());
        dto.setNombreCliente(cliente.getNombreCliente());
        dto.setTelefonoCliente(cliente.getTelefonoCliente());
        return dto;
    }

    public List<ClienteResponseDTO> buscarClientesPorNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return List.of();
        }
        return clienteRepository.findByNombreClienteContainingIgnoreCase(nombre).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}