package com.sistema.planillas.service;

import com.sistema.planillas.entity.AuditoriaAccion;
import com.sistema.planillas.repository.AuditoriaAccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaAccionRepository auditoriaRepository;

    @Transactional
    public void registrar(String usuarioUuid, String usuarioNombre, String accion,
                          String entidad, Long entidadId, String detalle) {
        auditoriaRepository.save(AuditoriaAccion.builder()
            .usuarioUuid(usuarioUuid)
            .usuarioNombre(usuarioNombre)
            .accion(accion)
            .entidad(entidad)
            .entidadId(entidadId)
            .detalle(detalle)
            .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaAccion> listarPorEntidad(String entidad, Long entidadId, Pageable pageable) {
        return auditoriaRepository.findByEntidadAndEntidadIdOrderByCreatedAtDesc(entidad, entidadId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaAccion> listarTodos(Pageable pageable) {
        return auditoriaRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
