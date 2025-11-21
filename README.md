# Fortnite Web – Guia de Execução

Este repositório reúne o backend (NestJS + Prisma) e o frontend (React + Vite) do projeto Fortnite Web. Abaixo estão as instruções para rodar o projeto localmente, as principais tecnologias e as decisões técnicas mais relevantes.

## Instruções para rodar localmente

**Pré-requisitos**
- Docker e Docker Compose instalados
- Porta `3000` (API), `5173` (Front) e `5432` (Postgres) livres

**Passo a passo**
1. Clone o repositório e acesse a raiz `Fortnite-Web`.
2. Configure variáveis sensíveis criando os arquivos `.env`:
   - `backend/.env` (exemplo)
     ```
     DATABASE_URL=postgres://postgres:postgres@db:5432/fortnite
     JWT_SECRET=uma_chave_super_segura
     ```
   - `frontend/.env` (opcional, apenas se quiser sobrepor a URL padrão)
     ```
     VITE_API_BASE_URL=http://localhost:3000
     ```
3. Suba todos os serviços:
   ```
   docker compose up --build
   ```
4. **Sincronize os dados dos cosméticos** (obrigatório na primeira execução):

   Após os containers estarem rodando, execute a sincronização com a API do Fortnite:
   ```bash
   curl -X POST http://localhost:3000/cosmetics/sync
   ```

   Ou acesse diretamente no navegador:
   ```
   POST http://localhost:3000/cosmetics/sync
   ```

   **⚠️ Importante**: Este passo é necessário para popular o banco de dados com os cosméticos. Sem isso, a aplicação não terá dados para exibir.

5. Acesse:
   - API: `http://localhost:3000`
   - Frontend: `http://localhost:5173`

**Execução sem Docker (opcional)**
- Backend: `cd backend && npm install && npx prisma generate && npm run start:dev`
- Frontend: `cd frontend && npm install && npm run dev`
- **Não esqueça de sincronizar os dados**: `curl -X POST http://localhost:3000/cosmetics/sync`

## ⚠️ Primeiro Uso - Sincronização Obrigatória

Na primeira execução do projeto (ou sempre que o banco estiver vazio), é **obrigatório** executar a sincronização dos dados:

```bash
curl -X POST http://localhost:3000/cosmetics/sync
```

