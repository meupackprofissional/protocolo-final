# Arquitetura de Rastreamento - Protocolo Site

## 📊 Visão Geral

Este documento descreve a arquitetura completa do sistema de rastreamento de conversões usando Meta Conversions API, Supabase e Hotmart.

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUÁRIO FINAL                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Quiz Page     │
                    │  (Frontend)     │
                    └────────┬────────┘
                             │
                    ┌────────▼──────────────────────┐
                    │  POST /api/quiz/submit        │
                    │  - email, phone               │
                    │  - quiz_responses             │
                    │  - fbp, fbc (cookies)         │
                    └────────┬──────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐          ┌──────────┐        ┌──────────┐
   │Supabase │          │Meta CAPI │        │  Logs   │
   │ leads   │          │Lead Event│        │ Console │
   └─────────┘          └──────────┘        └──────────┘
        │
        │ (Usuário compra)
        │
        ▼
   ┌──────────────────────────────────┐
   │  Hotmart Purchase Approved       │
   │  (Webhook POST)                  │
   └────────┬─────────────────────────┘
            │
   ┌────────▼──────────────────────┐
   │  POST /api/webhooks/hotmart    │
   │  - Validar assinatura          │
   │  - Buscar lead no Supabase     │
   │  - Salvar compra               │
   └────────┬──────────────────────┘
            │
   ┌────────▼──────────────────────┐
   │  POST /api/meta/purchase       │
   │  - Enviar evento Purchase      │
   │  - Incluir fbp/fbc do lead     │
   └────────┬──────────────────────┘
            │
        ┌───┴────┬──────────┬──────────┐
        ▼        ▼          ▼          ▼
   ┌────────┐┌──────┐┌──────────┐┌──────┐
   │Supabase││Meta  ││Analytics ││Logs │
   │purchase││Event ││Dashboard ││     │
   └────────┘└──────┘└──────────┘└──────┘
```

## 📁 Estrutura de Arquivos

```
server/
├── supabase.ts              # Cliente Supabase + queries
├── meta-capi.ts             # Integração Meta Conversions API
├── hotmart-webhook.ts       # Processamento de webhooks
├── api-routes.ts            # Rotas Express
├── credentials.test.ts       # Testes de credenciais
├── tracking-flow.test.ts     # Testes de fluxo
└── _core/
    └── index.ts             # Servidor principal (integra api-routes)

