package com.sistema.planillas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.planillas.dto.CrearTrabajadorRequest;
import com.sistema.planillas.dto.TrabajadorDTO;
import com.sistema.planillas.exception.GlobalExceptionHandler;
import com.sistema.planillas.exception.ResourceNotFoundException;
import com.sistema.planillas.service.TrabajadorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TrabajadorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TrabajadorService trabajadorService;

    @InjectMocks
    private TrabajadorController trabajadorController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();
        mockMvc = MockMvcBuilders.standaloneSetup(trabajadorController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/trabajadores/{id} - Retorna 200 OK y DTO si existe")
    void testObtenerTrabajadorPorIdExitoso() throws Exception {
        TrabajadorDTO dto = TrabajadorDTO.builder()
                .id(1L)
                .numeroDocumento("78945612")
                .nombres("Ana")
                .apellidoPaterno("Torres")
                .cargo("Contadora")
                .sueldoBasico(new BigDecimal("3500.00"))
                .activo(true)
                .build();

        when(trabajadorService.obtenerPorId(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/trabajadores/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.numeroDocumento").value("78945612"))
                .andExpect(jsonPath("$.nombres").value("Ana"));
    }

    @Test
    @DisplayName("GET /api/v1/trabajadores/{id} - Retorna 404 NOT FOUND manejado por GlobalExceptionHandler")
    void testObtenerTrabajadorInexistenteRetorna404() throws Exception {
        when(trabajadorService.obtenerPorId(999L))
                .thenThrow(new ResourceNotFoundException("Trabajador no encontrado con ID: 999"));

        mockMvc.perform(get("/api/v1/trabajadores/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Trabajador no encontrado con ID: 999"));
    }

    @Test
    @DisplayName("POST /api/v1/trabajadores - Valida campos requeridos y retorna 400 Bad Request si faltan datos")
    void testCrearTrabajadorValidacionFalla() throws Exception {
        CrearTrabajadorRequest requestInvalido = new CrearTrabajadorRequest(); // campos nulos

        mockMvc.perform(post("/api/v1/trabajadores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors").isMap());
    }
}
