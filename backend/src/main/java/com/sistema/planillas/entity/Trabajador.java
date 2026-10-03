package com.sistema.planillas.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trabajadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @Builder.Default
    @Column(name = "tipo_documento", nullable = false, length = 10)
    private String tipoDocumento = "DNI";

    @Column(name = "numero_documento", nullable = false, length = 15)
    private String numeroDocumento;

    @Column(nullable = false, length = 80)
    private String nombres;

    @Column(name = "apellido_paterno", nullable = false, length = 80)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", nullable = true, length = 80)
    private String apellidoMaterno;

    @Column(nullable = false, length = 100)
    private String cargo;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "sueldo_basico", nullable = false, precision = 12, scale = 2)
    private BigDecimal sueldoBasico;

    @Column(name = "sueldo_diario", nullable = false, precision = 12, scale = 2)
    private BigDecimal sueldoDiario;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "usuario_id", columnDefinition = "uuid")
    private UUID usuarioId;
}
