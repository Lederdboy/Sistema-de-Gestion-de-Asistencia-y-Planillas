package com.sistema.planillas.service;

import org.springframework.web.multipart.MultipartFile;

public interface ICloudinaryServicio {
    String subirImagen(MultipartFile archivo, String carpeta) throws Exception;
    void eliminarImagen(String publicId) throws Exception;
}
