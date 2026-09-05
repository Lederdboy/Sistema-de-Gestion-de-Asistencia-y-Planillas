package com.sistema.planillas.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "planillas_resumen", 
       uniqueConstraints = {@UniqueConstraint(columnNames = {"empresa_id", "periodo"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanillaResumen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false, length = 6)
    private String periodo; // YYYYMM (ej. 202609)

    @Column(name = "total_trabajadores", nullable = false)
    private Integer totalTrabajadores = 0;

    @Column(name = "total_calculados", nullable = false)
    private Integer totalCalculados = 0;

    @Column(name = "total_pendientes", nullable = false)
    private Integer totalPendientes = 0;

    @Column(name = "monto_total_neto", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoTotalNeto = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "EN_PROCESO"; // EN_PROCESO, CERRADO

    @Column(name = "fecha_calculo")
    private LocalDateTime fechaCalculo;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "usuario_cierre", length = 50)
    private String usuarioCierre;
}
