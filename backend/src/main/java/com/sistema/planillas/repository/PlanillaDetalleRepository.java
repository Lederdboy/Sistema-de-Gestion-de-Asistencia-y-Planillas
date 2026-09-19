package com.sistema.planillas.repository;

import com.sistema.planillas.entity.PlanillaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanillaDetalleRepository extends JpaRepository<PlanillaDetalle, Long> {
    List<PlanillaDetalle> findByPlanillaResumenId(Long planillaResumenId);
    List<PlanillaDetalle> findByPlanillaResumenPeriodo(String periodo);
    java.util.Optional<PlanillaDetalle> findByPlanillaResumenPeriodoAndTrabajadorId(String periodo, Long trabajadorId);
    void deleteByPlanillaResumenId(Long planillaResumenId);
}
