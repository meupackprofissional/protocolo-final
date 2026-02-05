# Protocolo Site - TODO

## Funcionalidades Implementadas

- [x] Migração do schema do banco de dados (users, quizResponses)
- [x] Implementação de routers tRPC (quiz, facebook, hotmart)
- [x] Funções de consulta ao banco de dados (saveQuizResponse, getQuizResponsesByEmail)
- [x] Página Home com design original
- [x] Página Quiz com perguntas interativas
- [x] Página Results com vídeo e CTA
- [x] Componentes UI (BackButton, ProgressBar, QuizQuestion, ProcessingScreen, VideoPlayer, YouKnewSection)
- [x] Contexto de tema (ThemeContext)
- [x] Rotas e navegação (Home, Quiz, Results, NotFound)
- [x] Constantes do quiz (QUIZ_QUESTIONS, QUIZ_COLORS, QUIZ_FONTS)
- [x] Hooks customizados (useAuth)
- [x] Integração com Facebook Pixel para rastreamento
- [x] Integração com Hotmart para webhooks
- [x] Testes unitários com Vitest (8 testes passando)

## Funcionalidades Pendentes
- [ ] Validação de email no quiz
- [ ] Integração completa com Hotmart
- [ ] Otimizações de performance
- [ ] SEO e meta tags

## Ajustes Recentes
- [x] Redimensionamento e centralização da imagem na seção "Você Sabia" para desktop

## Notas

- Projeto migrado com sucesso do repositório original
- Servidor de desenvolvimento rodando em https://3000-i6czbzcxojh7v11ddtlku-20982120.us1.manus.computer
- Banco de dados configurado com tabelas users e quiz_responses
- Todos os componentes UI estão funcionando corretamente


## Implementação de Rastreamento (Meta CAPI + Supabase + Hotmart)

### Fase 1: Supabase
- [x] Criar tabela `leads` no Supabase
- [x] Criar tabela `purchases` no Supabase
- [x] Configurar RLS (Row Level Security)
- [x] Script SQL criado: `supabase-setup.sql`

### Fase 2: Salvar Dados do Quiz
- [x] Criar função `saveQuizLead()` 
- [x] Integrar com rota POST `/api/quiz/submit`
- [x] Capturar fbp/fbc do usuário
- [x] Salvar email, telefone, respostas
- [x] Arquivo: `server/supabase.ts`

### Fase 3: Webhook Hotmart
- [x] Criar rota POST `/api/webhooks/hotmart`
- [x] Validar secret do webhook
- [x] Processar evento "PURCHASE_APPROVED"
- [x] Buscar dados do lead no Supabase
- [x] Salvar compra no Supabase
- [x] Arquivo: `server/hotmart-webhook.ts`

### Fase 4: Meta Conversions API
- [x] Criar função `sendToMetaCAPI()`
- [x] Implementar hash SHA-256
- [x] Enviar evento "Lead" (quiz completo)
- [x] Enviar evento "Purchase" (compra aprovada)
- [x] Validar respostas da Meta
- [x] Arquivo: `server/meta-capi.ts`

### Fase 5: Testes
- [x] Testar fluxo completo
- [x] Verificar dados no Supabase
- [x] Verificar eventos no Event Manager Meta
- [x] Simular webhook Hotmart
- [x] 11 testes passando (credentials + tracking-flow)

### Fase 6: Preparação GitHub/Vercel
- [x] Criar documentação de deploy
- [x] Criar documentação de arquitetura
- [x] Remover credenciais do código
- [x] Organizar estrutura de pastas
- [x] Arquivo: `DEPLOYMENT_GUIDE.md`
- [x] Arquivo: `TRACKING_ARCHITECTURE.md`

## Status Final

✅ **TUDO PRONTO PARA DEPLOY NA VERCEL!**

### Testes Executados Localmente:
- [x] Health Check: ✅ Servidor rodando
- [x] Meta CAPI Test: ✅ Conectado
- [x] Quiz Submit: ✅ Lead salvo no Supabase e enviado para Meta

### Arquivos de Documentação:
- [x] DEPLOYMENT_GUIDE.md
- [x] TRACKING_ARCHITECTURE.md
- [x] VERCEL_DEPLOY_SIMPLES.md (novo - guia simplificado)

### Credenciais Configuradas
- Supabase: https://ssudkqhflfzpkoglylob.supabase.co
- Meta Pixel ID: 1524547791957989
- Hotmart Secret: vyta56ZTlG07o8IAUt8tKqsSZXa4WP225ec103-ff1c-448a-8727-690572acc30d

### Próximo Passo do Usuário:
1. Fazer push para GitHub
2. Deploy na Vercel
3. Configurar webhook na Hotmart
4. Testar

## Sincronização GitHub
- [x] Projeto sincronizado com GitHub (2026-02-05 17:45)
