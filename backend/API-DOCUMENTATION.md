# Sattva Experience - API de Imersões e Lotes

## Visão Geral

API completa para gerenciar imersões (eventos da empresa) e seus lotes com preços e datas. O sistema automaticamente troca para o próximo lote quando a data limite do lote atual é atingida.

## Tecnologias

- **Node.js** com TypeScript
- **Express.js** para as rotas HTTP
- **PostgreSQL** para banco de dados
- **CORS** habilitado

## Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente do Supabase

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com sua string de conexão do Supabase. Obtenha em **Project Settings > Database > Connection string (URI)**:

```
DATABASE_URL=postgresql://postgres.[seu-projeto].supabase.co:5432/postgres?password=sua_senha_aqui
PORT=3000
NODE_ENV=development
```

### 3. Verificar se as tabelas existem no Supabase

As tabelas devem estar criadas em seu projeto Supabase. Se não estiverem, acesse **SQL Editor** no Supabase e execute:

```sql
-- Tabela de imersões
CREATE TABLE IF NOT EXISTS immersions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data DATE NOT NULL,
  local VARCHAR(255) NOT NULL,
  qtd_lote INT NOT NULL CHECK (qtd_lote > 0),
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lotes
CREATE TABLE IF NOT EXISTS lots (
  id SERIAL PRIMARY KEY,
  id_immersion INT NOT NULL,
  lote_number INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_immersion FOREIGN KEY (id_immersion) 
    REFERENCES immersions(id) ON DELETE CASCADE,
  CONSTRAINT check_dates CHECK (data_fim > data_inicio),
  UNIQUE(id_immersion, lote_number)
);
```

## Iniciar o servidor

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`

**Nota**: Certifique-se de que as tabelas foram criadas no Supabase antes de iniciar.

## Documentação da API

### BASE_URL: `http://localhost:3000`

---

## ENDPOINTS - IMERSÕES

### 1. Criar Nova Imersão
**POST** `/api/immersions`

```json
{
  "name": "Imersão de Verão 2026",
  "description": "Uma semana de aprendizado intensivo",
  "data": "2026-07-15",
  "local": "São Paulo, SP",
  "qtd_lote": 3,
  "valor": 5000.00
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Imersão criada com sucesso",
  "data": {
    "id": 1,
    "name": "Imersão de Verão 2026",
    "description": "Uma semana de aprendizado intensivo",
    "data": "2026-07-15",
    "local": "São Paulo, SP",
    "qtd_lote": 3,
    "valor": "5000.00",
    "created_at": "2026-05-30T10:00:00.000Z",
    "updated_at": "2026-05-30T10:00:00.000Z"
  }
}
```

### 2. Listar Todas as Imersões
**GET** `/api/immersions`

Query parameters (opcionais):
- `limit` - Limite de resultados
- `offset` - Deslocamento para paginação

**Resposta (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### 3. Listar Imersões Ativas (Futuras)
**GET** `/api/immersions/active`

**Resposta (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### 4. Obter Imersão por ID
**GET** `/api/immersions/:id`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    ...
  }
}
```

### 5. Obter Imersão com Seus Lotes
**GET** `/api/immersions/:id/with-lots`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Imersão de Verão 2026",
    ...,
    "lots": [
      {
        "id": 1,
        "lote_number": 1,
        "valor": "4500.00",
        "quantity_available": 50,
        "data_inicio": "2026-06-01",
        "data_fim": "2026-06-15",
        "is_active": true
      },
      ...
    ]
  }
}
```

### 6. Atualizar Imersão
**PUT** `/api/immersions/:id`

```json
{
  "name": "Imersão de Verão 2026 - Edição Especial",
  "valor": 5500.00
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Imersão atualizada com sucesso",
  "data": {...}
}
```

### 7. Deletar Imersão
**DELETE** `/api/immersions/:id`

**Resposta (200):**
```json
{
  "success": true,
  "message": "Imersão deletada com sucesso"
}
```

---

## ENDPOINTS - LOTES

### 1. Criar Novo Lote
**POST** `/api/lots`

```json
{
  "id_immersion": 1,
  "lote_number": 1,
  "valor": 4500.00,
  "quantity_available": 50,
  "data_inicio": "2026-06-01",
  "data_fim": "2026-06-15"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Lote criado com sucesso",
  "data": {
    "id": 1,
    "id_immersion": 1,
    "lote_number": 1,
    "valor": "4500.00",
    "quantity_available": 50,
    "data_inicio": "2026-06-01",
    "data_fim": "2026-06-15",
    "created_at": "2026-05-30T10:00:00.000Z"
  }
}
```

### 2. Listar Todos os Lotes
**GET** `/api/lots`

Query parameters (opcionais):
- `limit` - Limite de resultados
- `offset` - Deslocamento para paginação

### 3. Obter Lotes de uma Imersão
**GET** `/api/lots/immersion/:id`

Retorna todos os lotes de uma imersão específica

