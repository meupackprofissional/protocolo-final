# Meta Conversions API - Guia Completo de Implementação

## 📚 Resumo Executivo

A Meta Conversions API é uma solução server-side para rastrear eventos de conversão diretamente do seu servidor para o Facebook/Instagram. Diferente do Pixel (client-side), oferece maior controle, privacidade e precisão.

---

## 1️⃣ REQUISITOS INICIAIS

### 1.1 Pré-requisitos
- ✅ **Pixel ID**: ID único do seu Pixel Meta
- ✅ **Business Manager**: Conta de negócios Meta
- ✅ **Access Token**: Token de acesso gerado no Event Manager
- ✅ **Graph API Version**: v24.0 ou superior (compatível com versões anteriores)

### 1.2 Como Obter o Access Token
1. Acesse **Event Manager** > **Data Sources** > Selecione seu Pixel
2. Clique em **Settings** > **Conversions API**
3. Clique em **Generate Token** (ou use um app existente)
4. O token é criado automaticamente com permissões necessárias

---

## 2️⃣ ESTRUTURA DA API

### 2.1 Endpoint
```
POST https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events?access_token={TOKEN}
```

**Exemplo:**
```
POST https://graph.facebook.com/v24.0/123456789/events?access_token=abc123...
```

### 2.2 Formato de Requisição
```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1633552688,
      "event_id": "event.id.123",
      "event_source_url": "http://seusite.com/checkout",
      "action_source": "website",
      "user_data": {
        "client_ip_address": "192.19.9.9",
        "client_user_agent": "Mozilla/5.0...",
        "em": ["309a0a5c3e211326ae75ca18196d301a9bdbd1a882a4d2569511033da23f0abd"],
        "ph": ["254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4"],
        "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
        "fbp": "fb.1.1558571054389.1098115397"
      },
      "custom_data": {
        "value": 100.2,
        "currency": "USD",
        "content_ids": ["product.id.123"],
        "content_type": "product"
      },
      "opt_out": false
    }
  ],
  "test_event_code": "TEST123"
}
```

---

## 3️⃣ PARÂMETROS PRINCIPAIS

### 3.1 Parâmetros Obrigatórios (por tipo de evento)

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-----------|
| `event_name` | String | Nome do evento (ex: Purchase, Lead, ViewContent) | ✅ Sim |
| `event_time` | Integer | Unix timestamp em segundos | ✅ Sim |
| `action_source` | String | Fonte do evento: "website", "app", "offline", "phone_call" | ✅ Sim |
| `user_data` | Object | Dados do usuário (email, telefone, IP, etc) | ✅ Sim |
| `event_source_url` | String | URL da página onde evento ocorreu | ✅ Para website |

### 3.2 Dados do Usuário (user_data)

**Parâmetros com HASH OBRIGATÓRIO:**
- `em`: Email (SHA-256)
- `ph`: Telefone (SHA-256)
- `fn`: Nome (SHA-256)
- `ln`: Sobrenome (SHA-256)
- `ge`: Gênero (SHA-256)
- `db`: Data de nascimento (SHA-256)
- `ct`: Cidade (SHA-256)
- `st`: Estado (SHA-256)
- `zp`: CEP (SHA-256)
- `country`: País (SHA-256)
- `external_id`: ID externo (SHA-256 recomendado)

**Parâmetros SEM HASH:**
- `client_ip_address`: IP do cliente
- `client_user_agent`: User Agent do navegador
- `fbc`: ID do clique (Facebook Click ID)
- `fbp`: ID do navegador (Facebook Browser ID)
- `subscription_id`: ID da assinatura
- `fb_login_id`: ID de Login Facebook
- `lead_id`: ID de lead
- `page_id`: ID da página
- `page_scoped_user_id`: ID do usuário no escopo da página

### 3.3 Dados Customizados (custom_data)

```json
{
  "value": 100.50,
  "currency": "USD",
  "content_ids": ["product123", "product456"],
  "content_type": "product",
  "content_name": "Nome do Produto",
  "content_category": "Categoria",
  "num_items": 2,
  "status": "completed"
}
```

### 3.4 Deduplicação de Eventos

```json
{
  "event_id": "unique_event_id_123",
  "event_name": "Purchase",
  "event_time": 1633552688
}
```

**Importante:** Use `event_id` único para evitar duplicação quando enviar via Pixel + Conversions API.

---

## 4️⃣ EVENTOS PADRÃO

### 4.1 Eventos de Conversão Comuns

