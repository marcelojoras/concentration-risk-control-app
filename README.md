# Sistema de Gestão de Empréstimos

Um backend robusto e bem arquitetado para gerenciar empréstimos com validação de concentração geográfica, desenvolvido com **Domain Driven Design (DDD)** e **TypeScript**.

## Visão Geral da Solução

### Problema de Negócio

Uma empresa de empréstimos opera em todo o Brasil e precisa evitar concentração excessiva de risco em uma única região:
- **Limite padrão**: Máximo 10% do valor total emprestado por estado
- **Exceção São Paulo**: Máximo 20% (estado maior e mais populoso)

O sistema impede a criação de empréstimos que violem essas regras, garantindo diversificação de risco.

### O que foi Implementado

- **API REST** para criar empréstimos (`POST /loans`)
- **Endpoint de consulta** de concentração por estado (`GET /loans/concentration/:state`)
- **Validação de concentração** em tempo real
- **Persistência** em MongoDB
- **Testes unitários** com Jest
- **Arquitetura DDD** com separação clara de camadas

## Decisões Técnicas

### 1. **NodeJS e MongoDB**

**Decisão:** Usar NodeJS para construção do backend e MongoDB para persistência dos dados

**Justificativa:**
- Simplicidade para construir APIs
- Typescript combina muito bem com DDD através de tipagem forte
- MongoDB possui Modelo simples de documento e Flexibilidade de schema
- Alta velocidade de desenvolvimento
- São stacks que possuo familiaridade

### 2. **Domain Driven Design (DDD)**

**Decisão:** Usar DDD como padrão arquitetural.

**Justificativa:**
- Regras de concentração são o coração do negócio
- Facilita comunicação entre devs e especialistas de negócio
- Cenário pode evoluir (novos estados com limites especiais)
- Código de negócio fica centralizado e testável

**Implementação:**
- Domain: Entities, Value Objects, Services, Repositories (interfaces)
- Application: Use Cases, DTOs
- Infrastructure: MongoDB, implementações concretas
- Presentation: Controllers, Routes

### 3. **Value Objects para UF (Estado)**

**Decisão:** Encapsular validação de UF em um Value Object.

**Justificativa:**
- Impossível criar um State inválido em qualquer contexto
- Validação centralizada em um único lugar
- Type-safe: TypeScript garante que é sempre um State válido
- Reutilizável em múltiplas camadas

### 4. **Domain Service para Validação de Concentração**

**Decisão:** Lógica de concentração em um Domain Service, não em uma Entity.

**Justificativa:**
- Concentração é uma regra que envolve múltiplos empréstimos
- Não pertence a uma única entidade
- Reutilizável em múltiplos contextos (criar empréstimo, consultar concentração)
- Testável isoladamente

### 5. **Repository Pattern com Dependency Inversion**

**Decisão:** Interface no domain, implementação na infrastructure.

**Justificativa:**
- Domain não conhece MongoDB
- Facilita testes com mocks
- Permite migrar para outro banco sem alterar o domínio
- Respeita princípios SOLID

### 6. **Testes com Jest + mocks do Repositório**

**Decisão:** Testes unitários sem banco de dados.

**Justificativa:**
- Rápidos (milissegundos vs segundos)
- Sem dependências externas (MongoDB)
- Fácil de rodar em CI/CD
- Focam em regras de negócio, não em infra
- 35+ casos testando cenários críticos

## Premissas Consideradas

### Premissas de Negócio
- Apenas 2 categorias de limites: 10% (padrão) e 20% (SP)
- Limites aplicam-se ao **valor total** emprestado
- Primeiro empréstimo é sempre permitido (sem comparação)
- Todas as 27 UFs brasileiras são válidas
- Um empréstimo tem exatamente uma UF

### Premissas Técnicas
- Validação ocorre **antes** de persistir (fail-fast)
- MongoDB é sempre disponível (sem retry logic)
- Não há autenticação obrigatória
- Sem paginação para listagens (escala pequena)
- Sem soft-deletes (empréstimos são imutáveis)

### Premissas de Performance
- Carrega todos os empréstimos em memória para validação
- Adequado para até ~100k empréstimos
- Sem índices especiais criados no MongoDB

## Como Rodar

### Pré-requisitos
```bash
node >= 18
npm >= 9
MongoDB Atlas (ou local)
```

### Instalação
```bash
npm install
```

