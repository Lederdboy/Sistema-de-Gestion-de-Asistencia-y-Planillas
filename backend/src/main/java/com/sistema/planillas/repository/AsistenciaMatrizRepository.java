package com.sistema.planillas.repository;

import com.sistema.planillas.entity.AsistenciaMatriz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaMatrizRepository extends JpaRepository<AsistenciaMatriz, Long> {

    @Query("SELECT a FROM AsistenciaMatriz a " +
           "WHERE a.sede.id = :sedeId " +
           "AND a.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<AsistenciaMatriz> findBySedeIdAndFechaBetween(
            @Param("sedeId") Long sedeId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    Optional<AsistenciaMatriz> findByTrabajadorIdAndFecha(Long trabajadorId, LocalDate fecha);
}
