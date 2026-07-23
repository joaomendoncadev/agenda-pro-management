package dev.joaomendonca.agendapro.shared.api;

import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/application")
public class ApplicationInfoController {

    private final String applicationName;

    public ApplicationInfoController(
            @Value("${spring.application.name}") String applicationName) {
        this.applicationName = applicationName;
    }

    @GetMapping
    public Map<String, Object> getApplicationInfo() {
        return Map.of(
                "name", applicationName,
                "status", "UP",
                "timestamp", Instant.now()
        );
    }
}
