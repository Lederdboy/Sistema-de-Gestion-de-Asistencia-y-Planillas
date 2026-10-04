package com.sistema.planillas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@Service
public class ReniecService {

    @Value("${reniec.api.url}")
    private String apiUrl;

    @Value("${reniec.api.key}")
    private String apiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, String> consultarDni(String dni) throws Exception {
        URL url = new URL(apiUrl + "?numero=" + dni);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        int status = conn.getResponseCode();
        if (status != 200) {
            throw new Exception("DNI no encontrado en RENIEC");
        }

        try (InputStream is = conn.getInputStream()) {
            JsonNode node = mapper.readTree(is);
            return Map.of(
                "firstName",      node.path("first_name").asText(""),
                "firstLastName",  node.path("first_last_name").asText(""),
                "secondLastName", node.path("second_last_name").asText(""),
                "fullName",       node.path("full_name").asText(""),
                "documentNumber", node.path("document_number").asText(dni)
            );
        }
    }
}
