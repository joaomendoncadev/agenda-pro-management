# Sprint 0 — Build Base

## Incluído

- configuração Maven e Java 25;
- Spring Boot Web, JPA, Validation, Actuator e Flyway;
- MySQL 8.4 com Podman Compose;
- configuração por variáveis de ambiente;
- migration inicial;
- endpoint de informações da aplicação;
- testes de contexto e endpoint;
- CI no GitHub Actions;
- convenções de editor e Git;
- ADRs iniciais;
- README operacional.

## Como aplicar

Na raiz do repositório, extraia o conteúdo do ZIP mantendo a estrutura de pastas. O pacote não contém `.git` e não altera sua branch.

Se o Spring Initializr já criou `application.properties`, remova-o para evitar duas fontes de configuração.

## Validação

```bash
git branch --show-current
java -version
./mvnw clean verify
podman compose up -d
./mvnw spring-boot:run
```

Em outro terminal:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/v1/application
```

## Commit sugerido

```text
chore(bootstrap): establish AgendaPro project foundation
```
