package com.sistema.planillas.repository;

import com.sistema.planillas.entity.TipoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoAsistenciaRepository extends JpaRepository<TipoAsistencia, String> {
}
