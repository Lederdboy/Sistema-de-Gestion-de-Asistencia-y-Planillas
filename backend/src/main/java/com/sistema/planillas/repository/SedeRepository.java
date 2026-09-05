package com.sistema.planillas.repository;

import com.sistema.planillas.entity.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
    List<Sede> findByActivoTrue();
    List<Sede> findByEmpresaIdAndActivoTrue(Long empresaId);
}
