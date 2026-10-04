package com.sistema.planillas.entity;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "descansos_medicos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DescansoMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Integer dias;

    @Column(name = "tipo_descanso", length = 50)
    private String tipoDescanso; // ENFERMEDAD, ACCIDENTE, MATERNIDAD, PATERNIDAD

    @Column(name = "numero_certificado", length = 50)
    private String numeroCertificado;

    @Column(name = "centro_medico", length = 150)
    private String centroMedico;

    @Column(length = 500)
    private String observaciones;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "REGISTRADO"; // REGISTRADO | VALIDADO | RECHAZADO

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
