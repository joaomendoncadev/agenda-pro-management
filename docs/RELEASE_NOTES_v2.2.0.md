# AgendaPro v2.2.0 — Estabilidade operacional

Esta entrega inicia a fase de estabilização antes da expansão funcional.

## Correções

- removidos imports TypeScript não utilizados em EmployeesPage;
- substituído o ícone inexistente `CashRegister` por `Landmark`;
- removidos imports não utilizados em OperationsPage;
- adicionada tela de recuperação para erros inesperados do React, evitando página totalmente branca;
- versão mínima recomendada de Node documentada por `.nvmrc`;
- adicionados scripts `clean` e `dev:host` no frontend.

## Validação local

```bash
cd frontend
npm install
npm run build
npm run dev
```
