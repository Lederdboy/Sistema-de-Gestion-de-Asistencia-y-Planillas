package com.sistema.planillas.controller;

import com.sistema.planillas.dto.SedeDTO;
import com.sistema.planillas.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sedes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SedeController {

    private final SedeRepository sedeRepository;

    @GetMapping
    public ResponseEntity<List<SedeDTO>> listarSedes(@RequestParam(value = "empresaId", required = false) Long empresaId) {
        var sedes = (empresaId != null) 
            ? sedeRepository.findByEmpresaIdAndActivoTrue(empresaId)
            : sedeRepository.findByActivoTrue();

        List<SedeDTO> dtos = sedes.stream().map(s -> SedeDTO.builder()
                .id(s.getId())
                .empresaId(s.getEmpresa().getId())
                .codigo(s.getCodigo())
                .nombre(s.getNombre())
                .departamento(s.getDepartamento())
                .distrito(s.getDistrito())
                .activo(s.getActivo())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
