package com.sistema.planillas.service;

import com.sistema.planillas.dto.MarcacionRequest;
import com.sistema.planillas.dto.MatrizAsistenciaRowDTO;
import com.sistema.planillas.entity.AsistenciaMatriz;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.repository.AsistenciaMatrizRepository;
import com.sistema.planillas.repository.SedeRepository;
import com.sistema.planillas.repository.TipoAsistenciaRepository;
import com.sistema.planillas.repository.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsistenciaService {

    private final AsistenciaMatrizRepository asistenciaRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final SedeRepository sedeRepository;
    private final TipoAsistenciaRepository tipoAsistenciaRepository;

    @Transactional(readOnly = true)
    public List<MatrizAsistenciaRowDTO> obtenerMatrizMensual(int mes, int anio, Long sedeId) {
        YearMonth yearMonth = YearMonth.of(anio, mes);
        LocalDate fechaInicio = yearMonth.atDay(1);
        LocalDate fechaFin = yearMonth.atEndOfMonth();

        // 1. Obtener trabajadores de la sede
        List<Trabajador> trabajadores = trabajadorRepository.findAll().stream()
                .filter(t -> t.getSede().getId().equals(sedeId) && Boolean.TRUE.equals(t.getActivo()))
                .collect(Collectors.toList());

        // 2. Obtener asistencias registradas en el rango de fechas
        List<AsistenciaMatriz> marcaciones = asistenciaRepository.findBySedeIdAndFechaBetween(sedeId, fechaInicio, fechaFin);

        // Agrupar marcaciones por trabajadorId y fecha
        Map<Long, Map<LocalDate, String>> marcacionesMap = new HashMap<>();
        for (AsistenciaMatriz m : marcaciones) {
            marcacionesMap
                .computeIfAbsent(m.getTrabajador().getId(), k -> new HashMap<>())
                .put(m.getFecha(), m.getTipoAsistencia().getCodigo());
        }

        List<MatrizAsistenciaRowDTO> resultado = new ArrayList<>();

        for (Trabajador t : trabajadores) {
            Map<String, String> diasMap = new LinkedHashMap<>();
            Map<LocalDate, String> trabajadorMarcaciones = marcacionesMap.getOrDefault(t.getId(), Collections.emptyMap());

            int dCount = 0, nCount = 0, fCount = 0, dlCount = 0, vCount = 0;

            for (int dia = 1; dia <= yearMonth.lengthOfMonth(); dia++) {
                LocalDate fechaDia = yearMonth.atDay(dia);
                String diaKey = String.format("%02d", dia);

                // Si no hay marcación registrada, valor por defecto "D" o "DL" según fin de semana
                String codigo = trabajadorMarcaciones.get(fechaDia);
                if (codigo == null) {
                    codigo = (fechaDia.getDayOfWeek().getValue() == 7) ? "DL" : "D";
                }

                diasMap.put(diaKey, codigo);

                switch (codigo) {
                    case "D": dCount++; break;
                    case "N": nCount++; break;
                    case "F": fCount++; break;
                    case "DL": dlCount++; break;
                    case "V": vCount++; break;
                }
            }

            resultado.add(MatrizAsistenciaRowDTO.builder()
                    .trabajadorId(t.getId())
                    .numeroDocumento(t.getNumeroDocumento())
                    .nombreCompleto(t.getNombres() + " " + t.getApellidoPaterno() + " " + t.getApellidoMaterno())
                    .cargo(t.getCargo())
                    .dias(diasMap)
                    .totalDiasTrabajados(dCount)
                    .totalNoches(nCount)
                    .totalFaltas(fCount)
                    .totalDescansos(dlCount)
                    .totalVacaciones(vCount)
                    .build());
        }

        return resultado;
    }

    @Transactional(rollbackFor = Exception.class)
    public void registrarOActualizarMarcacion(MarcacionRequest request) {
        Trabajador trabajador = trabajadorRepository.findById(request.getTrabajadorId())
                .orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado con ID: " + request.getTrabajadorId()));

        var tipoAsistencia = tipoAsistenciaRepository.findById(request.getCodigoAsistencia())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de asistencia no válido: " + request.getCodigoAsistencia()));

        Optional<AsistenciaMatriz> optMarcacion = asistenciaRepository.findByTrabajadorIdAndFecha(request.getTrabajadorId(), request.getFecha());

        AsistenciaMatriz asistencia;
        if (optMarcacion.isPresent()) {
            asistencia = optMarcacion.get();
            asistencia.setTipoAsistencia(tipoAsistencia);
            asistencia.setObservacion(request.getObservacion());
            asistencia.setUsuarioModificacion(request.getUsuario() != null ? request.getUsuario() : "SISTEMA");
            asistencia.setFechaModificacion(LocalDateTime.now());
        } else {
            asistencia = AsistenciaMatriz.builder()
                    .trabajador(trabajador)
                    .sede(trabajador.getSede())
                    .fecha(request.getFecha())
                    .tipoAsistencia(tipoAsistencia)
                    .observacion(request.getObservacion())
                    .usuarioModificacion(request.getUsuario() != null ? request.getUsuario() : "SISTEMA")
                    .fechaModificacion(LocalDateTime.now())
                    .build();
        }

        asistenciaRepository.save(asistencia);
    }
}
