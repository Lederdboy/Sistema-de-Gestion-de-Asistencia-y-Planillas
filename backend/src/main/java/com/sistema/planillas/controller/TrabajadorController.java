package com.sistema.planillas.controller;

import com.sistema.planillas.dto.TrabajadorDTO;
import com.sistema.planillas.repository.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trabajadores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrabajadorController {

    private final TrabajadorRepository trabajadorRepository;

    @GetMapping
    public ResponseEntity<Page<TrabajadorDTO>> listarTrabajadores(
            @RequestParam(value = "empresaId", required = false) Long empresaId,
            @RequestParam(value = "sedeId", required = false) Long sedeId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("apellidoPaterno").ascending());
        
        var trabajadoresPage = trabajadorRepository.buscarTrabajadoresPaginado(
                empresaId, sedeId, search, pageable
        );

        Page<TrabajadorDTO> dtoPage = trabajadoresPage.map(t -> TrabajadorDTO.builder()
                .id(t.getId())
                .empresaId(t.getEmpresa().getId())
                .sedeId(t.getSede().getId())
                .nombreSede(t.getSede().getNombre())
                .tipoDocumento(t.getTipoDocumento())
                .numeroDocumento(t.getNumeroDocumento())
                .nombres(t.getNombres())
                .apellidoPaterno(t.getApellidoPaterno())
                .apellidoMaterno(t.getApellidoMaterno())
                .nombreCompleto(t.getNombres() + " " + t.getApellidoPaterno() + " " + t.getApellidoMaterno())
                .cargo(t.getCargo())
                .fechaIngreso(t.getFechaIngreso())
                .sueldoBasico(t.getSueldoBasico())
                .activo(t.getActivo())
                .build()
        );

        return ResponseEntity.ok(dtoPage);
    }
}
