# README - Sattva Experience Backend

## 📋 Descrição

Backend completo para o sistema de Imersões e Lotes da Sattva Experience. 

O sistema gerencia:
- **Imersões**: Eventos da empresa com informações gerais
- **Lotes**: Grupos de venda com preços diferentes e períodos de disponibilidade

**Recurso principal**: Mudança automática de lotes quando a data limite é atingida.

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de Supabase
```bash
# Criar o arquivo .env
cp .env.example .env

# Editar .env com sua string de conexão do Supabase
# Acesse: Project Settings > Database > Connection string (URI)
# DATABASE_URL=postgresql://postgres.[projeto].supabase.co:5432/postgres?password=sua_senha_aqui
```

### 3. Verificar se as tabelas estão criadas no Supabase
As tabelas já devem estar criadas no seu projeto Supabase. Se não estiverem, execute o SQL em Supabase > SQL Editor:

```sql
-- Tabela de imersões
CREATE TABLE immersions (
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
CREATE TABLE lots (
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

### 4. Iniciar o servidor
```bash
npm run dev
```

Servidor rodando em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── database.ts          # Configuração do Pool PostgreSQL
│   └── database-setup.ts    # Scripts de criação de tabelas
├── models/
│   ├── Immersion.ts         # Tipos/Interfaces de Imersão
│   └── Lot.ts               # Tipos/Interfaces de Lote
├── services/
│   ├── ImmersionService.ts  # Lógica de negócio para Imersões
│   └── LotService.ts        # Lógica de negócio para Lotes
├── controllers/
│   ├── ImmersionController.ts # Manipuladores HTTP para Imersões
│   └── LotController.ts      # Manipuladores HTTP para Lotes
├── routes/
│   ├── immersionRoutes.ts   # Rotas de Imersões
│   └── lotRoutes.ts         # Rotas de Lotes
└── server.ts                # Inicialização do Express
```

## 📚 Documentação da API

Consulte [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) para:
- Todos os endpoints disponíveis
- Exemplos de requisições
- Formatos de resposta
- Validações

## 🔑 Principais Funcionalidades

### ✅ CRUD Completo
- **Imersões**: Create, Read, Update, Delete
- **Lotes**: Create, Read, Update, Delete

### 🔄 Lógica de Mudança de Lotes
```javascript
// Quando um lote vence (data_fim é atingida)
// O sistema automaticamente identifica o próximo lote ativo

GET /api/immersions/:id/active-lot
// Retorna:
// - Lote atual (se data_inicio <= hoje <= data_fim)
// - Próximo lote (se hoje > data_fim do atual)
// - null (se não houver lote disponível)
```

### 💰 Gerenciamento de Quantidade
```javascript
// Comprar lugares
POST /api/lots/:id/buy
{ "quantity": 2 }

// Adicionar lugares (devolução/cancelamento)
POST /api/lots/:id/add-quantity
{ "quantity": 1 }
```

### 📊 Alertas e Relatórios
```javascript
// Lotes próximos de expirar
GET /api/lots/upcoming-expiry?days=7

// Lotes já expirados
GET /api/lots/expired
```

## 🗄️ Banco de Dados

### Tabela: immersions
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| data | DATE | NOT NULL |
| local | VARCHAR(255) | NOT NULL |
| qtd_lote | INT | NOT NULL, CHECK > 0 |
| valor | DECIMAL(10,2) | NOT NULL, CHECK > 0 |
| created_at | TIMESTAMP | DEFAULT NOW |
| updated_at | TIMESTAMP | DEFAULT NOW |

### Tabela: lots
| Campo | Tipo | Restrições |
|-------|------|-----------|
| id | SERIAL | PRIMARY KEY |
| id_immersion | INT | NOT NULL, FOREIGN KEY |
| lote_number | INT | NOT NULL |
| valor | DECIMAL(10,2) | NOT NULL, CHECK > 0 |
| quantity_available | INT | NOT NULL, CHECK >= 0 |
| data_inicio | DATE | NOT NULL |
| data_fim | DATE | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW |
| | | UNIQUE(id_immersion, lote_number) |
| | | CHECK(data_fim > data_inicio) |

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## 📦 Dependências

- **express**: Framework web
- **pg**: Driver PostgreSQL
- **dotenv**: Gerenciamento de variáveis de ambiente
- **cors**: Habilitação de CORS
- **typescript**: Tipagem estática
- **ts-node**: Execução de TypeScript diretamente

## ⚙️ Variáveis de Ambiente

```env
# String de conexão PostgreSQL do Supabase
# Obtém em: Supabase > Project Settings > Database > Connection string (URI)
DATABASE_URL=postgresql://postgres.[seu-projeto].supabase.co:5432/postgres?password=sua_senha

PORT=3000
NODE_ENV=development
```

## 🧪 Testes com cURL

### Health Check
```bash
curl http://localhost:3000/health
```

### Criar Imersão
```bash
curl -X POST http://localhost:3000/api/immersions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Imersão Especial",
    "description": "Uma imersão incrível",
    "data": "2026-07-15",
    "local": "São Paulo",
    "qtd_lote": 3,
    "valor": 5000.00
  }'
```

### Listar Imersões
```bash
curl http://localhost:3000/api/immersions
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se a string de conexão do Supabase está correta em `.env`
- Verifique em Supabase > Project Settings > Database > Connection string
- Certifique-se de que as tabelas foram criadas no Supabase
- Verifique se seu IP está na allowlist do Supabase (se aplicável)

### Erro "ENOENT: no such file or directory, open '.env'"
```bash
cp .env.example .env
```

### Erro de permissão nas tabelas
- Verifique se o usuário PostgreSQL tem permissões corretas
- No Supabase, use o usuário `postgres` ou crie um novo com as permissões necessárias
- Acesse Supabase > SQL Editor para executar comandos de permissão se necessário

## 📝 Notas Importantes

1. **Supabase**: Este projeto usa PostgreSQL hospedado no Supabase. As tabelas devem estar criadas em seu projeto Supabase antes de iniciar a aplicação.

2. **Mudança automática de lotes**: Não há um job agendado. A mudança de lote é feita sob demanda quando você consulta o lote ativo. Para implementar verificações periódicas, considere adicionar um scheduler como `node-cron` ou `bull`.

3. **Validações**: Todas as validações críticas (datas, valores positivos, quantidades) estão implementadas no banco de dados e na aplicação.

4. **Timestamps**: Todos os registros mantêm `created_at` e alguns mantêm `updated_at` para auditoria.

5. **Conexão**: A conexão com o Supabase é gerenciada pelo pool do `pg`. Certifique-se de ter as credenciais corretas no `.env`.

## 🔐 Segurança

Recomendações para produção:
- Implementar autenticação (JWT)
- Adicionar rate limiting
- Validar todas as entradas
- Usar HTTPS
- Adicionar logging de segurança

## 📞 Suporte

Para dúvidas ou problemas, consulte a [API-DOCUMENTATION.md](./API-DOCUMENTATION.md).

