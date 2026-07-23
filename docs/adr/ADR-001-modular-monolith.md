# ADR-001: Monólito modular

- Status: Aceito
- Data: 2026-07-23

## Contexto

O produto começa com uma equipe pequena e um único cliente. Microsserviços aumentariam custo operacional, complexidade de deploy, observabilidade e testes distribuídos.

## Decisão

Adotar um monólito modular, com módulos de negócio explícitos e dependências controladas. Spring Modulith será introduzido quando os primeiros módulos de domínio forem implementados.

## Consequências

O sistema terá um único deploy e uma única unidade transacional, sem impedir separação futura de módulos quando existirem motivos técnicos e comerciais concretos.
