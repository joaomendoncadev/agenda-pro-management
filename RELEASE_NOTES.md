# AgendaPro v0.1.0 — Release Notes

## Objetivo

Disponibilizar uma base completa e executável do AgendaPro, consolidando a fundação técnica e o primeiro módulo de identidade.

## Principais fluxos

1. inicialização do MySQL com Podman;
2. aplicação automática das migrations V1 e V2;
3. criação única do primeiro tenant e usuário proprietário;
4. autenticação e emissão de tokens;
5. renovação com rotação do refresh token;
6. encerramento da sessão por revogação.

## Limitações conhecidas

- não há recuperação ou troca de senha;
- não há convite de funcionários;
- não há MFA;
- a assinatura JWT usa segredo simétrico local;
- o isolamento multi-tenant ainda não é aplicado automaticamente em todas as consultas;
- ainda não existe frontend.

## Próxima versão planejada

`v0.2.0`: funcionários, convites e autorização administrativa.