### Configuração
Crie `.env` baseado em `.env.example`:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=seu-app
PORT=3000
```

Recomendo utilizar o MongoDB Atlas, basta criar um cluster e inserir a string de conexão na variável MONGO_URI (Caso prefira, pode usar a minha, meu MongoDB Atlas já possui uma carga de dados inicial válida. Deixarei meu .env em anexo no email de envio do projeto). Caso prefira criar sua própria string de conexão você poderá testar a criação do primeiro empréstimo.

### Executar
```bash
npm run dev        # Modo desenvolvimento
npm test           # Testes
npm test:watch     # Testes em watch
npm test:coverage  # Cobertura de código
```

### Testar Endpoints

**Cenário 1: Criar primeiro empréstimo**
```json
POST /loans
{ "value": 100000, "state": "RJ" }
→ 201 Created (Primeiro empréstimo sempre é válido, independente do valor)
```

**Cenário 2: Adicionar mais ao RJ**
```json
POST /loans
{ "value": 50000, "state": "RJ" }
→ 400 Error (150k de RJ em 150k total = 100% > 10%)
```

**Cenário 3: Distribuir entre estados**
```json
POST /loans (1º)
{ "value": 100000, "state": "RJ" }
→ 201 Created

POST /loans (2º)
{ "value": 25000, "state": "SP" }
→ 201 Created (SP: 25000 de 125000k = 20%, RJ: 100000k = 80% pois foi o primeiro empréstimo, conforme outros forem sendo adicionados, a porcentagem de RJ irá diminuir)
```

**Cenário 4: Checar porcentagem de distribuição em um estado específico**
```json
GET /loans/concentration/:state
→ 200 ok
```

## O que Faria Diferente ou Evoluiria

1. **Autenticação JWT**
   - Integrar middleware de validação
   - Proteger endpoints

2. **Listagem de Empréstimos**
   - `GET /loans` com paginação
   - Filtros por estado, data e ordenação

3. **Logging e Monitoramento**
   - Criar um sistema de logs com a biblioteca Pino
   - Rastreabilidade e auditoria

4. **Tratamento de Limites Dinâmicos**
    - Limites por estado configuráveis
    - Sem hardcode (subir para tabela)
    - Admin endpoint para atualizar

5. **Paginação e Performance**
   - Índices no MongoDB
   - Agregação direto no BD (em vez de carregar tudo)

6. **Criação de uma UI Frontend**
   - Plataforma visual para cadastro de novos empréstimos
   - Visualização em tempo real de porcentagem por estado
   - Consumo das APIs do backend

## Arquitetura DDD

A arquitetura segue o padrão de **4 camadas** do DDD:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│         (Controllers, Routes, HTTP Requests/Responses)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│           (Use Cases, DTOs, Application Services)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│    (Entities, Value Objects, Domain Services, Interfaces)   │
│                     CORE DO NEGÓCIO                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│     (MongoDB, Repositories, Database Connection, Schema)    │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

```
src/
├── domain/                           # CAMADA DE NEGÓCIO
│   ├── config/
│   │   └── constants.ts             # Constantes (UFs, limites de concentração)
│   ├── entities/
│   │   └── Loan.ts                  # Entidade com lógica de negócio
│   ├── value-objects/
│   │   └── State.ts                 # VO que valida e representa UF
│   ├── services/
│   │   └── ConcentrationValidator.ts # Serviço que valida concentração
│   └── repositories/
│       └── LoanRepository.ts        # Interface (contrato) do repositório
│
├── application/                      # CAMADA DE APLICAÇÃO
│   ├── dtos/
│   │   ├── CreateLoanDTO.ts         # DTO de entrada
│   │   ├── LoanResponseDTO.ts       # DTO de saída
│   │   └── StateLoanConcentrationDTO.ts # DTO de concentração
│   └── use-cases/
│       ├── CreateLoanUseCase.ts     # Orquestra criação de empréstimo
│       └── GetStateLoanConcentrationUseCase.ts # Consulta concentração
│
├── infrastructure/                   # CAMADA DE INFRAESTRUTURA
│   ├── database/
│   │   ├── mongoConnection.ts       # Conexão com MongoDB
│   │   └── schemas/
│   │       └── LoanSchema.ts        # Schema Mongoose
│   └── repositories/
│       └── MongoLoanRepository.ts   # Implementação do repositório
│
├── presentation/                     # CAMADA DE APRESENTAÇÃO
│   ├── controllers/
│   │   └── LoanController.ts        # Controller HTTP
│   └── routes/
│       └── loanRoutes.ts            # Definição de rotas
│
├── __tests__/                     # TESTES UNITÁRIOS
│
└── server.ts                         # Arquivo principal
```

## Características Principais do projeto

- **Type-safe**: TypeScript strict mode
- **Testável**: 35+ testes unitários
- **Reutilizável**: Sem repetição de código (DRY)
- **Escalável**: Fácil adicionar novos estados/limites
- **Profissional**: Segue boas práticas da indústria
- **Pragmático**: Sem over-engineering
