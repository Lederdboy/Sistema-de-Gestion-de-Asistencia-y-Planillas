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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TrabajadorService {

    private final TrabajadorRepository trabajadorRepository;
    private final EmpresaRepository empresaRepository;
    private final SedeRepository sedeRepository;

    @Transactional(readOnly = true)
    public Page<TrabajadorDTO> listarTrabajadores(Long empresaId, Long sedeId, String search, Pageable pageable) {
        Page<Trabajador> trabajadoresPage = trabajadorRepository.buscarTrabajadoresPaginado(empresaId, sedeId, search, pageable);
        return trabajadoresPage.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public TrabajadorDTO obtenerPorId(Long id) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
        return mapToDTO(trabajador);
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO crearTrabajador(CrearTrabajadorRequest request) {
        validarDocumento(request.getTipoDocumento(), request.getNumeroDocumento());

        if (trabajadorRepository.existsByEmpresaIdAndNumeroDocumento(request.getEmpresaId(), request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe un trabajador registrado con el número de documento " 
                    + request.getNumeroDocumento() + " en esta empresa.");
        }

        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + request.getEmpresaId()));

        Sede sede = sedeRepository.findById(request.getSedeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con ID: " + request.getSedeId()));

        if (!sede.getEmpresa().getId().equals(empresa.getId())) {
            throw new BusinessException("La sede seleccionada no pertenece a la empresa especificada");
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
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Trabajador guardado = trabajadorRepository.save(trabajador);
        return mapToDTO(guardado);
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO actualizarTrabajador(Long id, ActualizarTrabajadorRequest request) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));

        validarDocumento(request.getTipoDocumento(), request.getNumeroDocumento());

        if (trabajadorRepository.existsByEmpresaIdAndNumeroDocumentoAndIdNot(trabajador.getEmpresa().getId(), request.getNumeroDocumento(), id)) {
            throw new BusinessException("El número de documento " + request.getNumeroDocumento() + " ya está registrado por otro trabajador en esta empresa.");
        }

        Sede sede = sedeRepository.findById(request.getSedeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con ID: " + request.getSedeId()));

        if (!sede.getEmpresa().getId().equals(trabajador.getEmpresa().getId())) {
            throw new BusinessException("La sede seleccionada no pertenece a la empresa del trabajador");
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
        if (request.getActivo() != null) {
            trabajador.setActivo(request.getActivo());
        }

        Trabajador actualizado = trabajadorRepository.save(trabajador);
        return mapToDTO(actualizado);
    }

    private void validarDocumento(String tipoDocumento, String numeroDocumento) {
        if ("DNI".equalsIgnoreCase(tipoDocumento)) {
            if (numeroDocumento == null || !numeroDocumento.matches("^[0-9]{8}$")) {
                throw new BusinessException("Para tipo de documento DNI se requieren exactamente 8 dígitos numéricos.");
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public TrabajadorDTO cambiarEstado(Long id, boolean activo) {
        Trabajador trabajador = trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
        trabajador.setActivo(activo);
        Trabajador actualizado = trabajadorRepository.save(trabajador);
        return mapToDTO(actualizado);
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
                .nombreCompleto(t.getNombres() + " " + t.getApellidoPaterno() + " " + t.getApellidoMaterno())
                .cargo(t.getCargo())
                .fechaIngreso(t.getFechaIngreso())
                .sueldoBasico(t.getSueldoBasico())
                .sueldoDiario(t.getSueldoDiario())
                .activo(t.getActivo())
                .build();
    }
}