supabase-setup.sql           # Script de criação de tabelas
DEPLOYMENT_GUIDE.md          # Guia de deployment
TRACKING_ARCHITECTURE.md     # Este arquivo
```

## 🗄️ Banco de Dados (Supabase)

### Tabela: `leads`

Armazena dados do quiz preenchido pelo usuário.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  quiz_responses JSONB,           -- Respostas do quiz
  fbp VARCHAR(255),               -- Facebook Pixel ID (cookie)
  fbc VARCHAR(255),               -- Facebook Click ID (cookie)
  user_agent TEXT,                -- Browser do usuário
  ip_address VARCHAR(45),         -- IP do usuário
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Exemplo de `quiz_responses`:**
```json
{
  "question_1": "answer_a",
  "question_2": "answer_b",
  "question_3": "answer_c",
  "question_4": "answer_a",
  "question_5": "answer_b",
  "question_6": "answer_c"
}
```

### Tabela: `purchases`

Armazena dados de compra da Hotmart com status de rastreamento.

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,    -- FK para leads
  hotmart_transaction_id VARCHAR(255) UNIQUE,
  hotmart_order_date BIGINT,
  hotmart_approved_date BIGINT,
  product_name VARCHAR(255),
  product_id VARCHAR(255),
  value DECIMAL(10, 2),
  currency VARCHAR(3),
  buyer_name VARCHAR(255),
  buyer_phone VARCHAR(20),
  buyer_document VARCHAR(20),
  buyer_address JSONB,
  payment_type VARCHAR(50),
  payment_installments INTEGER,
  hotmart_status VARCHAR(50),
  hotmart_data JSONB,             -- Dados completos do webhook
  meta_event_id VARCHAR(255),     -- ID do evento enviado para Meta
  meta_sent BOOLEAN,              -- Flag de sucesso
  meta_sent_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔌 APIs

### POST `/api/quiz/submit`

Salva dados do quiz e envia evento de Lead para Meta.

**Request:**
```json
{
  "email": "usuario@example.com",
  "phone": "11999999999",
  "quizResponses": {
    "question_1": "answer_a",
    "question_2": "answer_b"
  },
  "fbp": "fb.1.1558571054389.1098115397",
  "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "uuid-aqui",
  "metaEventId": "Lead_1707131400_abc123def456",
  "message": "Quiz submitted successfully"
}
```

**Fluxo:**
1. Validar email obrigatório
2. Salvar lead no Supabase
3. Enviar evento "Lead" para Meta CAPI
4. Retornar sucesso

### POST `/api/webhooks/hotmart`

Recebe webhook da Hotmart, processa compra e envia para Meta.

**Request (do Hotmart):**
```json
{
  "id": "webhook-id",
  "event": "PURCHASE_APPROVED",
  "data": {
    "buyer": {
      "email": "usuario@example.com",
      "name": "João Silva",
      "checkout_phone": "11999999999"
    },
    "purchase": {
      "transaction": "HP16015479281022",
      "price": {
        "value": 47.90,
        "currency_value": "BRL"
      }
    },
    "product": {
      "name": "Protocolo Sono do Bebê",
      "ucode": "product-uuid"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "purchaseId": "uuid-aqui",
  "message": "Purchase processed successfully"
}
```

**Fluxo:**
1. Validar assinatura do webhook
2. Buscar lead pelo email
3. Salvar compra no Supabase
4. Enviar evento "Purchase" para Meta
5. Atualizar status de envio

### POST `/api/meta/test`

Testa conexão com Meta CAPI.

**Response:**
```json
{
  "success": true,
  "message": "Meta CAPI test event sent successfully",
  "response": {
    "events_received": 1,
    "fbtrace_id": "..."
  }
}
```

### GET `/api/health`

Health check do servidor.

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-02-05T11:00:00Z"
}
```

## 🔐 Segurança

### Hashing de Dados

Todos os dados pessoais enviados para Meta são hasheados com SHA-256:

```typescript
function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}
```

**Dados hasheados:**
- Email
- Telefone

### Validação de Webhook

Hotmart envia um header `x-signature` com HMAC-SHA256:

```typescript
const hash = crypto
  .createHmac('sha256', HOTMART_SECRET)
  .update(body)
  .digest('hex');

if (hash !== signature) {
  // Webhook inválido
}
```

### Variáveis de Ambiente

Todas as credenciais são armazenadas em variáveis de ambiente:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FACEBOOK_PIXEL_ID
FACEBOOK_ACCESS_TOKEN
HOTMART_WEBHOOK_SECRET
```

⚠️ **NUNCA** commit credenciais no Git!

## 📊 Meta Conversions API

### Evento: Lead

Enviado quando o usuário completa o quiz.

```json
{
  "data": [
    {
      "event_name": "Lead",
      "event_time": 1707131400,
      "event_id": "Lead_1707131400_abc123",
      "action_source": "website",
      "user_data": {
        "em": ["hash_do_email"],
        "ph": ["hash_do_telefone"],
        "fbp": "fb.1.1558571054389.1098115397",
        "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz"
      },
      "custom_data": {
        "currency": "BRL",
        "value": 0,
        "content_name": "Quiz - Sono do Bebê",
        "content_type": "lead_form"
      }
    }
  ]
}
```

### Evento: Purchase

Enviado quando o Hotmart confirma a compra.

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1707131400,
      "event_id": "Purchase_1707131400_xyz789",
      "action_source": "website",
      "user_data": {
        "em": ["hash_do_email"],
        "ph": ["hash_do_telefone"],
        "fbp": "fb.1.1558571054389.1098115397",
        "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz"
      },
      "custom_data": {
        "currency": "BRL",
        "value": 47.90,
        "content_ids": ["product-uuid"],
        "content_name": "Protocolo Sono do Bebê",
        "content_type": "product",
        "num_items": 1,
        "status": "completed",
        "transaction_id": "HP16015479281022"
      }
    }
  ]
}
```

## 🧪 Testes

### Testes de Credenciais

```bash
pnpm test server/credentials.test.ts
```

Valida:
- ✅ Supabase URL e chaves
- ✅ Meta Pixel ID e Access Token
- ✅ Hotmart Secret
- ✅ Formato de credenciais

### Testes de Fluxo

```bash
pnpm test server/tracking-flow.test.ts
```

Valida:
- ✅ Hash SHA-256
- ✅ Validação de webhook
- ✅ Estrutura de eventos
- ✅ Configuração de dados

## 🚀 Deployment

### Vercel

1. Push para GitHub
2. Conectar Vercel ao GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

### Variáveis de Ambiente (Vercel)

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
FACEBOOK_PIXEL_ID=1524547791957989
FACEBOOK_ACCESS_TOKEN=EAA...
HOTMART_WEBHOOK_SECRET=vyta56ZTlG07o8IAUt8tKqsSZXa4WP225ec103...
NODE_ENV=production
```

## 📈 Monitoramento

### Supabase

```sql
-- Leads por dia
SELECT DATE(created_at), COUNT(*) FROM leads GROUP BY DATE(created_at);

-- Taxa de conversão
SELECT 
  COUNT(DISTINCT p.email) as purchases,
  COUNT(DISTINCT l.email) as leads,
  ROUND(100.0 * COUNT(DISTINCT p.email) / COUNT(DISTINCT l.email), 2) as conversion_rate
FROM leads l
LEFT JOIN purchases p ON l.email = p.email;

-- Valor total de vendas
SELECT SUM(value) as total_value, COUNT(*) as total_purchases FROM purchases;
```

### Meta

1. Acesse: https://business.facebook.com
2. Vá em **Ads Manager > Eventos**
3. Selecione seu Pixel
4. Vá em **Event Manager**
5. Verifique eventos "Lead" e "Purchase"

## 🔧 Troubleshooting

### Leads não estão sendo salvos

1. Verifique se `POST /api/quiz/submit` está sendo chamado
2. Verifique logs no Vercel
3. Verifique se Supabase está acessível
4. Verifique se tabela `leads` existe

### Webhook não está funcionando

1. Verifique URL do webhook na Hotmart
2. Verifique Secret está correto
3. Verifique logs no Vercel
4. Teste com `curl`:

```bash
curl -X POST https://seu-dominio.com/api/webhooks/hotmart \
  -H "Content-Type: application/json" \
  -d '{"event": "PURCHASE_APPROVED", "data": {...}}'
```

### Meta não está recebendo eventos

1. Verifique Pixel ID
2. Verifique Access Token
3. Verifique se token não expirou
4. Verifique logs no Vercel
5. Teste com `POST /api/meta/test`

---

**Documentação criada em**: 2026-02-05
**Versão**: 1.0.0
