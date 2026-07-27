# RFC-001: Foundation + Identity

- Status: Implementado
- Sprint: 1

## Endpoints

| Método | Rota | Proteção |
|---|---|---|
| POST | `/api/v1/auth/bootstrap` | `X-Bootstrap-Key` |
| POST | `/api/v1/auth/login` | Pública |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Refresh token |
| GET | `/api/v1/users/me` | Bearer JWT |

## Fora do escopo

Recuperação de senha, convite de funcionários, MFA, troca de senha, administração de papéis e cookies HttpOnly.
