package dev.joaomendonca.agendapro.identity.api;

import dev.joaomendonca.agendapro.identity.application.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/bootstrap")
    ResponseEntity<TokenResponse> bootstrap(
            @RequestHeader("X-Bootstrap-Key") String key,
            @Valid @RequestBody BootstrapRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.bootstrap(key, request));
    }

    @PostMapping("/login")
    TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
