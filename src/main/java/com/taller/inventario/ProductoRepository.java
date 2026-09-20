package com.taller.inventario;

import com.taller.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoriaProductoAndEstado(String categoriaProducto, String estado);
}