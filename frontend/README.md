# Fortnite Web - Frontend

Frontend completo para o sistema de loja de cosméticos do Fortnite, desenvolvido com React, TypeScript, Tailwind CSS e Shadcn/ui.

## 🚀 Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado assíncrono
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

## ⚙️ Configuração

Edite o arquivo `.env` com a URL do backend:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🏃 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes Shadcn/ui
│   ├── auth/           # Componentes de autenticação
│   ├── shop/           # Componentes da loja
│   ├── cosmetics/      # Componentes de cosméticos
│   ├── layout/         # Layout e navegação
│   └── shared/         # Componentes compartilhados
├── pages/              # Páginas principais
│   ├── auth/           # Login e Registro
│   ├── shop/           # Loja
│   ├── cosmetics/      # Catálogo
│   └── profile/        # Perfil do usuário
├── lib/                # Bibliotecas e utilitários
│   ├── api.ts          # Cliente API
│   ├── queryClient.ts  # Configuração React Query
│   └── utils.ts        # Funções utilitárias
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── types/              # TypeScript types
└── constants/          # Constantes da aplicação
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login e registro de usuários
- ✅ JWT authentication
- ✅ Persistência de sessão
- ✅ Rotas protegidas

### Loja
- ✅ Visualização da loja atual
- ✅ Seções: Bundles, Featured, Daily, Special
- ✅ Timer de atualização da loja
- ✅ Sistema de compra
- ✅ Sistema de reembolso
- ✅ Indicadores de itens possuídos
- ✅ Badges de desconto e novidades

### Catálogo de Cosméticos
- ✅ Listagem paginada
- ✅ Filtros avançados (categoria, raridade, tipo)
- ✅ Busca por nome/descrição
- ✅ Página de detalhes completa
- ✅ Variantes e showcase videos
- ✅ Histórico na loja

### Páginas Especiais
- ✅ Novos Itens
- ✅ Em Promoção
- ✅ Estatísticas do catálogo

### Perfil do Usuário
- ✅ Saldo de V-Bucks
- ✅ Histórico de transações
- ✅ Estatísticas de compras

### Lista de Desejos
- ✅ Adicionar/remover favoritos
- ✅ Persistência no localStorage
- ✅ Página de wishlist

### UX/UI
- ✅ Design moderno e responsivo
- ✅ Dark/Light mode
- ✅ Animações suaves
- ✅ Loading states com skeletons
- ✅ Mobile-first design
- ✅ Navegação intuitiva

## 🎨 Componentes Principais

### ShopPage
Página principal da loja com todas as seções e timer de refresh.

### CosmeticsPage
Catálogo completo com filtros avançados e paginação.

### CosmeticDetailPage
Página de detalhes com todas as informações do cosmético.

### ProfilePage
Perfil do usuário com estatísticas e histórico.

### Navbar
Navegação principal com menu responsivo e indicadores.

## 🔧 Hooks Personalizados

### useAuth
Gerencia autenticação e estado do usuário.

### useShop
Gerencia operações da loja (buscar, comprar, reembolsar).

### useCosmetics
Gerencia busca e filtros de cosméticos.

## 📝 Tipos TypeScript

Todos os tipos são baseados no schema Prisma do backend e incluem:
- User, Cosmetic, Bundle
- ShopItem, ShopResponse
- Transaction, PurchaseHistory
- E muitos mais...

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários
- [ ] Adicionar testes E2E
- [ ] Implementar PWA
- [ ] Adicionar internacionalização (i18n)
- [ ] Otimizar bundle size
- [ ] Adicionar analytics

## 📄 Licença

Este projeto foi desenvolvido como parte de um processo seletivo.
