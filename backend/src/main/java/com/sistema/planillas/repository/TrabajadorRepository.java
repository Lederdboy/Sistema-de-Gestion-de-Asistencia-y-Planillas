package com.sistema.planillas.repository;

import com.sistema.planillas.entity.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {

    @Query(value = "SELECT t FROM Trabajador t " +
           "WHERE (:empresaId IS NULL OR t.empresa.id = :empresaId) " +
           "AND (:sedeId IS NULL OR t.sede.id = :sedeId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(t.numeroDocumento) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(t.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(t.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(t.apellidoMaterno) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Trabajador> buscarTrabajadoresPaginado(
            @Param("empresaId") Long empresaId,
            @Param("sedeId") Long sedeId,
            @Param("search") String search,
            Pageable pageable
    );
}
