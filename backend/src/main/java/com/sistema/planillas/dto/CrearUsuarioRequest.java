package com.sistema.planillas.dto;

public class CrearUsuarioRequest {
    private String nombre;
    private String email;
    private String password;
    private String rol;
    private Integer sede_id;
    private Integer empresa_id;
    private String cargo;
    private String creado_por;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Integer getSede_id() { return sede_id; }
    public void setSede_id(Integer sede_id) { this.sede_id = sede_id; }
    public Integer getEmpresa_id() { return empresa_id; }
    public void setEmpresa_id(Integer empresa_id) { this.empresa_id = empresa_id; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getCreado_por() { return creado_por; }
    public void setCreado_por(String creado_por) { this.creado_por = creado_por; }
}
