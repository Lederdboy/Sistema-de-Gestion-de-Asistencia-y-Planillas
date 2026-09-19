package com.sistema.planillas.controller;

import com.sistema.planillas.dto.ActualizarTrabajadorRequest;
import com.sistema.planillas.dto.CrearTrabajadorRequest;
import com.sistema.planillas.dto.TrabajadorDTO;
import com.sistema.planillas.service.TrabajadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/trabajadores")
@RequiredArgsConstructor
public class TrabajadorController {

    private final TrabajadorService trabajadorService;

    @GetMapping
    public ResponseEntity<Page<TrabajadorDTO>> listarTrabajadores(
            @RequestParam(value = "empresaId", required = false) Long empresaId,
            @RequestParam(value = "sedeId", required = false) Long sedeId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("apellidoPaterno").ascending());
        Page<TrabajadorDTO> dtoPage = trabajadorService.listarTrabajadores(empresaId, sedeId, search, pageable);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrabajadorDTO> obtenerPorId(@PathVariable Long id) {
        TrabajadorDTO dto = trabajadorService.obtenerPorId(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<TrabajadorDTO> crearTrabajador(@Valid @RequestBody CrearTrabajadorRequest request) {
        TrabajadorDTO creado = trabajadorService.crearTrabajador(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrabajadorDTO> actualizarTrabajador(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarTrabajadorRequest request
    ) {
        TrabajadorDTO actualizado = trabajadorService.actualizarTrabajador(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<TrabajadorDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("activo") boolean activo
    ) {
        TrabajadorDTO actualizado = trabajadorService.cambiarEstado(id, activo);
        return ResponseEntity.ok(actualizado);
    }
}