### 4. Obter Lote Ativo da Imersão
**GET** `/api/lots/immersion/:id/active`

**Lógica de Ativação:**
- Se hoje está entre `data_inicio` e `data_fim`, retorna esse lote
- Se não, retorna o próximo lote (cujo `data_inicio` > hoje)
- Se nenhum lote ativo for encontrado, retorna 404

```json
{
  "success": true,
  "message": "Lote ativo da imersão",
  "data": {
    "id": 1,
    "lote_number": 1,
    ...
  }
}
```

### 5. Obter Lotes Próximos de Expirar
**GET** `/api/lots/upcoming-expiry`

Query parameters (opcionais):
- `days` - Número de dias antes do vencimento (default: 7)

```json
{
  "success": true,
  "count": 2,
  "message": "Lotes próximos de expirar nos próximos 7 dias",
  "data": [...]
}
```

### 6. Obter Lotes Expirados
**GET** `/api/lots/expired`

Retorna todos os lotes cuja `data_fim` é menor que hoje

### 7. Comprar Lugares (Decrementar Quantidade)
**POST** `/api/lots/:id/buy`

```json
{
  "quantity": 2
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "2 lugar(es) comprado(s) com sucesso",
  "data": {
    "id": 1,
    "quantity_available": 48,
    ...
  }
}
```

**Resposta (400):** Se não houver quantidade suficível

### 8. Adicionar Lugares (Incrementar Quantidade)
**POST** `/api/lots/:id/add-quantity`

```json
{
  "quantity": 5
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "5 lugar(es) adicionado(s) com sucesso",
  "data": {
    "id": 1,
    "quantity_available": 55,
    ...
  }
}
```

### 9. Atualizar Lote
**PUT** `/api/lots/:id`

```json
{
  "valor": 4800.00,
  "quantity_available": 45
}
```

### 10. Deletar Lote
**DELETE** `/api/lots/:id`

---

## Características Principais

### 🔄 Mudança Automática de Lotes

O sistema automaticamente identifica qual lote está ativo com base nas datas:

1. **Quando hoje está entre `data_inicio` e `data_fim`**: Esse lote é considerado ativo
2. **Quando `data_fim` é atingida**: O sistema automaticamente vai para o próximo lote
3. **Endpoint `/immersions/:id/active-lot`**: Sempre retorna o lote correto e ativo

### 📊 Gerenciamento de Quantidade

- **Decrementar**: Quando um cliente compra uma quantidade de lugares
- **Incrementar**: Quando um cliente devolve ou cancela sua compra
- **Validação**: O sistema evita vendas acima da quantidade disponível

### 📅 Alertas de Vencimento

- **`/lots/upcoming-expiry`**: Obtém lotes próximos de expirar (customizável em dias)
- **`/lots/expired`**: Obtém lotes já expirados

---

## Exemplos de Uso com cURL

### Criar uma Imersão

```bash
curl -X POST http://localhost:3000/api/immersions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Imersão de Verão",
    "description": "Evento especial",
    "data": "2026-07-15",
    "local": "São Paulo",
    "qtd_lote": 3,
    "valor": 5000.00
  }'
```

### Criar um Lote

```bash
curl -X POST http://localhost:3000/api/lots \
  -H "Content-Type: application/json" \
  -d '{
    "id_immersion": 1,
    "lote_number": 1,
    "valor": 4500.00,
    "quantity_available": 50,
    "data_inicio": "2026-06-01",
    "data_fim": "2026-06-15"
  }'
```

### Obter Lote Ativo

```bash
curl http://localhost:3000/api/immersions/1/active-lot
```

### Comprar Lugares

```bash
curl -X POST http://localhost:3000/api/lots/1/buy \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

---

## Estrutura do Banco de Dados

### Tabela: `immersions`
```sql
id (Primary Key)
name (VARCHAR 255)
description (TEXT)
data (DATE)
local (VARCHAR 255)
qtd_lote (INT) - Quantidade de lotes
valor (DECIMAL 10,2) - Preço base
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tabela: `lots`
```sql
id (Primary Key)
id_immersion (Foreign Key → immersions)
lote_number (INT) - Número sequencial do lote
valor (DECIMAL 10,2) - Preço do lote
quantity_available (INT) - Quantidade de lugares disponíveis
data_inicio (DATE) - Quando o lote começa a ser vendido
data_fim (DATE) - Quando o lote deixa de ser vendido
created_at (TIMESTAMP)

Constraints:
- UNIQUE(id_immersion, lote_number)
- CHECK(data_fim > data_inicio)
- CHECK(valor > 0)
- CHECK(quantity_available >= 0)
```

---

## Status de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro do servidor |

---

## Próximos Passos

1. Implementar autenticação e autorização
2. Adicionar testes unitários e de integração
3. Implementar caching (Redis)
4. Adicionar logs estruturados
5. Implementar notificações de vencimento de lotes
6. Criar dashboard de administração

