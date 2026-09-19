package com.sistema.planillas.service;

import com.sistema.planillas.dto.CrearEmpresaRequest;
import com.sistema.planillas.dto.EmpresaDTO;
import com.sistema.planillas.entity.Empresa;
import com.sistema.planillas.exception.BusinessException;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    @Transactional(readOnly = true)
    public List<EmpresaDTO> listarEmpresas() {
        return empresaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpresaDTO obtenerPorId(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + id));
        return mapToDTO(empresa);
    }

    @Transactional(rollbackFor = Exception.class)
    public EmpresaDTO crearEmpresa(CrearEmpresaRequest request) {
        if (empresaRepository.existsByRuc(request.getRuc())) {
            throw new BusinessException("Ya existe una empresa registrada con el RUC: " + request.getRuc());
        }

        Empresa empresa = Empresa.builder()
                .ruc(request.getRuc())
                .razonSocial(request.getRazonSocial())
                .nombreComercial(request.getNombreComercial())
                .direccion(request.getDireccion())
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Empresa guardada = empresaRepository.save(empresa);
        return mapToDTO(guardada);
    }

    private EmpresaDTO mapToDTO(Empresa e) {
        return EmpresaDTO.builder()
                .id(e.getId())
                .ruc(e.getRuc())
                .razonSocial(e.getRazonSocial())
                .nombreComercial(e.getNombreComercial())
                .direccion(e.getDireccion())
                .activo(e.getActivo())
                .fechaCreacion(e.getFechaCreacion())
                .build();
    }
}
