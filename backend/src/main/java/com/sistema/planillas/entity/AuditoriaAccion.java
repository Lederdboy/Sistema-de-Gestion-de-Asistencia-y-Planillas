package com.sistema.planillas.entity;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_acciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaAccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_uuid", nullable = false, length = 36)
    private String usuarioUuid;

    @Column(name = "usuario_nombre", length = 150)
    private String usuarioNombre;

    @Column(name = "accion", nullable = false, length = 100)
    private String accion; // APROBAR_VACACION | RECHAZAR_VACACION | CERRAR_PLANILLA | CAMBIAR_ROL | etc.

    @Column(name = "entidad", length = 50)
    private String entidad; // solicitudes_vacaciones | planillas_resumen | usuarios_perfil

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
