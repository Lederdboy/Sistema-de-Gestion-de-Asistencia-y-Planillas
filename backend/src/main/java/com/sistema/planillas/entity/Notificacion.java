package com.sistema.planillas.entity;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "destinatario_uuid", nullable = false, length = 36)
    private String destinatarioUuid; // UUID del usuario destinatario

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // SOLICITUD_VACACIONES | APROBACION | RECHAZO | PLANILLA_CERRADA

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(name = "referencia_id")
    private Long referenciaId; // ID de la solicitud o planilla relacionada

    @Column(name = "leida", nullable = false)
    @Builder.Default
    private Boolean leida = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
