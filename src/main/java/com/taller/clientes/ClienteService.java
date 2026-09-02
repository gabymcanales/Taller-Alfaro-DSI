package com.taller.clientes;

import com.taller.dto.ClienteRequestDTO;
import com.taller.dto.ClienteResponseDTO;
import com.taller.dto.VehiculoRequestDTO;
import com.taller.dto.VehiculoResponseDTO;
import com.taller.model.Cliente;
import com.taller.model.Vehiculo;
import com.taller.ordenes.ClienteRepository;
import com.taller.ordenes.OrdenRepository;
import com.taller.ordenes.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final OrdenRepository ordenRepository;

    @Transactional
    public ClienteResponseDTO crearCliente(ClienteRequestDTO request) {
        if (request.getNombreCliente() == null || request.getNombreCliente().trim().isEmpty()) {
            throw new RuntimeException("El nombre del cliente es obligatorio");
        }

        
        ClienteRequestDTO.VehiculoDataDTO vehiculoData = request.getVehiculo();
        if (vehiculoData == null) {
            throw new RuntimeException("Debe registrar al menos un vehículo junto con el cliente");
        }
        if (vehiculoData.getPlaca() == null || vehiculoData.getPlaca().trim().isEmpty()) {
            throw new RuntimeException("La placa del vehículo es obligatoria");
        }
        if (vehiculoData.getMarca() == null || vehiculoData.getMarca().trim().isEmpty()) {
            throw new RuntimeException("La marca del vehículo es obligatoria");
        }
        if (vehiculoData.getModelo() == null || vehiculoData.getModelo().trim().isEmpty()) {
            throw new RuntimeException("El modelo del vehículo es obligatorio");
        }
        if (vehiculoData.getAnio() == null) {
            throw new RuntimeException("El año del vehículo es obligatorio");
        }
        if (vehiculoRepository.existsByPlaca(vehiculoData.getPlaca())) {
            throw new RuntimeException("Ya existe un vehículo con la placa " + vehiculoData.getPlaca());
        }

        Cliente cliente = new Cliente();
        cliente.setNombreCliente(request.getNombreCliente());
        cliente.setTelefonoCliente(request.getTelefonoCliente());
        cliente = clienteRepository.save(cliente);

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(vehiculoData.getPlaca().toUpperCase());
        vehiculo.setMarca(vehiculoData.getMarca());
        vehiculo.setModelo(vehiculoData.getModelo());
        vehiculo.setAnio(vehiculoData.getAnio());
        vehiculo.setColor(vehiculoData.getColor());
        vehiculo.setCliente(cliente);
        vehiculoRepository.save(vehiculo);

        cliente = clienteRepository.findByIdWithVehiculos(cliente.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        return convertToDTO(cliente);
    }

    public List<ClienteResponseDTO> getClientes() {
        return clienteRepository.findAllWithVehiculos().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ClienteResponseDTO getClienteById(Long id) {
        Cliente cliente = clienteRepository.findByIdWithVehiculos(id)
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

        if (cliente.getVehiculos() != null && !cliente.getVehiculos().isEmpty()) {
            List<ClienteResponseDTO.VehiculoInfoDTO> vehiculosDTO = cliente.getVehiculos().stream()
                    .map(v -> {
                        ClienteResponseDTO.VehiculoInfoDTO vDto = new ClienteResponseDTO.VehiculoInfoDTO();
                        vDto.setIdVehiculo(v.getIdVehiculo());
                        vDto.setPlaca(v.getPlaca());
                        vDto.setMarca(v.getMarca());
                        vDto.setModelo(v.getModelo());
                        vDto.setAnio(v.getAnio());
                        vDto.setColor(v.getColor());
                        return vDto;
                    })
                    .collect(Collectors.toList());
            dto.setVehiculos(vehiculosDTO);
        }

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

    public Map<String, Object> getEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClientes", clienteRepository.count());
        stats.put("totalVehiculos", vehiculoRepository.count());
        stats.put("nuevosEsteMes", 0);
        stats.put("ordenesActivas", ordenRepository.countByEstadoIn(List.of("PENDIENTE", "EN_PROCESO")));
        return stats;
    }

    @Transactional
    public VehiculoResponseDTO agregarVehiculo(Long clienteId, VehiculoRequestDTO request) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (vehiculoRepository.existsByPlaca(request.getPlaca())) {
            throw new RuntimeException("Ya existe un vehículo con la placa " + request.getPlaca());
        }

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(request.getPlaca().toUpperCase());
        vehiculo.setMarca(request.getMarca());
        vehiculo.setModelo(request.getModelo());
        vehiculo.setAnio(request.getAnio());
        vehiculo.setColor(request.getColor());
        vehiculo.setCliente(cliente);

        vehiculo = vehiculoRepository.save(vehiculo);

        VehiculoResponseDTO dto = new VehiculoResponseDTO();
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        dto.setAnio(vehiculo.getAnio());
        dto.setColor(vehiculo.getColor());

        if (vehiculo.getCliente() != null) {
            VehiculoResponseDTO.ClienteInfoDTO clienteDTO = new VehiculoResponseDTO.ClienteInfoDTO();
            clienteDTO.setIdCliente(vehiculo.getCliente().getIdCliente());
            clienteDTO.setNombreCliente(vehiculo.getCliente().getNombreCliente());
            clienteDTO.setTelefonoCliente(vehiculo.getCliente().getTelefonoCliente());
            dto.setCliente(clienteDTO);
        }

        return dto;
    }
}