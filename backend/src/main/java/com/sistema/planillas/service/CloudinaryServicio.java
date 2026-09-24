package com.sistema.planillas.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServicio implements ICloudinaryServicio {

    private final Cloudinary cloudinary;

    @Override
    public String subirImagen(MultipartFile archivo, String carpeta) throws Exception {
        Map<?, ?> resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap("folder", "mi-proyecto/" + carpeta)
        );
        return (String) resultado.get("secure_url");
    }

    @Override
    public void eliminarImagen(String publicId) throws Exception {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
