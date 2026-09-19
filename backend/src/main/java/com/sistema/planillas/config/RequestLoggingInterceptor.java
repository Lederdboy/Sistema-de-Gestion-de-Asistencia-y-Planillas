package com.sistema.planillas.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME = "requestStartTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute(START_TIME, startTime);
        log.info("[HTTP IN] {} {} - IP: {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Long startTime = (Long) request.getAttribute(START_TIME);
        long duration = (startTime != null) ? (System.currentTimeMillis() - startTime) : 0;
        
        if (ex != null) {
            log.error("[HTTP OUT] {} {} - Status: {} - Error: {} - Duration: {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), ex.getMessage(), duration);
        } else {
            log.info("[HTTP OUT] {} {} - Status: {} - Duration: {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), duration);
        }
    }
}
