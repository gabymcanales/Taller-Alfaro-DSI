package com.taller.clientes;

import com.taller.dto.HistorialServicioDTO;
import com.taller.dto.VehiculoRequestDTO;
import com.taller.dto.VehiculoResponseDTO;
import com.taller.model.Cliente;
import com.taller.model.Orden;
import com.taller.model.Vehiculo;
import com.taller.ordenes.ClienteRepository;
import com.taller.ordenes.OrdenRepository;
import com.taller.ordenes.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ClienteRepository clienteRepository;
    private final OrdenRepository ordenRepository;

    @Transactional
    public VehiculoResponseDTO crearVehiculo(VehiculoRequestDTO request) {

        if (request.getPlaca() == null || request.getPlaca().trim().isEmpty()) {
            throw new RuntimeException("La placa es obligatoria");
        }
        PlacaValidator.validar(request.getPlaca());
        if (request.getMarca() == null || request.getMarca().trim().isEmpty()) {
            throw new RuntimeException("La marca es obligatoria");
        }
        if (request.getModelo() == null || request.getModelo().trim().isEmpty()) {
            throw new RuntimeException("El modelo es obligatorio");
        }
        if (request.getAnio() == null) {
            throw new RuntimeException("El año es obligatorio");
        }
        AnioValidator.validar(request.getAnio());

        Cliente cliente = clienteRepository.findById(request.getIdCliente())
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
        return convertToDTO(vehiculo);
    }

    public List<VehiculoResponseDTO> getVehiculos() {
        return vehiculoRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public VehiculoResponseDTO getVehiculoById(Long id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        return convertToDTO(vehiculo);
    }

    public VehiculoResponseDTO buscarPorPlaca(String placa) {
        Vehiculo vehiculo = vehiculoRepository.findByPlaca(placa.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        return convertToDTO(vehiculo);
    }

    public List<VehiculoResponseDTO> getVehiculosByCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new RuntimeException("Cliente no encontrado");
        }
        return vehiculoRepository.findByClienteId(clienteId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehiculoResponseDTO actualizarVehiculo(Long id, VehiculoRequestDTO request) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Una vez registrado el vehículo, solo el color puede modificarse.
        // Placa, marca, modelo, año y propietario quedan fijos.
        if (request.getColor() == null || request.getColor().trim().isEmpty()) {
            throw new RuntimeException("El color es obligatorio");
        }
        vehiculo.setColor(request.getColor());

        vehiculo = vehiculoRepository.save(vehiculo);
        return convertToDTO(vehiculo);
    }

    @Transactional
    public void eliminarVehiculo(Long id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (!ordenRepository.findByVehiculoId(id).isEmpty()) {
            throw new RuntimeException("No se puede eliminar el vehículo porque tiene órdenes asociadas");
        }

        vehiculoRepository.delete(vehiculo);
    }

    private VehiculoResponseDTO convertToDTO(Vehiculo vehiculo) {
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

    public List<HistorialServicioDTO> getHistorialServicios(Long vehiculoId) {

        Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        List<Orden> ordenes = vehiculo.getOrdenes();

        if (ordenes.isEmpty()) {
            throw new RuntimeException("El vehículo no tiene historial de servicios");
        }

        return ordenes.stream()
                .map(this::convertToHistorialDTO)
                .sorted((o1, o2) -> o2.getFechaHoraOrden().compareTo(o1.getFechaHoraOrden()))
                .collect(Collectors.toList());
    }

    private HistorialServicioDTO convertToHistorialDTO(Orden orden) {
        HistorialServicioDTO dto = new HistorialServicioDTO();
        dto.setIdOrden(orden.getIdOrden());
        dto.setNumOrden(orden.getNumOrden());
        dto.setFechaHoraOrden(orden.getFechaHoraOrden());

        String nombreServicios = orden.getOrdenServicios().stream()
                .map(os -> os.getServicio().getNombreServicio())
                .collect(Collectors.joining(" + "));
        dto.setServicio(nombreServicios);

        if (!orden.getOrdenServicios().isEmpty()) {
            dto.setEmpleado(orden.getOrdenServicios().get(0).getEmpleado().getNombreEmpleado());
        } else {
            dto.setEmpleado("—");
        }

        dto.setMonto(orden.getPrecioFinal() != null ? orden.getPrecioFinal() : orden.getTotalCalculadoOrden());
        dto.setEstado(orden.getEstadoOrden());

        return dto;
    }

    public long getTotalVehiculos() {
        return vehiculoRepository.count();
    }

    public long getTotalClientesConVehiculos() {
        return vehiculoRepository.findAll().stream()
                .map(Vehiculo::getCliente)
                .filter(Objects::nonNull)
                .map(Cliente::getIdCliente)
                .distinct()
                .count();
    }
}