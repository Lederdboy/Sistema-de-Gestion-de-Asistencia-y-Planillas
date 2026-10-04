package com.sistema.planillas.repository;

import com.sistema.planillas.entity.AuditoriaAccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaAccionRepository extends JpaRepository<AuditoriaAccion, Long> {
    Page<AuditoriaAccion> findByEntidadAndEntidadIdOrderByCreatedAtDesc(String entidad, Long entidadId, Pageable pageable);
    Page<AuditoriaAccion> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
