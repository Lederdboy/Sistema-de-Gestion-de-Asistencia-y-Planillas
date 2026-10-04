package com.sistema.planillas.service;

import com.sistema.planillas.entity.DescansoMedico;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.repository.DescansoMedicoRepository;
import com.sistema.planillas.repository.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DescansoMedicoService {

    private final DescansoMedicoRepository descansoRepository;
    private final TrabajadorRepository trabajadorRepository;

    @Transactional(readOnly = true)
    public List<DescansoMedico> listarPorTrabajador(Long trabajadorId) {
        return descansoRepository.findByTrabajadorIdOrderByFechaInicioDesc(trabajadorId);
    }

    @Transactional
    public DescansoMedico registrar(Long trabajadorId, LocalDate fechaInicio, LocalDate fechaFin,
                                     String tipoDescanso, String numeroCertificado,
                                     String centroMedico, String observaciones) {
        Trabajador trabajador = trabajadorRepository.findById(trabajadorId)
            .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado: " + trabajadorId));

        if (fechaFin.isBefore(fechaInicio)) {
            throw new IllegalArgumentException("La fecha fin no puede ser anterior a la fecha inicio");
        }

        int dias = (int) ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;

        return descansoRepository.save(DescansoMedico.builder()
            .trabajador(trabajador)
            .fechaInicio(fechaInicio)
            .fechaFin(fechaFin)
            .dias(dias)
            .tipoDescanso(tipoDescanso != null ? tipoDescanso : "ENFERMEDAD")
            .numeroCertificado(numeroCertificado)
            .centroMedico(centroMedico)
            .observaciones(observaciones)
            .estado("REGISTRADO")
            .build());
    }

    @Transactional
    public DescansoMedico cambiarEstado(Long id, String nuevoEstado) {
        DescansoMedico descanso = descansoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Descanso médico no encontrado: " + id));
        descanso.setEstado(nuevoEstado);
        return descansoRepository.save(descanso);
    }
}
