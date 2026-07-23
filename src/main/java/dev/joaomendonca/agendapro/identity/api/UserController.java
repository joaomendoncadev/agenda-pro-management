package dev.joaomendonca.agendapro.identity.api;

import java.util.UUID;
import dev.joaomendonca.agendapro.identity.application.CurrentUserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final CurrentUserService currentUserService;

    public UserController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    CurrentUserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return currentUserService.get(UUID.fromString(jwt.getSubject()));
    }
}
