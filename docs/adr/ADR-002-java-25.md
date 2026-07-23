# ADR-002: Java 25

- Status: Aceito
- Data: 2026-07-23

## Contexto

O projeto precisa de uma versão moderna e com suporte prolongado para uma base nova.

## Decisão

Usar Java 25 e bloquear builds com versões inferiores por meio do Maven Enforcer.

## Consequências

Desenvolvedores e pipeline precisam usar JDK 25. Bibliotecas adicionadas ao projeto deverão ser compatíveis com essa versão.
