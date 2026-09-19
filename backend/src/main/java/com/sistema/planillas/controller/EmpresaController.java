package com.sistema.planillas.controller;

import com.sistema.planillas.dto.CrearEmpresaRequest;
import com.sistema.planillas.dto.EmpresaDTO;
import com.sistema.planillas.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listarEmpresas() {
        return ResponseEntity.ok(empresaService.listarEmpresas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaDTO> crearEmpresa(@Valid @RequestBody CrearEmpresaRequest request) {
        EmpresaDTO nuevaEmpresa = empresaService.crearEmpresa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
    }
}
