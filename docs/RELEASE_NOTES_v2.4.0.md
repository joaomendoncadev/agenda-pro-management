# AgendaPro v2.4.0 — Estoque e Comissões

Esta versão inicia a operação financeira completa do AgendaPro.

## Entregas

- cadastro de produtos com SKU, categoria, preço de venda e custo;
- saldo atual e estoque mínimo;
- entradas, saídas e ajustes de inventário;
- bloqueio de saída que deixaria estoque negativo;
- histórico das últimas 200 movimentações;
- painel de produtos abaixo do estoque mínimo;
- cálculo do valor de custo armazenado;
- lançamentos avulsos de comissão;
- consolidação por profissional e período;
- pagamento em lote das comissões pendentes;
- geração automática da despesa financeira ao pagar comissões;
- migration `V9__create_inventory_and_commissions.sql`.

## Próxima etapa sugerida

Evoluir comandas e caixa com desconto, pagamento dividido, sangria, suprimento, estorno e baixa automática de produtos vendidos.