| Evento | Descrição | Caso de Uso |
|--------|-----------|-----------|
| `ViewContent` | Usuário visualiza conteúdo | Página de produto |
| `Search` | Usuário realiza busca | Busca no site |
| `AddToCart` | Usuário adiciona ao carrinho | Carrinho de compras |
| `AddToWishlist` | Usuário adiciona à lista de desejos | Wishlist |
| `InitiateCheckout` | Usuário inicia checkout | Página de pagamento |
| `AddPaymentInfo` | Usuário adiciona informação de pagamento | Dados do cartão |
| `Purchase` | Usuário completa compra | Confirmação de pedido |
| `Lead` | Usuário se torna lead | Formulário preenchido |
| `CompleteRegistration` | Usuário completa registro | Cadastro finalizado |
| `Contact` | Usuário entra em contato | Formulário de contato |
| `CustomizeProduct` | Usuário personaliza produto | Customização |
| `Donate` | Usuário faz doação | Doação |
| `FindLocation` | Usuário encontra localização | Busca de loja |
| `Schedule` | Usuário agenda | Agendamento |
| `StartTrial` | Usuário inicia trial | Teste grátis |
| `SubmitApplication` | Usuário submete aplicação | Candidatura |
| `Subscribe` | Usuário se inscreve | Assinatura |

### 4.2 Exemplo: Evento de Lead (Quiz)

```json
{
  "event_name": "Lead",
  "event_time": 1633552688,
  "event_id": "lead_quiz_001",
  "action_source": "website",
  "event_source_url": "https://seusite.com/quiz/results",
  "user_data": {
    "em": ["hash_do_email"],
    "ph": ["hash_do_telefone"],
    "client_ip_address": "192.168.1.1",
    "client_user_agent": "Mozilla/5.0...",
    "fbp": "fb.1.1558571054389.1098115397"
  },
  "custom_data": {
    "value": 0,
    "currency": "BRL",
    "content_name": "Quiz - Sono do Bebê",
    "content_type": "lead_form"
  }
}
```

### 4.3 Exemplo: Evento de Purchase (Hotmart)

```json
{
  "event_name": "Purchase",
  "event_time": 1633552688,
  "event_id": "hotmart_purchase_001",
  "action_source": "website",
  "event_source_url": "https://seusite.com/checkout/success",
  "user_data": {
    "em": ["hash_do_email"],
    "ph": ["hash_do_telefone"],
    "client_ip_address": "192.168.1.1",
    "client_user_agent": "Mozilla/5.0...",
    "fbp": "fb.1.1558571054389.1098115397"
  },
  "custom_data": {
    "value": 47.90,
    "currency": "BRL",
    "content_ids": ["protocolo_sono_bebe"],
    "content_type": "product",
    "content_name": "Protocolo Sono do Bebê",
    "num_items": 1,
    "status": "completed"
  }
}
```

---

## 5️⃣ HASHING DE DADOS

### 5.1 Processo de Hash SHA-256

```javascript
// Exemplo em Node.js
const crypto = require('crypto');

function hashData(data) {
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

// Uso
const hashedEmail = hashData('user@example.com');
// Resultado: 309a0a5c3e211326ae75ca18196d301a9bdbd1a882a4d2569511033da23f0abd
```

### 5.2 Boas Práticas de Hash
1. **Converter para minúsculas** antes de fazer hash
2. **Remover espaços** em branco antes e depois
3. **Usar SHA-256** (não MD5 ou SHA-1)
4. **Nunca enviar dados sem hash** (email, telefone, nome, etc)
5. **Enviar em array** mesmo que um único valor

```json
{
  "em": ["hash1", "hash2"],
  "ph": ["hash3", "hash4"]
}
```

---

## 6️⃣ LIMITAÇÕES E RESTRIÇÕES

### 6.1 Limites de Taxa
- **Máximo 1.000 eventos por requisição**
- **Máximo 100 requisições por segundo**
- **Recomendado: enviar imediatamente após evento** (até 1 hora depois)

### 6.2 Janela de Tempo
- **event_time**: Pode estar até **7 dias no passado**
- **Exceção offline**: Até **62 dias no passado**
- Se ultrapassar 7 dias, toda a requisição é rejeitada

### 6.3 Validação
- Se um evento no lote for inválido, **todo o lote é rejeitado**
- Sempre validar dados antes de enviar
- Usar `test_event_code` para testes (não descarta eventos)

---

## 7️⃣ VERIFICAÇÃO E MONITORAMENTO

### 7.1 Verificar Eventos no Event Manager
1. **Event Manager** > **Data Sources** > Seu Pixel
2. **Overview**: Ver eventos recebidos, correspondidos, atribuídos
3. **Event Details**: Informações específicas de cada evento
4. **Event Freshness**: Tempo entre ocorrência e recebimento (ideal: tempo real)
5. **Deduplication**: Taxa de eventos desduplicados
6. **Match Quality**: Qualidade de correspondência com usuários (ideal: ≥ 6)

