# Guia de Deployment - Protocolo Site

Este guia explica como fazer o deploy do projeto para a Vercel com todas as funcionalidades de rastreamento ativadas.

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta no GitHub** - Para armazenar o código
2. **Conta na Vercel** - Para fazer o deployment
3. **Credenciais do Supabase** - Para banco de dados
4. **Credenciais da Meta** - Para rastreamento de conversões
5. **Secret da Hotmart** - Para receber webhooks

## 🚀 Passo 1: Preparar o Código para GitHub

### 1.1 Remover Credenciais do Código

Certifique-se de que NENHUMA credencial está no código:

```bash
# Verificar se há credenciais expostas
grep -r "sb_secret_" . --exclude-dir=node_modules
grep -r "EAA" . --exclude-dir=node_modules
```

✅ Se nenhum resultado aparecer, está seguro!

### 1.2 Criar Repositório no GitHub

```bash
# Inicializar git (se ainda não foi)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit: Protocolo Site com Meta CAPI e Supabase"

# Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: protocolo-site
# Descrição: Quiz educacional com rastreamento de conversões
# Privado: Sim

# Adicionar remote
git remote add origin https://github.com/seu-usuario/protocolo-site.git

# Push para GitHub
git branch -M main
git push -u origin main
```

## 🔗 Passo 2: Conectar Vercel ao GitHub

### 2.1 Importar Projeto na Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório `protocolo-site`
4. Clique em "Import"

### 2.2 Configurar Variáveis de Ambiente

Na página de configuração do Vercel, vá em **Environment Variables** e adicione:

```
SUPABASE_URL = https://seu-projeto.supabase.co
SUPABASE_ANON_KEY = sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY = sb_secret_...
FACEBOOK_PIXEL_ID = 1524547791957989
FACEBOOK_ACCESS_TOKEN = EAA...
HOTMART_WEBHOOK_SECRET = vyta56ZTlG07o8IAUt8tKqsSZXa4WP225ec103...
NODE_ENV = production
```

⚠️ **IMPORTANTE**: Copie EXATAMENTE os valores, sem espaços extras!

### 2.3 Configurar Build

Deixe as configurações padrão:
- **Framework**: Other
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

Clique em **Deploy**!

## ✅ Passo 3: Testar o Deployment

### 3.1 Verificar Se o Site Está Online

1. Acesse o domínio fornecido pela Vercel (ex: `protocolo-site.vercel.app`)
2. Verifique se a página inicial carrega corretamente
3. Teste o quiz

### 3.2 Testar as APIs

```bash
# Testar health check
curl https://protocolo-site.vercel.app/api/health

# Testar Meta CAPI (requer autenticação)
curl -X POST https://protocolo-site.vercel.app/api/meta/test
```

### 3.3 Verificar Logs

Na Vercel:
1. Vá em **Deployments**
2. Selecione o deployment mais recente
3. Clique em **Logs**
4. Procure por erros

## 🔗 Passo 4: Configurar Webhook da Hotmart

### 4.1 Obter URL do Webhook

Sua URL será:
```
https://protocolo-site.vercel.app/api/webhooks/hotmart
```

(Substitua `protocolo-site` pelo seu domínio)

### 4.2 Configurar na Hotmart

1. Acesse: https://hotmart.com
2. Vá em **Configurações > Webhooks**
3. Clique em **Adicionar Webhook**
4. Cole a URL acima
5. Selecione os eventos:
   - ✅ Compra completa
   - ✅ Compra aprovada
   - ✅ Compra reembolsada
   - ✅ Chargeback
6. Salve e copie o **Secret**
7. Atualize a variável `HOTMART_WEBHOOK_SECRET` na Vercel

## 📊 Passo 5: Verificar Rastreamento

### 5.1 Verificar no Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute:

```sql
SELECT * FROM leads LIMIT 10;
SELECT * FROM purchases LIMIT 10;
```

### 5.2 Verificar na Meta

1. Acesse: https://business.facebook.com
2. Vá em **Ads Manager > Eventos**
3. Selecione seu Pixel
4. Vá em **Event Manager**
5. Procure por eventos "Lead" e "Purchase"

## 🔧 Troubleshooting

### Erro: "Supabase credentials not configured"

**Solução**: Verifique se as variáveis de ambiente estão corretas na Vercel

```bash
# Verificar variáveis (na Vercel)
vercel env list
```

### Erro: "Meta CAPI: Invalid access token"

**Solução**: O token expirou ou está inválido
1. Gere um novo token em: https://business.facebook.com
2. Atualize em **Settings > Environment Variables** na Vercel

### Webhook não está recebendo eventos

**Solução**: Verifique o Secret
1. Copie o Secret correto da Hotmart
2. Atualize em **Settings > Environment Variables** na Vercel
3. Faça redeploy: `vercel --prod`

### Quiz não está salvando dados

**Solução**: Verifique as tabelas do Supabase
1. Acesse: https://app.supabase.com
2. Vá em **SQL Editor**
3. Execute: `SELECT * FROM leads;`
4. Se vazio, execute o script `supabase-setup.sql`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs na Vercel
2. Verifique os logs no Supabase
3. Teste as APIs localmente
4. Verifique se todas as variáveis de ambiente estão configuradas

## 🎉 Próximos Passos

Após o deployment bem-sucedido:

1. Configure seu domínio customizado na Vercel
2. Implemente validação de email no quiz
3. Crie dashboard de analytics
4. Configure alertas de conversão
5. Otimize a taxa de conversão

---

**Documentação criada em**: 2026-02-05
**Versão**: 1.0.0
