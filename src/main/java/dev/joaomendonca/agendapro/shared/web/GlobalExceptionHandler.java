package dev.joaomendonca.agendapro.shared.web;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import dev.joaomendonca.agendapro.shared.exception.ConflictException;
import dev.joaomendonca.agendapro.shared.exception.DomainException;
import dev.joaomendonca.agendapro.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ConflictException.class)
    ProblemDetail conflict(ConflictException ex, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, ex, request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    ProblemDetail unauthorized(UnauthorizedException ex, HttpServletRequest request) {
        return problem(HttpStatus.UNAUTHORIZED, ex, request);
    }

    @ExceptionHandler(DomainException.class)
    ProblemDetail domain(DomainException ex, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, ex, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "A requisição contém campos inválidos.");
        detail.setTitle("Validation failed");
        detail.setType(URI.create("https://agenda-pro.dev/problems/validation"));
        detail.setInstance(URI.create(request.getRequestURI()));
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        detail.setProperty("code", "VALIDATION_ERROR");
        detail.setProperty("fields", fields);
        return detail;
    }

    private ProblemDetail problem(HttpStatus status, DomainException ex, HttpServletRequest request) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
        detail.setTitle(status.getReasonPhrase());
        detail.setType(URI.create("https://agenda-pro.dev/problems/" + ex.getCode().toLowerCase()));
        detail.setInstance(URI.create(request.getRequestURI()));
        detail.setProperty("code", ex.getCode());
        return detail;
    }
}
