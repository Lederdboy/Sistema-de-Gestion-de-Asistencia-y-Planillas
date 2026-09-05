package com.sistema.planillas.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "planillas_detalle",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"planilla_resumen_id", "trabajador_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanillaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planilla_resumen_id", nullable = false)
    private PlanillaResumen planillaResumen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @Column(name = "dias_trabajados", nullable = false)
    private Integer diasTrabajados = 0;

    @Column(name = "dias_noches", nullable = false)
    private Integer diasNoches = 0;

    @Column(name = "dias_faltas", nullable = false)
    private Integer diasFaltas = 0;

    @Column(name = "dias_descanso", nullable = false)
    private Integer diasDescanso = 0;

    @Column(name = "dias_vacaciones", nullable = false)
    private Integer diasVacaciones = 0;

    @Column(name = "sueldo_basico", nullable = false, precision = 12, scale = 2)
    private BigDecimal sueldoBasico;

    @Column(name = "total_ingresos", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalIngresos = BigDecimal.ZERO;

    @Column(name = "total_descuentos", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDescuentos = BigDecimal.ZERO;

    @Column(name = "neto_pagar", nullable = false, precision = 12, scale = 2)
    private BigDecimal netoPagar = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean calculado = false;
}