### 7.2 Ferramenta de Teste de Eventos
```json
{
  "data": [{...}],
  "test_event_code": "TEST123"
}
```

- Eventos de teste NÃO são descartados
- Aparecem no Event Manager normalmente
- Remover `test_event_code` em produção

### 7.3 Métricas Importantes
| Métrica | Ideal | Descrição |
|---------|-------|-----------|
| **Match Quality** | ≥ 6 | Qualidade de correspondência com usuários Facebook |
| **Deduplication Rate** | Alto | % de eventos corretamente desduplicados |
| **Event Freshness** | Real-time | Tempo entre evento e recebimento |
| **Event Volume** | Consistente | Número de eventos recebidos |

---

## 8️⃣ IMPLEMENTAÇÃO NO SEU PROJETO

### 8.1 Fluxo de Dados
```
Quiz Completo (Cliente)
    ↓
Webhook Hotmart (Servidor)
    ↓
Salvar Lead + Purchase (DB)
    ↓
Enviar Conversão para Meta (Conversions API)
    ↓
Meta rastreia e otimiza anúncios
```

### 8.2 Eventos a Rastrear

1. **Lead (Quiz Completo)**
   - Quando: Usuário completa o quiz
   - Dados: Email, telefone (se disponível)
   - Valor: 0 (lead sem compra ainda)

2. **Purchase (Hotmart Webhook)**
   - Quando: Pagamento confirmado
   - Dados: Email, telefone, valor da compra
   - Valor: Valor do produto (R$ 47,90)

### 8.3 Estrutura de Código

```typescript
// server/conversions-api.ts
import crypto from 'crypto';
import axios from 'axios';

interface ConversionEvent {
  eventName: 'Lead' | 'Purchase';
  email: string;
  phone?: string;
  value?: number;
  currency?: string;
  customData?: Record<string, any>;
}

async function sendConversionToMeta(event: ConversionEvent) {
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const apiVersion = 'v24.0';

  const hashedEmail = hashData(event.email);
  const hashedPhone = event.phone ? hashData(event.phone) : undefined;

  const payload = {
    data: [{
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: `${event.eventName}_${Date.now()}`,
      action_source: 'website',
      user_data: {
        em: [hashedEmail],
        ...(hashedPhone && { ph: [hashedPhone] }),
        client_ip_address: '0.0.0.0',
        client_user_agent: 'server-side'
      },
      custom_data: {
        value: event.value || 0,
        currency: event.currency || 'BRL',
        ...event.customData
      }
    }]
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`,
      payload
    );
    console.log('Conversão enviada para Meta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar conversão:', error);
    throw error;
  }
}

function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

export { sendConversionToMeta, hashData };
```

---

## 9️⃣ BOAS PRÁTICAS

### 9.1 Segurança
- ✅ Nunca exponha o Access Token no cliente
- ✅ Use variáveis de ambiente para credenciais
- ✅ Valide e sanitize todos os dados antes de enviar
- ✅ Use HTTPS para todas as requisições
- ✅ Implemente rate limiting

### 9.2 Qualidade de Dados
- ✅ Envie dados de usuário quando possível (melhora Match Quality)
- ✅ Use `fbp` e `fbc` para melhor rastreamento
- ✅ Mantenha `event_id` único para desduplicação
- ✅ Envie eventos o mais próximo possível do tempo real
- ✅ Teste com `test_event_code` antes de produção

### 9.3 Performance
- ✅ Envie eventos em lote (até 1.000 por requisição)
- ✅ Use requisições assíncronas
- ✅ Implemente retry com backoff exponencial
- ✅ Monitore taxa de sucesso/erro
- ✅ Use filas para processar eventos em background

### 9.4 Conformidade
- ✅ Respeite preferências de privacidade do usuário
- ✅ Use `opt_out: true` quando necessário
- ✅ Implemente Data Processing Options (DPO)
- ✅ Cumpra LGPD e GDPR
- ✅ Documente consentimento do usuário

---

## 🔟 PRÓXIMOS PASSOS

1. **Obter Credenciais**
   - Pixel ID
   - Access Token

2. **Implementar Hashing**
   - Função SHA-256
   - Validação de dados

3. **Criar Endpoints**
   - POST para Lead (quiz)
   - POST para Purchase (webhook)

4. **Testar**
   - Usar `test_event_code`
   - Verificar no Event Manager
   - Validar Match Quality

5. **Monitorar**
   - Acompanhar volume de eventos
   - Verificar taxa de correspondência
   - Otimizar dados de usuário

---

## 📞 SUPORTE

- **Documentação Oficial**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Event Manager**: https://business.facebook.com/events_manager
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer
- **Fórum da Comunidade**: https://developers.facebook.com/community

---

**Última atualização**: Fevereiro 2026
**Versão da API**: v24.0+
