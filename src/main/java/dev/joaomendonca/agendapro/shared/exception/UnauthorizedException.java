package dev.joaomendonca.agendapro.shared.exception;

public class UnauthorizedException extends DomainException {
    public UnauthorizedException(String code, String message) {
        super(code, message);
    }
}
