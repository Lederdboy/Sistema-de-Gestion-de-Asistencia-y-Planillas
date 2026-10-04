package com.sistema.planillas.controller;

import com.sistema.planillas.dto.ActualizarTrabajadorRequest;
import com.sistema.planillas.dto.CrearTrabajadorRequest;
import com.sistema.planillas.dto.TrabajadorDTO;
import com.sistema.planillas.service.CloudinaryServicio;
import com.sistema.planillas.service.ReniecService;
import com.sistema.planillas.service.TrabajadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trabajadores")
@RequiredArgsConstructor
public class TrabajadorController {

    private final TrabajadorService trabajadorService;
    private final CloudinaryServicio cloudinaryServicio;
    private final ReniecService reniecService;

    @GetMapping
    public ResponseEntity<Page<TrabajadorDTO>> listarTrabajadores(
            @RequestParam(value = "empresaId", required = false) Long empresaId,
            @RequestParam(value = "sedeId", required = false) Long sedeId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("apellidoPaterno").ascending());
        return ResponseEntity.ok(trabajadorService.listarTrabajadores(empresaId, sedeId, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrabajadorDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.obtenerPorId(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TrabajadorDTO> crearTrabajador(
            @RequestPart("datos") @Valid CrearTrabajadorRequest request,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) throws Exception {
        if (foto != null && !foto.isEmpty()) {
            String url = cloudinaryServicio.subirImagen(foto, "trabajadores");
            request.setFotoUrl(url);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(trabajadorService.crearTrabajador(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TrabajadorDTO> actualizarTrabajador(
            @PathVariable Long id,
            @RequestPart("datos") @Valid ActualizarTrabajadorRequest request,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) throws Exception {
        if (foto != null && !foto.isEmpty()) {
            String url = cloudinaryServicio.subirImagen(foto, "trabajadores");
            request.setFotoUrl(url);
        }
        return ResponseEntity.ok(trabajadorService.actualizarTrabajador(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<TrabajadorDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("activo") boolean activo
    ) {
        return ResponseEntity.ok(trabajadorService.cambiarEstado(id, activo));
    }

    @PatchMapping("/{id}/vincular-usuario")
    public ResponseEntity<?> vincularUsuario(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body
    ) {
        return ResponseEntity.ok(trabajadorService.vincularUsuario(id, body.get("usuarioId")));
    }

    @PatchMapping("/{id}/crear-acceso")
    public ResponseEntity<?> crearAcceso(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body
    ) {
        try {
            trabajadorService.crearAcceso(id, body.get("email"), body.get("password"));
            return ResponseEntity.ok(java.util.Map.of("mensaje", "Acceso creado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFoto(
            @RequestPart("foto") MultipartFile foto
    ) throws Exception {
        String url = cloudinaryServicio.subirImagen(foto, "avatares");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/reniec")
    public ResponseEntity<?> consultarReniec(@RequestParam("dni") String dni) {
        if (dni == null || !dni.matches("^[0-9]{8}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "DNI debe tener exactamente 8 dígitos"));
        }
        try {
            return ResponseEntity.ok(reniecService.consultarDni(dni));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
