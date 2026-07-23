# AgendaPro

Sistema de gestão de agenda para salões de beleza, construído como produto comercial e preparado para evolução futura para SaaS.

## Stack inicial

- Java 25
- Spring Boot 3.5
- Maven
- MySQL 8.4
- Flyway
- Podman
- GitHub Actions
- Spring Boot Actuator

## Pré-requisitos

- JDK 25
- Podman
- Podman Compose

## Executar localmente

```bash
podman machine start
podman compose up -d
./mvnw spring-boot:run
```

Verifique:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/v1/application
```

## Testes

```bash
./mvnw clean verify
```

Os testes usam banco H2 em memória no perfil `test`, portanto não dependem do MySQL local.

## Banco de dados

O Hibernate apenas valida o schema. Toda alteração estrutural deve ser criada em `src/main/resources/db/migration`.

Credenciais locais padrão:

- database: `agenda_pro`
- username: `agenda_pro`
- password: `agenda_pro`

Sobrescreva configurações por variáveis de ambiente. Consulte `.env.example`.

## Estrutura inicial

```text
src/main/java/dev/joaomendonca/agendapro
├── shared
└── AgendaProApplication.java
```

Os módulos de negócio serão adicionados incrementalmente, começando por autenticação e identidade.

## Branch atual

```text
feature/build-base
```

## Commit sugerido

```text
chore(bootstrap): establish AgendaPro project foundation
```
