package com.sistema.planillas.service;

import com.sistema.planillas.dto.ActualizarTrabajadorRequest;
import com.sistema.planillas.dto.CrearTrabajadorRequest;
import com.sistema.planillas.dto.TrabajadorDTO;
import com.sistema.planillas.entity.Empresa;
import com.sistema.planillas.entity.Sede;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.exception.BusinessException;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.repository.EmpresaRepository;
import com.sistema.planillas.repository.SedeRepository;
import com.sistema.planillas.repository.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrabajadorService {

    private final TrabajadorRepository trabajadorRepository;
    private final EmpresaRepository empresaRepository;
    private final SedeRepository sedeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public Page<TrabajadorDTO> listarTrabajadores(Long empresaId, Long sedeId, String search, Pageable pageable) {
        return trabajadorRepository.buscarTrabajadoresPaginado(empresaId, sedeId, search, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public TrabajadorDTO obtenerPorId(Long id) {
        return mapToDTO(trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id)));
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO crearTrabajador(CrearTrabajadorRequest request) {
        validarDocumento(request.getTipoDocumento(), request.getNumeroDocumento());

        if (trabajadorRepository.existsByEmpresaIdAndNumeroDocumento(request.getEmpresaId(), request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe un trabajador con el documento " + request.getNumeroDocumento());
        }

        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada: " + request.getEmpresaId()));

        Sede sede = sedeRepository.findById(request.getSedeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada: " + request.getSedeId()));

        if (!sede.getEmpresa().getId().equals(empresa.getId())) {
            throw new BusinessException("La sede no pertenece a la empresa especificada");
        }

        BigDecimal sueldoDiario = request.getSueldoDiario() != null && request.getSueldoDiario().compareTo(BigDecimal.ZERO) > 0
                ? request.getSueldoDiario()
                : request.getSueldoBasico().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        Trabajador trabajador = Trabajador.builder()
                .empresa(empresa)
                .sede(sede)
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .nombres(request.getNombres())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .cargo(request.getCargo())
                .fechaIngreso(request.getFechaIngreso())
                .sueldoBasico(request.getSueldoBasico())
                .sueldoDiario(sueldoDiario)
                .fotoUrl(request.getFotoUrl())
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .build();

        return mapToDTO(trabajadorRepository.save(trabajador));
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO actualizarTrabajador(Long id, ActualizarTrabajadorRequest request) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));

        validarDocumento(request.getTipoDocumento(), request.getNumeroDocumento());

        if (trabajadorRepository.existsByEmpresaIdAndNumeroDocumentoAndIdNot(trabajador.getEmpresa().getId(), request.getNumeroDocumento(), id)) {
            throw new BusinessException("El documento " + request.getNumeroDocumento() + " ya está registrado por otro trabajador.");
        }

        Sede sede = sedeRepository.findById(request.getSedeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada: " + request.getSedeId()));

        if (!sede.getEmpresa().getId().equals(trabajador.getEmpresa().getId())) {
            throw new BusinessException("La sede no pertenece a la empresa del trabajador");
        }

        BigDecimal sueldoDiario = request.getSueldoDiario() != null && request.getSueldoDiario().compareTo(BigDecimal.ZERO) > 0
                ? request.getSueldoDiario()
                : request.getSueldoBasico().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        trabajador.setSede(sede);
        trabajador.setTipoDocumento(request.getTipoDocumento());
        trabajador.setNumeroDocumento(request.getNumeroDocumento());
        trabajador.setNombres(request.getNombres());
        trabajador.setApellidoPaterno(request.getApellidoPaterno());
        trabajador.setApellidoMaterno(request.getApellidoMaterno());
        trabajador.setCargo(request.getCargo());
        trabajador.setFechaIngreso(request.getFechaIngreso());
        trabajador.setSueldoBasico(request.getSueldoBasico());
        trabajador.setSueldoDiario(sueldoDiario);
        if (request.getFotoUrl() != null) trabajador.setFotoUrl(request.getFotoUrl());
        if (request.getActivo() != null) trabajador.setActivo(request.getActivo());

        return mapToDTO(trabajadorRepository.save(trabajador));
    }

    @Transactional(rollbackFor = Exception.class)
    public void crearAcceso(Long id, String email, String password) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));

        // Verificar si ya existe el email en usuarios_perfil
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM usuarios_perfil WHERE email = ?", Integer.class, email);
        if (count != null && count > 0) {
            throw new BusinessException("El correo " + email + " ya está registrado.");
        }

        String nuevoUuid = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(password);

        // Insertar en usuarios_perfil
        jdbc.update(
            "INSERT INTO usuarios_perfil (id, nombre, email, password_hash, rol, sede_id, empresa_id, cargo, activo) " +
            "VALUES (?::uuid, ?, ?, ?, 'TRABAJADOR', ?, ?, ?, true)",
            nuevoUuid,
            trabajador.getApellidoPaterno() + " " + trabajador.getApellidoMaterno() + " " + trabajador.getNombres(),
            email,
            passwordHash,
            trabajador.getSede() != null ? trabajador.getSede().getId() : null,
            trabajador.getEmpresa() != null ? trabajador.getEmpresa().getId() : null,
            trabajador.getCargo()
        );

        // Vincular usuario_id en trabajadores
        trabajador.setUsuarioId(UUID.fromString(nuevoUuid));
        trabajadorRepository.save(trabajador);
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO vincularUsuario(Long id, String usuarioId) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
        trabajador.setUsuarioId(usuarioId != null ? UUID.fromString(usuarioId) : null);
        return mapToDTO(trabajadorRepository.save(trabajador));
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO cambiarEstado(Long id, boolean activo) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
        trabajador.setActivo(activo);
        return mapToDTO(trabajadorRepository.save(trabajador));
    }

    private void validarDocumento(String tipoDocumento, String numeroDocumento) {
        if ("DNI".equalsIgnoreCase(tipoDocumento)) {
            if (numeroDocumento == null || !numeroDocumento.matches("^[0-9]{8}$")) {
                throw new BusinessException("Para DNI se requieren exactamente 8 dígitos numéricos.");
            }
        }
    }

    public TrabajadorDTO mapToDTO(Trabajador t) {
        return TrabajadorDTO.builder()
                .id(t.getId())
                .empresaId(t.getEmpresa() != null ? t.getEmpresa().getId() : null)
                .sedeId(t.getSede() != null ? t.getSede().getId() : null)
                .nombreSede(t.getSede() != null ? t.getSede().getNombre() : "")
                .tipoDocumento(t.getTipoDocumento())
                .numeroDocumento(t.getNumeroDocumento())
                .nombres(t.getNombres())
                .apellidoPaterno(t.getApellidoPaterno())
                .apellidoMaterno(t.getApellidoMaterno())
                .nombreCompleto(t.getApellidoPaterno() + " " + t.getApellidoMaterno() + " " + t.getNombres())
                .cargo(t.getCargo())
                .fechaIngreso(t.getFechaIngreso())
                .sueldoBasico(t.getSueldoBasico())
                .sueldoDiario(t.getSueldoDiario())
                .activo(t.getActivo())
                .fotoUrl(t.getFotoUrl())
                .usuarioId(t.getUsuarioId() != null ? t.getUsuarioId().toString() : null)
                .build();
    }
}
