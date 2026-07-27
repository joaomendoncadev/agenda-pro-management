# Checklist da versão v0.1.0

## Build

- [ ] `java -version` retorna Java 25
- [ ] `./mvnw clean verify` finaliza com `BUILD SUCCESS`

## Infraestrutura

- [ ] `podman machine start`
- [ ] `podman compose up -d`
- [ ] `podman compose ps` mostra o MySQL em execução

## Aplicação

- [ ] `./mvnw spring-boot:run`
- [ ] `/actuator/health` retorna `UP`
- [ ] `/api/v1/application` retorna informações da aplicação

## Identity

- [ ] bootstrap retorna HTTP 201
- [ ] segundo bootstrap retorna HTTP 409
- [ ] login válido retorna tokens
- [ ] login inválido retorna HTTP 401
- [ ] `/api/v1/users/me` exige Bearer token
- [ ] refresh emite novo par de tokens
- [ ] reutilização do refresh anterior retorna HTTP 401
- [ ] logout retorna HTTP 204

## Git

- [ ] branch `feature/identity-foundation`
- [ ] arquivos sensíveis não foram commitados
- [ ] commit: `feat(identity): implement authentication foundation`
