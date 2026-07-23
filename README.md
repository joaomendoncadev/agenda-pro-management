# AgendaPro v0.1.0

Sistema de gestão de agenda para salões de beleza, desenvolvido como produto comercial e preparado para evolução futura para SaaS.

Esta versão consolida a **Sprint 0 (fundação técnica)** e a **Sprint 1 (Foundation + Identity)**.

## Funcionalidades

- health checks e informações da aplicação;
- tenant inicial para o estabelecimento;
- bootstrap de uso único para criação do proprietário;
- autenticação por e-mail e senha;
- senhas protegidas com BCrypt;
- access token JWT;
- refresh token opaco armazenado somente como hash SHA-256;
- rotação de refresh token;
- logout com revogação da sessão;
- papéis `OWNER`, `ADMIN` e `EMPLOYEE`;
- consulta do usuário autenticado;
- erros HTTP padronizados com `ProblemDetail`.

## Stack

- Java 25
- Spring Boot 3.5
- Spring Security
- Spring Data JPA
- MySQL 8.4
- Flyway
- Maven Wrapper
- Podman Compose
- GitHub Actions
- Spring Boot Actuator

## Pré-requisitos

- JDK 25;
- Podman Desktop ou Podman CLI;
- `curl` e `unzip` para o primeiro uso do Maven Wrapper.

## Executar localmente

```bash
podman machine start
podman compose up -d
./mvnw clean verify
./mvnw spring-boot:run
```

Em outro terminal:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/v1/application
```

## Criar o primeiro estabelecimento

O endpoint funciona somente enquanto não existir nenhum usuário.

```bash
curl -X POST http://localhost:8080/api/v1/auth/bootstrap \
  -H 'Content-Type: application/json' \
  -H 'X-Bootstrap-Key: agenda-pro-local-bootstrap' \
  -d '{
    "tenantName": "Salão Exemplo",
    "tenantSlug": "salao-exemplo",
    "ownerName": "João Mendonça",
    "email": "admin@agendapro.local",
    "password": "ChangeMe123!"
  }'
```

Guarde `accessToken` e `refreshToken` do retorno.

## Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@agendapro.local",
    "password": "ChangeMe123!"
  }'
```

## Usuário autenticado

```bash
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Renovar sessão

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

O token anterior é revogado quando um novo par é emitido.

## Logout

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/logout \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

## Estrutura

```text
src/main/java/dev/joaomendonca/agendapro
├── identity
│   ├── api
│   ├── application
│   ├── configuration
│   ├── domain
│   └── infrastructure
├── shared
│   ├── api
│   ├── exception
│   └── web
└── AgendaProApplication.java
```

## Configuração

Variáveis disponíveis em `.env.example`:

- `DATABASE_URL`;
- `DATABASE_USERNAME`;
- `DATABASE_PASSWORD`;
- `JWT_ISSUER`;
- `JWT_SECRET`;
- `JWT_ACCESS_TOKEN_TTL`;
- `JWT_REFRESH_TOKEN_TTL`;
- `BOOTSTRAP_KEY`.

Os valores padrão são exclusivamente para desenvolvimento local.

## Banco de dados

O Hibernate valida o schema e não o cria. Alterações estruturais devem ser adicionadas como migrations em:

```text
src/main/resources/db/migration
```

Não apague o volume da Sprint 0: o Flyway aplicará automaticamente a migration V2.

## Documentação

- decisões arquiteturais: `docs/adr`;
- especificações: `docs/rfc`;
- notas da versão: `RELEASE_NOTES.md`;
- checklist: `CHECKLIST.md`.
