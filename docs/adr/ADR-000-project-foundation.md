# ADR-000: Fundação do AgendaPro

- Status: Aceito
- Data: 2026-07-23

## Contexto

O AgendaPro será um sistema comercial de gestão para salões de beleza. A primeira implantação atenderá um único cliente, mas o produto deve permitir evolução futura para SaaS.

## Decisão

Adotar uma base enxuta, testável e preparada para produção, com Java, Spring Boot, Maven, MySQL, Flyway, Podman e GitHub Actions.

## Princípios

- simplicidade antes de abstração;
- schema controlado exclusivamente por migrations;
- configuração externa para segredos e ambientes;
- testes automatizados desde o primeiro commit;
- documentação das decisões arquiteturais;
- evolução incremental para um monólito modular.

## Consequências

A equipe terá uma fundação consistente e auditável, mas deverá manter migrations, documentação e pipeline atualizados em cada mudança relevante.
