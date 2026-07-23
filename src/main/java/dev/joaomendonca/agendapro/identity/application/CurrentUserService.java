package dev.joaomendonca.agendapro.identity.application;

import java.util.UUID;
import dev.joaomendonca.agendapro.identity.api.CurrentUserResponse;
import dev.joaomendonca.agendapro.identity.infrastructure.UserRepository;
import dev.joaomendonca.agendapro.shared.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {
    private final UserRepository users;

    public CurrentUserService(UserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse get(UUID userId) {
        return users.findById(userId).map(CurrentUserResponse::from)
                .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Usuário não encontrado."));
    }
}
