package com.sistema.planillas.repository;

import com.sistema.planillas.entity.PlanillaResumen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanillaResumenRepository extends JpaRepository<PlanillaResumen, Long> {
    Optional<PlanillaResumen> findByEmpresaIdAndPeriodo(Long empresaId, String periodo);
    Optional<PlanillaResumen> findByPeriodo(String periodo);
}
