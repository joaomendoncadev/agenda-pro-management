# Sprint 1 — Foundation + Identity

## Entregas

- tenant e usuário proprietário;
- bootstrap de uso único;
- login com BCrypt;
- JWT de acesso;
- refresh token opaco com hash e rotação;
- logout;
- `/api/v1/users/me`;
- roles OWNER, ADMIN e EMPLOYEE;
- erros padronizados com `ProblemDetail`;
- migration V2;
- testes iniciais;
- ADR e RFC.

## Aplicação

```bash
git checkout main
git pull
git checkout -b feature/identity-foundation
```

Extraia o ZIP na raiz e substitua os arquivos existentes.

## Validação

```bash
./mvnw clean verify
podman compose up -d
./mvnw spring-boot:run
```

### Bootstrap

```bash
curl -X POST http://localhost:8080/api/v1/auth/bootstrap \
  -H 'Content-Type: application/json' \
  -H 'X-Bootstrap-Key: agenda-pro-local-bootstrap' \
  -d '{"tenantName":"Salão Exemplo","tenantSlug":"salao-exemplo","ownerName":"João Mendonça","email":"admin@agendapro.local","password":"ChangeMe123!"}'
```

## Commit

```text
feat(identity): implement authentication foundation
```
