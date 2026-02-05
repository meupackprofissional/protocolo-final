# Protocolo Site - TODO

## Funcionalidades Preservadas (Clonagem)

- [x] Sistema de Quiz com 6 perguntas sobre sono de bebê
- [x] Navegação automática entre questões com delay de 300ms
- [x] Componente QuizQuestion com opções interativas e emojis
- [x] Componente ProgressBar mostrando progresso do quiz
- [x] Componente ProcessingScreen durante envio de respostas
- [x] Componente BackButton para retornar à página anterior
- [x] Componente VideoPlayer com suporte a Vimeo (vertical) e HTML5 (horizontal)
- [x] Barra de progresso falsa no vídeo com animação suave
- [x] Página Results com vídeo, CTA de preço e link de pagamento (Hotmart)
- [x] Componente YouKnewSection com imagens de depoimentos
- [x] Contexto de Tema (ThemeContext) com suporte a dark/light mode
- [x] Rotas e navegação (Home, Quiz, Results, NotFound) com lazy loading
- [x] Constantes do quiz (QUIZ_QUESTIONS, QUIZ_COLORS, QUIZ_FONTS)
- [x] Hook customizado useAuth para autenticação
- [x] Integração tRPC com router quiz.submitResponse
- [x] Schema do banco de dados (users, quiz_responses)
- [x] Função saveQuizResponse para persistência de dados
- [x] Componentes UI shadcn/ui (button, card, progress, scroll-area, toggle, tooltip, textarea, sonner)
- [x] Configuração Tailwind CSS 4 com tema light
- [x] Configuração Vite com React 19
- [x] Configuração TypeScript com tipos estritos
- [x] Integração Framer Motion para animações

## Funcionalidades Pendentes

- [ ] Validação de email no quiz
- [ ] Integração completa com Hotmart webhooks
- [ ] Otimizações de performance (code splitting, lazy loading)
- [ ] SEO e meta tags dinâmicas
- [ ] Testes unitários com Vitest
- [ ] Integração com Facebook Pixel

## Configuração do Ambiente

- [x] Dependências instaladas com pnpm
- [x] Projeto inicializado no Manus com webdev_init_project
- [x] Código-fonte copiado do repositório clonado
- [x] Variáveis de ambiente configuradas (injetadas automaticamente pelo Manus)
- [x] Banco de dados MySQL/TiDB conectado
- [x] Servidor de desenvolvimento testado e rodando
- [x] Tabela quiz_responses criada no banco de dados
- [x] Todos os testes passando (4/4)

## Notas

- Projeto clonado de: https://github.com/eio-info-quiz/protocolo01
- Todas as funcionalidades originais foram preservadas
- Design original mantido (cores, fontes, layout)
- Estrutura tRPC + React + Tailwind + Drizzle ORM mantida
