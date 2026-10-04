package com.sistema.planillas.repository;

import com.sistema.planillas.entity.DescansoMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DescansoMedicoRepository extends JpaRepository<DescansoMedico, Long> {
    List<DescansoMedico> findByTrabajadorIdOrderByFechaInicioDesc(Long trabajadorId);
}
