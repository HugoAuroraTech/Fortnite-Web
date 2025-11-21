# 🎮 Módulo de Cosméticos - Fortnite API

Este módulo gerencia a sincronização e consulta de cosméticos do Fortnite usando a [Fortnite-API](https://fortnite-api.com/).

## 📋 Endpoints Disponíveis

### 1. Sincronizar Dados
Sincroniza todos os dados da Fortnite API (cosméticos, novidades e loja).

```http
POST /cosmetics/sync
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sincronização completa realizada com sucesso"
}
```

---

### 2. Listar Todos os Cosméticos (com filtros)
Lista cosméticos com opções de filtro e paginação.

```http
GET /cosmetics?category=BR&rarity=Legendary&isNew=true&limit=20&offset=0
```

**Parâmetros de Query:**
- `category` (opcional): BR, TRACK, INSTRUMENT, CAR, LEGO, LEGOKIT, BEAN
- `rarity` (opcional): Legendary, Epic, Rare, Uncommon, Common
- `type` (opcional): outfit, pickaxe, emote, glider, etc.
- `isNew` (opcional): true/false
- `isOnSale` (opcional): true/false
- `search` (opcional): busca por nome ou descrição
- `limit` (opcional): padrão 50
- `offset` (opcional): padrão 0

**Resposta:**
```json
{
  "items": [
    {
      "id": "outfit_123",
      "name": "Dark Bomber",
      "description": "Uma skin lendária",
      "type": "outfit",
      "rarity": "Legendary",
      "series": "Dark Series",
      "imageIcon": "https://...",
      "imageFeatured": "https://...",
      "price": 1500,
      "isNew": true,
      "isOnSale": false,
      "category": "BR",
      "addedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

### 3. Listar Cosméticos Novos
Retorna apenas os cosméticos recém-lançados.

```http
GET /cosmetics/new?limit=10&offset=0
```

**Parâmetros:**
- `limit` (opcional): padrão 50
- `offset` (opcional): padrão 0

**Resposta:** Mesmo formato do endpoint anterior.

---

### 4. Listar Cosméticos em Promoção
Retorna apenas os cosméticos que estão em promoção.

```http
GET /cosmetics/on-sale?limit=10&offset=0
```

**Parâmetros:**
- `limit` (opcional): padrão 50
- `offset` (opcional): padrão 0

**Resposta:** Mesmo formato do endpoint anterior.

---

### 5. Buscar Cosmético por ID
Retorna detalhes completos de um cosmético específico, incluindo bundles e histórico de aparições na loja.

```http
GET /cosmetics/:id
```

**Exemplo:**
```http
GET /cosmetics/outfit_123
```

**Resposta:**
```json
{
  "id": "outfit_123",
  "name": "Dark Bomber",
  "description": "Uma skin lendária",
  "type": "outfit",
  "rarity": "Legendary",
  "series": "Dark Series",
  "imageIcon": "https://...",
  "imageFeatured": "https://...",
  "price": 1500,
  "isNew": false,
  "isOnSale": true,
  "category": "BR",
  "shopHistory": ["2024-01-01", "2024-01-15"],
  "addedAt": "2024-01-15T10:00:00Z",
  "bundles": [
    {
      "Bundle": {
        "id": "bundle_1",
        "name": "Dark Legends Pack",
        "info": "Pacote com 3 skins",
        "imageUrl": "https://...",
        "price": 3000
      }
    }
  ],
  "shopEntries": [
    {
      "id": "entry_1",
      "offerId": "offer_123",
      "finalPrice": 1350,
      "regularPrice": 1500,
      "inDate": "2024-01-15T00:00:00Z",
      "outDate": "2024-01-16T00:00:00Z",
      "bannerText": "SALE!",
      "bannerType": "Special"
    }
  ]
}
```

---

### 6. Estatísticas dos Cosméticos
Retorna estatísticas gerais sobre os cosméticos cadastrados.

```http
GET /cosmetics/stats/summary
```

**Resposta:**
```json
{
  "total": 5432,
  "totalNew": 45,
  "totalOnSale": 120,
  "byCategory": [
    { "category": "BR", "count": 3500 },
    { "category": "TRACK", "count": 150 },
    { "category": "LEGO", "count": 200 }
  ],
  "byRarity": [
    { "rarity": "Legendary", "count": 450 },
    { "rarity": "Epic", "count": 800 },
    { "rarity": "Rare", "count": 1200 }
  ],
  "recentlyAdded": [
    {
      "id": "outfit_456",
      "name": "Nova Skin",
      "imageIcon": "https://...",
      "rarity": "Epic",
      "addedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

## 🔧 Exemplos de Uso

### Buscar skins lendárias em promoção:
```http
GET /cosmetics?rarity=Legendary&isOnSale=true&limit=10
```

### Buscar picaretas novas:
```http
GET /cosmetics?type=pickaxe&isNew=true
```

### Buscar por nome:
```http
GET /cosmetics?search=bomber
```

### Buscar skins da categoria LEGO:
```http
GET /cosmetics?category=LEGO&limit=20
```

---

## 📦 Estrutura do Banco de Dados

### Model: Cosmetic
- `id`: Identificador único
- `name`: Nome do cosmético
- `description`: Descrição
- `type`: Tipo (outfit, pickaxe, emote, etc.)
- `rarity`: Raridade (Legendary, Epic, etc.)
- `series`: Série (Dark Series, Marvel Series, etc.)
- `setName`: Nome do conjunto
- `imageIcon`: URL da imagem ícone
- `imageFeatured`: URL da imagem destaque
- `price`: Preço em V-Bucks
- `isNew`: Se é novo
- `isOnSale`: Se está em promoção
- `category`: Categoria (enum: BR, TRACK, INSTRUMENT, CAR, LEGO, LEGOKIT, BEAN)
- `shopHistory`: Histórico de datas na loja (JSON)
- `addedAt`: Data de adição na API

---

## 🚀 Como Usar

1. **Sincronizar dados** (fazer isso periodicamente):
```bash
curl -X POST http://localhost:3000/cosmetics/sync
```

2. **Listar cosméticos**:
```bash
curl http://localhost:3000/cosmetics?limit=10
```

3. **Ver estatísticas**:
```bash
curl http://localhost:3000/cosmetics/stats/summary
```

---

## 📝 Notas

- A sincronização deve ser executada periodicamente (ex: a cada 6 horas) para manter os dados atualizados
- Use paginação para lidar com grandes volumes de dados
- Os filtros podem ser combinados para buscas mais específicas
- O histórico da loja é mantido no campo `shopHistory` como JSON
