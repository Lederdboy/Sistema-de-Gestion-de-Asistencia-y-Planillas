package com.sistema.planillas.service;

import com.sistema.planillas.dto.SedeDTO;
import com.sistema.planillas.entity.Sede;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SedeService {

    private final SedeRepository sedeRepository;

    @Transactional(readOnly = true)
    public List<SedeDTO> listarSedes(Long empresaId) {
        List<Sede> sedes = (empresaId != null)
                ? sedeRepository.findByEmpresaIdAndActivoTrue(empresaId)
                : sedeRepository.findByActivoTrue();

        return sedes.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SedeDTO obtenerPorId(Long id) {
        Sede sede = sedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con ID: " + id));
        return mapToDTO(sede);
    }

    private SedeDTO mapToDTO(Sede s) {
        return SedeDTO.builder()
                .id(s.getId())
                .empresaId(s.getEmpresa() != null ? s.getEmpresa().getId() : null)
                .codigo(s.getCodigo())
                .nombre(s.getNombre())
                .departamento(s.getDepartamento())
                .distrito(s.getDistrito())
                .activo(s.getActivo())
                .build();
    }
}
