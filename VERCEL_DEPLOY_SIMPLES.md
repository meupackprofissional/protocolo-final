# 🚀 Deploy na Vercel - Guia Simplificado

Siga os passos abaixo. É bem fácil!

---

## **PASSO 1: Preparar o GitHub** (5 minutos)

### 1.1 Abra o Terminal

Você pode usar o terminal do seu computador ou do Manus.

### 1.2 Execute estes comandos (um de cada vez):

```bash
cd /home/ubuntu/protocolo-site-env
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Protocolo Site com rastreamento Meta CAPI"
```

---

## **PASSO 2: Criar Repositório no GitHub** (3 minutos)

### 2.1 Acesse GitHub
1. Vá para: https://github.com/new
2. Faça login com sua conta

### 2.2 Preencha os dados:
- **Repository name:** `protocolo-site`
- **Description:** `Quiz com rastreamento de conversões`
- **Visibility:** Selecione **Private** (privado)
- Clique em **Create repository**

### 2.3 Copie o Comando

Após criar, GitHub mostra um comando. Procure por algo assim:

```bash
git remote add origin https://github.com/SEU_USUARIO/protocolo-site.git
git branch -M main
git push -u origin main
```

**Cole esse comando no terminal:**

```bash
git remote add origin https://github.com/SEU_USUARIO/protocolo-site.git
git branch -M main
git push -u origin main
```

(Substitua `SEU_USUARIO` pelo seu usuário do GitHub)

---

## **PASSO 3: Deploy na Vercel** (5 minutos)

### 3.1 Acesse Vercel
1. Vá para: https://vercel.com/new
2. Faça login (pode usar GitHub)

### 3.2 Importar Repositório
1. Clique em **"Import Git Repository"**
2. Cole a URL do seu repositório GitHub
3. Clique em **Import**

### 3.3 Configurar Variáveis de Ambiente

Na página de configuração, procure por **Environment Variables** e adicione:

**COPIE E COLE EXATAMENTE (sem espaços extras):**

```
SUPABASE_URL
https://ssudkqhflfzpkoglylob.supabase.co
```

```
SUPABASE_ANON_KEY
sb_publishable_NPfT4H2BrhqKfFfusZ_ldw_H_ZMdju0
```

```
SUPABASE_SERVICE_ROLE_KEY
sb_secret_lWVaR_4OM5EMfsU2II_L6w_iPpkAuU3
```

```
FACEBOOK_PIXEL_ID
1524547791957989
```

```
FACEBOOK_ACCESS_TOKEN
EAA...
```

(Copie o token completo que você tem)

```
HOTMART_WEBHOOK_SECRET
vyta56ZTlG07o8IAUt8tKqsSZXa4WP225ec103-ff1c-448a-8727-690572acc30d
```

```
NODE_ENV
production
```

### 3.4 Deploy

Clique em **Deploy** e aguarde 2-3 minutos ⏳

---

## **PASSO 4: Copiar URL do Seu Site** (1 minuto)

Após o deploy terminar:

1. Vercel mostra uma URL (ex: `protocolo-site.vercel.app`)
2. **Copie essa URL** - você vai precisar para o webhook

---

## **PASSO 5: Configurar Webhook na Hotmart** (5 minutos)

### 5.1 Montar a URL do Webhook

Sua URL será:
```
https://SEU_DOMINIO.vercel.app/api/webhooks/hotmart
```

(Substitua `SEU_DOMINIO` pelo domínio que Vercel forneceu)

**Exemplo:**
```
https://protocolo-site.vercel.app/api/webhooks/hotmart
```

### 5.2 Configurar na Hotmart

1. Acesse: https://hotmart.com
2. Vá em **Configurações > Webhooks**
3. Clique em **Adicionar Webhook**
4. Cole a URL acima
5. Selecione os eventos:
   - ✅ Compra completa
   - ✅ Compra aprovada
   - ✅ Compra reembolsada
   - ✅ Chargeback
6. Clique em **Salvar**

---

## **PASSO 6: Testar o Deploy** (5 minutos)

### 6.1 Testar Health Check

Abra no navegador:
```
https://SEU_DOMINIO.vercel.app/api/health
```

Deve aparecer:
```json
{"success":true,"status":"ok","timestamp":"..."}
```

### 6.2 Testar Meta CAPI

Abra no navegador:
```
https://SEU_DOMINIO.vercel.app/api/meta/test
```

Deve aparecer:
```json
{"message":"Meta CAPI test event sent successfully","success":true,...}
```

---

## ✅ Pronto!

Seu site está online e funcionando! 🎉

### Resumo do que você fez:

- ✅ Criou repositório no GitHub
- ✅ Fez deploy na Vercel
- ✅ Configurou variáveis de ambiente
- ✅ Configurou webhook da Hotmart
- ✅ Testou tudo

### Agora você tem:

- 🌐 Site online: `https://seu-dominio.vercel.app`
- 📊 Banco de dados: Supabase
- 📱 Rastreamento: Meta CAPI
- 💰 Webhooks: Hotmart

---

## 🆘 Se Algo Der Errado

### Erro: "Module not found"
- Verifique se todas as variáveis de ambiente estão corretas
- Clique em **Redeploy** na Vercel

### Erro: "Supabase connection failed"
- Verifique se `SUPABASE_URL` está correto
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto

### Webhook não funciona
- Verifique se a URL está correta
- Verifique se o Secret está correto
- Teste com um webhook de teste da Hotmart

---

## 📞 Próximos Passos

Após o deploy:

1. Teste o quiz no seu site
2. Verifique se os dados aparecem no Supabase
3. Verifique se os eventos aparecem no Meta Event Manager
4. Faça uma compra de teste na Hotmart
5. Verifique se o webhook foi recebido

---

**Sucesso!** 🚀
