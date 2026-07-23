# ADR-004: Estratégia de identidade e tokens

- Status: Aceito
- Data: 2026-07-23

## Decisão

- O módulo será chamado `identity`.
- Access tokens serão JWTs curtos assinados com HS256.
- Refresh tokens serão aleatórios, opacos e persistidos somente como SHA-256.
- O refresh token será rotacionado em cada renovação.
- Senhas serão armazenadas com BCrypt.
- O primeiro tenant e OWNER serão criados por bootstrap de uso único, protegido por chave externa.
- Todo usuário terá `tenant_id` desde a primeira versão.

## Consequências

O access token permanece stateless e as sessões longas podem ser revogadas. Segredos devem vir de um gerenciador de segredos fora do ambiente local. Rotação de chave JWT será obrigatória antes de produção.
