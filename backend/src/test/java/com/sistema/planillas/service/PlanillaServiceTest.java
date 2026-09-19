package com.sistema.planillas.service;

import com.sistema.planillas.dto.CalcularPlanillaRequest;
import com.sistema.planillas.dto.MatrizAsistenciaRowDTO;
import com.sistema.planillas.dto.PlanillaResumenDTO;
import com.sistema.planillas.entity.Empresa;
import com.sistema.planillas.entity.PlanillaResumen;
import com.sistema.planillas.entity.Sede;
import com.sistema.planillas.entity.Trabajador;
import com.sistema.planillas.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanillaServiceTest {

    @Mock
    private PlanillaResumenRepository planillaResumenRepository;
    @Mock
    private PlanillaDetalleRepository planillaDetalleRepository;
    @Mock
    private EmpresaRepository empresaRepository;
    @Mock
    private TrabajadorRepository trabajadorRepository;
    @Mock
    private AsistenciaService asistenciaService;
    @Mock
    private SedeRepository sedeRepository;

    @InjectMocks
    private PlanillaService planillaService;

    private Empresa empresa;
    private Sede sede;
    private Trabajador trabajador;

    @BeforeEach
    void setUp() {
        empresa = Empresa.builder()
                .id(1L)
                .ruc("20123456789")
                .razonSocial("Empresa Demo S.A.C.")
                .activo(true)
                .build();

        sede = Sede.builder()
                .id(1L)
                .empresa(empresa)
                .codigo("SED-01")
                .nombre("Sede Central")
                .activo(true)
                .build();

        trabajador = Trabajador.builder()
                .id(100L)
                .empresa(empresa)
                .sede(sede)
                .numeroDocumento("12345678")
                .nombres("Juan")
                .apellidoPaterno("Perez")
                .apellidoMaterno("Gomez")
                .cargo("Analista")
                .fechaIngreso(LocalDate.of(2023, 1, 15))
                .sueldoBasico(new BigDecimal("3000.00"))
                .sueldoDiario(new BigDecimal("100.00"))
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe calcular correctamente la planilla con descuentos de faltas y aportes previsionales")
    void testCalcularPlanillaExitoso() {
        CalcularPlanillaRequest request = CalcularPlanillaRequest.builder()
                .empresaId(1L)
                .periodo("202609")
                .build();

        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresa));
        when(planillaResumenRepository.findByEmpresaIdAndPeriodo(1L, "202609")).thenReturn(Optional.empty());
        when(planillaResumenRepository.save(any(PlanillaResumen.class))).thenAnswer(invocation -> {
            PlanillaResumen r = invocation.getArgument(0);
            if (r.getId() == null) r.setId(10L);
            return r;
        });

        when(trabajadorRepository.findAll()).thenReturn(List.of(trabajador));

        MatrizAsistenciaRowDTO asistenciaDTO = MatrizAsistenciaRowDTO.builder()
                .trabajadorId(100L)
                .totalDiasTrabajados(28)
                .totalFaltas(2)
                .totalDescansos(0)
                .totalNoches(0)
                .totalVacaciones(0)
                .build();

        when(asistenciaService.obtenerMatrizMensual(9, 2026, 1L)).thenReturn(List.of(asistenciaDTO));

        PlanillaResumenDTO resultado = planillaService.calcularPlanilla(request);

        assertNotNull(resultado);
        assertEquals("202609", resultado.getPeriodo());
        assertEquals(1, resultado.getTotalTrabajadores());
        assertEquals(1, resultado.getTotalCalculados());
        assertTrue(resultado.getMontoTotalNeto().compareTo(BigDecimal.ZERO) > 0);
        verify(planillaDetalleRepository, atLeastOnce()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar IllegalStateException si la planilla ya está cerrada")
    void testCalcularPlanillaCerradaLanzaExcepcion() {
        CalcularPlanillaRequest request = CalcularPlanillaRequest.builder()
                .empresaId(1L)
                .periodo("202609")
                .build();

        PlanillaResumen cerrada = PlanillaResumen.builder()
                .id(5L)
                .empresa(empresa)
                .periodo("202609")
                .estado("CERRADO")
                .build();

        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresa));
        when(planillaResumenRepository.findByEmpresaIdAndPeriodo(1L, "202609")).thenReturn(Optional.of(cerrada));

        assertThrows(IllegalStateException.class, () -> planillaService.calcularPlanilla(request));
        verify(planillaDetalleRepository, never()).save(any());
    }
}
