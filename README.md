# E-commerce Website Builder

Um site completo de e-commerce com painel administrativo construído com Next.js, Supabase e Tailwind CSS.

## Funcionalidades

### Para Usuários
- Sistema de login simples (email + nome + foto opcional)
- Navegação por categorias de produtos
- Sistema de cupons de desconto
- Múltiplos métodos de pagamento (Simulação, IMP, Confiável)
- Histórico de compras
- Integração com Discord para suporte
- Temas personalizados com animações (Natal, Carnaval, Ano Novo, etc)
- Sistema de notificações customizado

### Para Administradores
- Painel administrativo completo
- Gerenciamento de categorias
- Gerenciamento de produtos com estoque
- Sistema de cupons
- Gerenciamento de atendentes
- Aprovação de compras pendentes
- Visualização de termos aceitos
- Configurações do site (nome, descrição, tema, método de pagamento)
- Logs automáticos via webhook do Discord

## Acesso Administrativo

Para acessar o painel administrativo:
1. Na tela de login, clique 5 vezes no logo
2. Digite o email secreto: `tm9034156@gmail.com`
3. Você será logado como administrador

## Tecnologias

- **Next.js 16** - Framework React
- **Supabase** - Backend e banco de dados
- **Tailwind CSS v4** - Estilização
- **TypeScript** - Tipagem
- **Zustand** - Gerenciamento de estado
- **Radix UI** - Componentes acessíveis

## Webhooks do Discord

O sistema envia logs automáticos para webhooks do Discord:
- Contas criadas
- Compras realizadas
- Termos aceitos
- Logs gerais de atividades

*Nota: Logs do administrador não são enviados para evitar spam*

## Estrutura do Banco de Dados

- `users` - Usuários do sistema
- `site_settings` - Configurações globais do site
- `categories` - Categorias de produtos
- `products` - Produtos disponíveis
- `product_keys` - Chaves/códigos dos produtos
- `coupons` - Cupons de desconto
- `purchases` - Compras realizadas
- `support_agents` - Atendentes autorizados
- `terms_accepted` - Registro de aceite de termos

## Cores do Site

Esquema de cores bege com laranja, preto e branco:
- Background: Bege claro
- Primary: Laranja
- Foreground: Preto
- Card: Bege muito claro
- Accent: Laranja

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Validação de usuários em todas as operações
- Sistema de aprovação de compras
- Logs completos de atividades
- HWID único por dispositivo
