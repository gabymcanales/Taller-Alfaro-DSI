package com.taller.ordenes;

import com.taller.model.OrdenProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenProductoRepository extends JpaRepository<OrdenProducto, Long> {

    @Query("SELECT op FROM OrdenProducto op LEFT JOIN FETCH op.producto WHERE op.orden.idOrden = :idOrden")
    List<OrdenProducto> findByOrdenId(@Param("idOrden") Long idOrden);
}
