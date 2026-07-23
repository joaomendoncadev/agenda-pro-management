# ADR-003: Podman para ambiente local

- Status: Aceito
- Data: 2026-07-23

## Contexto

O ambiente local precisa ser reproduzível e não deve depender de uma instalação manual do MySQL.

## Decisão

Disponibilizar os serviços de infraestrutura em `compose.yml`, compatível com Podman Compose.

## Consequências

O desenvolvedor precisa ter Podman e Podman Compose disponíveis. Os dados locais ficam persistidos em volume nomeado.
