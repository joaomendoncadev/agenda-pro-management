# AgendaPro

SaaS de gestão para salões e profissionais de beleza. Esta versão contém backend Spring Boot e frontend React.

## Tecnologias

### Backend
- Java 25, Spring Boot 3.5, Spring Security, JWT, JPA, Flyway e MySQL.

### Frontend
- React, TypeScript, Vite e CSS responsivo.

## Executar localmente

### 1. Banco e backend

```bash
podman compose up -d
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

### Credenciais locais

Após executar o bootstrap já criado na versão anterior:

- E-mail: `admin@agendapro.local`
- Senha: `ChangeMe123!`

## Funcionalidades visuais
- Login e logout.
- Renovação automática da sessão.
- Dashboard.
- Cadastro, edição, busca e filtro de funcionários.
- Ativação e inativação.
- Jornada semanal.
- Bloqueios de agenda.


## Frontend foundation

O frontend utiliza React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS e Sonner.

## Módulo de clientes (v0.5.0)

Após efetuar login, acesse **Clientes** no menu lateral. A tela permite cadastrar, editar, pesquisar, filtrar e ativar/inativar clientes, além de acompanhar aniversários próximos.

## AgendaPro v0.7.0

Além de identidade, funcionários e clientes, esta versão contém catálogo de serviços e agenda diária.

Fluxo recomendado para validação:
1. Cadastre ao menos um funcionário ativo.
2. Cadastre ao menos um cliente ativo.
3. Cadastre um serviço com duração e preço.
4. Abra **Agenda** e crie um agendamento.
5. Tente cadastrar outro atendimento para o mesmo profissional no mesmo horário para validar o conflito.

## AgendaPro 1.0.0

MVP consolidado com autenticação multi-tenant, equipe, clientes, serviços, agenda, financeiro, dashboard e configurações.

### Execução

```bash
podman compose up -d
./mvnw spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

### Integração de pagamentos

A migration cria a estrutura de assinaturas. Para cobrança real é necessário escolher Mercado Pago ou Stripe, configurar credenciais em variáveis de ambiente e implementar webhooks assinados. Nenhuma cobrança é executada no modo local.
