package com.sistema.planillas.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asistencias_matriz", 
       uniqueConstraints = {@UniqueConstraint(columnNames = {"trabajador_id", "fecha"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaMatriz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "codigo_asistencia", nullable = false)
    private TipoAsistencia tipoAsistencia;

    @Column(length = 255)
    private String observacion;

    @Column(name = "usuario_modificacion", length = 50)
    private String usuarioModificacion;

    @Builder.Default
    @Column(name = "fecha_modificacion", nullable = false)
    private LocalDateTime fechaModificacion = LocalDateTime.now();
}
