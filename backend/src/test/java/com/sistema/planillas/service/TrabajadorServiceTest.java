package com.sistema.planillas.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrabajadorServiceTest {

    @Mock
    private TrabajadorRepository trabajadorRepository;
    @Mock
    private EmpresaRepository empresaRepository;
    @Mock
    private SedeRepository sedeRepository;

    @InjectMocks
    private TrabajadorService trabajadorService;

    private Empresa empresa;
    private Sede sede;

    @BeforeEach
    void setUp() {
        empresa = Empresa.builder().id(1L).ruc("20111111111").razonSocial("Empresa Test").build();
        sede = Sede.builder().id(10L).empresa(empresa).codigo("SED-1").nombre("Sede Lima").build();
    }

    @Test
    @DisplayName("Debe registrar un nuevo trabajador exitosamente calculando el sueldo diario")
    void testCrearTrabajadorExitoso() {
        CrearTrabajadorRequest req = CrearTrabajadorRequest.builder()
                .empresaId(1L)
                .sedeId(10L)
                .tipoDocumento("DNI")
                .numeroDocumento("47896541")
                .nombres("Carlos")
                .apellidoPaterno("Vargas")
                .apellidoMaterno("Mendoza")
                .cargo("Supervisor")
                .fechaIngreso(LocalDate.of(2024, 2, 1))
                .sueldoBasico(new BigDecimal("3000.00"))
                .build();

        when(trabajadorRepository.existsByEmpresaIdAndNumeroDocumento(1L, "47896541")).thenReturn(false);
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresa));
        when(sedeRepository.findById(10L)).thenReturn(Optional.of(sede));
        when(trabajadorRepository.save(any(Trabajador.class))).thenAnswer(i -> {
            Trabajador t = i.getArgument(0);
            t.setId(101L);
            return t;
        });

        TrabajadorDTO dto = trabajadorService.crearTrabajador(req);

        assertNotNull(dto);
        assertEquals("47896541", dto.getNumeroDocumento());
        assertEquals("Carlos", dto.getNombres());
        assertEquals(new BigDecimal("100.00"), dto.getSueldoDiario());
        assertTrue(dto.getActivo());
    }

    @Test
    @DisplayName("Debe rechazar la creación si el DNI ya está registrado en la misma empresa")
    void testCrearTrabajadorDniDuplicadoLanzaBusinessException() {
        CrearTrabajadorRequest req = CrearTrabajadorRequest.builder()
                .empresaId(1L)
                .sedeId(10L)
                .tipoDocumento("DNI")
                .numeroDocumento("47896541")
                .nombres("Carlos")
                .apellidoPaterno("Vargas")
                .apellidoMaterno("Mendoza")
                .cargo("Supervisor")
                .fechaIngreso(LocalDate.of(2024, 2, 1))
                .sueldoBasico(new BigDecimal("3000.00"))
                .build();

        when(trabajadorRepository.existsByEmpresaIdAndNumeroDocumento(1L, "47896541")).thenReturn(true);

        assertThrows(BusinessException.class, () -> trabajadorService.crearTrabajador(req));
        verify(trabajadorRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el ID buscado no existe")
    void testObtenerPorIdInexistenteLanzaNotFound() {
        when(trabajadorRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> trabajadorService.obtenerPorId(999L));
    }
}
