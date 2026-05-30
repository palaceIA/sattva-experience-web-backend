# Configuração do Supabase

Este projeto está configurado para usar **Supabase** como banco de dados PostgreSQL gerenciado.

## 📋 O que é Supabase?

Supabase é uma plataforma open-source que fornece:
- PostgreSQL gerenciado na nuvem
- API RESTful automática
- Autenticação integrada
- Realtime capabilities
- Storage de arquivos
- Edge Functions

Site: [supabase.com](https://supabase.com)

## 🚀 Primeiros Passos

### 1. Criar um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start Your Project"**
3. Faça login ou crie uma conta
4. Clique em **"Create a new project"**
5. Preencha os dados:
   - **Project name**: `sattva-experience` (ou outro nome)
   - **Database password**: Guarde este senha com segurança!
   - **Region**: Escolha a região mais próxima

### 2. Obter a string de conexão

1. Após criar o projeto, vá a **Project Settings**
2. Clique em **Database**
3. Procure por **"Connection string"**
4. Copie a URI (formato: `postgresql://postgres.[projeto].supabase.co:5432/postgres?password=...`)

### 3. Criar as tabelas

#### Opção A: Via SQL Editor do Supabase (Recomendado)

1. No dashboard do Supabase, clique em **SQL Editor**
2. Clique em **"New query"**
3. Cole o SQL abaixo:

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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lots_id_immersion ON lots(id_immersion);
CREATE INDEX IF NOT EXISTS idx_lots_data_fim ON lots(data_fim);
CREATE INDEX IF NOT EXISTS idx_immersions_data ON immersions(data);
```

4. Clique em **"Run"** (ou Ctrl+Enter)

#### Opção B: Via pgAdmin

Se preferir usar uma ferramenta externa:

1. Instale [pgAdmin](https://www.pgadmin.org/) ou outro cliente PostgreSQL
2. Conecte usando a string de conexão do Supabase
3. Execute o SQL acima

### 4. Configurar a aplicação

1. Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env`:
```env
DATABASE_URL=postgresql://postgres.[seu-projeto].supabase.co:5432/postgres?password=sua_senha_aqui
PORT=3000
NODE_ENV=development
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor:
```bash
npm run dev
```

## 🔐 Segurança

### ⚠️ Importante: Proteja sua senha

A string de conexão contém sua senha. **Nunca** a compartilhe ou commit no Git:

1. Adicione `.env` ao `.gitignore` (já está por padrão)
2. Use variáveis de ambiente em produção
3. Rotacione a senha do banco regularmente

### Boas Práticas

1. **Em Desenvolvimento**: Use a string de conexão no `.env`
2. **Em Produção**: Use variáveis de ambiente seguras (Vercel, Heroku, AWS, etc)
3. **Backup**: Faça backups regulares do Supabase
4. **Row Level Security (RLS)**: Implemente RLS para dados sensíveis

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase SQL Editor Guide](https://supabase.com/docs/guides/database/overview)

## 🆘 Troubleshooting

### "Error: connect ECONNREFUSED"
- Verifique se a string de conexão está correta
- Verifique se seu IP está na allowlist (Supabase > Settings > Network)
- Teste a conexão com `psql` ou pgAdmin

### "password authentication failed"
- Verifique se a senha na URL está correta
- Redefina a senha do banco em Supabase > Settings > Database

### "SSL connection error"
- Supabase requer SSL para conexões remotas
- A biblioteca `pg` já lida com isso automaticamente

### Tabelas não aparecem
- Verifique se o SQL foi executado com sucesso no SQL Editor
- Atualize a página do Supabase
- Verifique se está no schema `public`

## 💾 Fazer Backup

### Via Supabase Dashboard
1. Vá a **Settings** > **Database**
2. Clique em **"Backups"**
3. Clique em **"Create backup"** ou configure backups automáticos

### Via pgAdmin
1. Conecte ao banco
2. Clique com botão direito no banco
3. Selecione **"Backup"**

## 🔄 Espelhando Dados Localmente

Se quiser manter uma cópia local do banco:

```bash
# Backup remoto
pg_dump "postgresql://postgres:[senha]@[projeto].supabase.co:5432/postgres" > backup.sql

# Restaurar localmente (se tiver PostgreSQL local)
psql -U postgres -d sattva_experience < backup.sql
```

## ✨ Próximos Passos

1. Implementar autenticação (Supabase Auth integrado)
2. Adicionar Row Level Security (RLS)
3. Configurar webhooks para notificações
4. Usar Supabase Realtime para atualizações em tempo real

