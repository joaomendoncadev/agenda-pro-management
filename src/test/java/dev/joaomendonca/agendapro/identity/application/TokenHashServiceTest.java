package dev.joaomendonca.agendapro.identity.application;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class TokenHashServiceTest {
    private final TokenHashService service = new TokenHashService();

    @Test
    void shouldGenerateDeterministicSha256Hash() {
        assertThat(service.hash("refresh-token"))
                .hasSize(64)
                .isEqualTo(service.hash("refresh-token"))
                .isNotEqualTo(service.hash("another-token"));
    }
}