Este endpoint:
- Busca todos os cosméticos da [Fortnite-API](https://fortnite-api.com/)
- Popula o banco de dados com itens BR, músicas, instrumentos, carros, LEGO e beans
- Sincroniza a loja atual do Fortnite
- Deve ser executado após os containers estarem rodando

**Tempo estimado**: 2-5 minutos (depende da quantidade de dados da API)

**Resposta esperada**:
```json
{
  "success": true,
  "message": "Sincronização completa realizada com sucesso"
}
```

## Tecnologias utilizadas
- **Backend**
  - NestJS 11 (estrutura da API REST)
  - Prisma ORM + PostgreSQL
  - JWT para autenticação
  - Scheduler com `@nestjs/schedule` para sincronizar a loja e cosméticos
- **Frontend**
  - React 19 + Vite 7
  - TanStack Query, Axios e Zustand para dados e estado
  - Tailwind CSS 4 + Radix UI para UI e acessibilidade
- **Infra**
  - Docker multi-stage (Node 20 e Nginx alpine)
  - Docker Compose com Postgres 15

## Estrutura geral
```
Fortnite-Web/
├─ backend/          # API NestJS + Prisma
├─ frontend/         # SPA React/Vite
└─ docker-compose.yml
```

## Endpoints principais

### Autenticação (`/auth`)
| Método | Rota            | Descrição                      | Auth |
|--------|-----------------|--------------------------------|------|
| POST   | `/auth/register`| Cria novo usuário              | Não  |
| POST   | `/auth/login`   | Retorna JWT + dados do usuário | Não  |

### Usuários (`/users`)
| Método | Rota                   | Descrição                               | Auth |
|--------|------------------------|-----------------------------------------|------|
| GET    | `/users`               | Lista usuários com paginação            | Não  |
| GET    | `/users/:id`           | Busca usuário por ID                    | Não  |
| GET    | `/users/:id/cosmetics` | Lista cosméticos possuídos pelo usuário | Não  |

### Cosméticos (`/cosmetics`)
| Método | Rota                         | Descrição                                  | Auth |
|--------|------------------------------|--------------------------------------------|------|
| GET    | `/cosmetics`                 | Lista geral com filtros (raridade, tipo…)  | Não  |
| GET    | `/cosmetics/:id`             | Detalhes de um cosmético específico        | Não  |
| GET    | `/cosmetics/new`             | Cosméticos recém-adicionados               | Não  |
| GET    | `/cosmetics/on-sale`         | Itens em promoção                          | Não  |
| GET    | `/cosmetics/featured`        | Destaques (alias de on-sale)               | Não  |
| GET    | `/cosmetics/stats/summary`   | Estatísticas agregadas                     | Não  |
| POST   | `/cosmetics/sync`            | Força sincronização com a Fortnite API     | Sim (idealmente protegido/admin) |

### Loja (`/shop`)
| Método | Rota              | Descrição                                               | Auth |
|--------|-------------------|---------------------------------------------------------|------|
| GET    | `/shop/current`   | Retorna a loja aberta (opcional `userId` para personalizar)| Não  |
| POST   | `/shop/buy`       | Compra cosmético ou bundle informado no `PurchaseDto`   | Sim (JWT) |
| POST   | `/shop/refund`    | Estorna compra (cosmético ou bundle)                    | Sim (JWT) |
| GET    | `/shop/history`   | Histórico de compras do usuário autenticado             | Sim (JWT) |

> Autorização é feita via `AuthGuard('jwt')`. Ajuste as políticas conforme necessidade (ex.: limitar `/cosmetics/sync` a admins).

## Destaques do frontend
- **Estrutura**: Vite + React Router organizados por páginas (`src/pages`) e componentes reutilizáveis (`src/components/ui`).
- **Estado e dados**:
  - `src/lib/api.ts` centraliza chamadas HTTP com Axios e injeta o token armazenado em `localStorage`.
  - TanStack Query gerencia cache de listagens/estatísticas, reduzindo chamadas repetidas.
  - Zustand (`src/stores`) mantém o estado de autenticação e lista de desejos.
- **Páginas principais**:
  - `HomePage`, `ShopPage`, `Cosmetics` (listagens/novidades/promoções), `StatsPage`, `Wishlist`, `Profile`.
  - Login/Registro com feedback via `sonner`.
- **UX/UI**:
  - Radix UI para patterns acessíveis (dialogs, dropdowns, tabs).
  - Tailwind 4 + utilitários (`tailwind-merge`, `clsx`) para compor estilos responsivos.
  - Hooks customizados (`useShop`, `useCosmetics`, `useAuth`) isolam lógica e lato caching.

## Decisões técnicas relevantes
- **Multi-stage Dockerfiles**: separados em fases de build e runtime para reduzir tamanho final das imagens e garantir reprodutibilidade via `npm ci`.
- **Prisma em runtime**: `npx prisma migrate deploy` executado na subida do container, garantindo que o schema esteja sincronizado antes de iniciar o servidor Nest.
- **Frontend estático via Nginx**: após o build do Vite, os arquivos são servidos por Nginx, simplificando o deploy e removendo dependência de Node no container final.
- **Configuração centralizada via Compose**: backend consome o serviço `db` pela rede interna e o frontend recebe a URL da API via `build.args`, mantendo consistência entre ambientes.
- **Agendamentos**: o serviço `shop.scheduler` roda jobs (via `@nestjs/schedule`) para atualizar automaticamente a loja com base na API oficial, garantindo dados frescos sem intervenção manual.

> Em caso de dúvidas ou para novos ambientes (homolog/produção), basta atualizar as variáveis definidas acima e reconstruir os serviços.

## 🚀 Deploy em Produção

Para fazer deploy do projeto em produção, consulte o guia completo em [DEPLOY.md](./DEPLOY.md).

**Plataformas recomendadas:**
- **Railway** (mais simples) - Deploy automático via Git, SSL gratuito, PostgreSQL gerenciado
- **Render** - Plano gratuito disponível, fácil configuração
- **DigitalOcean** - App Platform ou VPS para mais controle
- **VPS** (AWS, Hetzner, Contabo) - Controle total, use `docker-compose.prod.yml`

**Arquivos importantes:**
- `docker-compose.prod.yml` - Configuração otimizada para produção
- `env.example` - Template de variáveis de ambiente
- `DEPLOY.md` - Guia detalhado de deploy

**Checklist rápido:**
1. Configure variáveis de ambiente (copie `env.example` para `.env`)
2. Use senhas fortes para `POSTGRES_PASSWORD` e `JWT_SECRET`
3. Configure `VITE_API_BASE_URL` com a URL pública da sua API
4. Configure SSL/HTTPS
5. Execute `docker compose -f docker-compose.prod.yml up -d --build`
6. Sincronize os dados: `curl -X POST https://sua-api.com/cosmetics/sync`
