package com.sistema.planillas.controller;

import com.sistema.planillas.dto.SedeDTO;
import com.sistema.planillas.service.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService sedeService;

    @GetMapping
    public ResponseEntity<List<SedeDTO>> listarSedes(@RequestParam(value = "empresaId", required = false) Long empresaId) {
        return ResponseEntity.ok(sedeService.listarSedes(empresaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SedeDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(sedeService.obtenerPorId(id));
    }
}
