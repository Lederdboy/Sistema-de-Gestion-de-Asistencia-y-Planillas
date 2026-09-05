package com.sistema.planillas.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "tipos_asistencia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoAsistencia {

    @Id
    @Column(length = 10, nullable = false)
    private String codigo; // D, N, F, DL, V

    @Column(nullable = false, length = 50)
    private String descripcion;

    @Column(name = "es_laborable", nullable = false)
    private Boolean esLaborable = true;

    @Column(name = "es_justificado", nullable = false)
    private Boolean esJustificado = true;

    @Column(name = "color_badge", length = 50)
    private String colorBadge;
}
