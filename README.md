# Los Santos Store

Repositório monorepo para a loja virtual *Los Santos*, com frontend Next.js, backend Express, integração com Supabase e bibliotecas compartilhadas.

## Visão Geral

Este projeto é organizado como um workspace pnpm com múltiplos pacotes.

O foco principal é a aplicação de e-commerce `artifacts/los-santos`, que oferece loja e painel administrativo; o backend compartilhado está em `artifacts/api-server`; e o pacote `lib/db` gerencia o esquema do banco de dados com Drizzle.

## Tecnologias

- `pnpm` (workspace monorepo)
- `TypeScript`
- `Next.js 15` (App Router)
- `React 19`
- `Tailwind CSS` (via PostCSS)
- `Express 5`
- `Supabase` (PostgreSQL)
- `Drizzle ORM`
- `OpenAPI` / `Zod`
- `esbuild`

## Estrutura do repositório

- `artifacts/los-santos/` — aplicação principal Next.js da loja e painel admin
- `artifacts/api-server/` — servidor Express que consome os pacotes compartilhados
- `lib/db/` — pacote de esquema e conectividade com banco de dados com Drizzle
- `lib/api-spec/` — geração de OpenAPI e especificações de API
- `lib/api-client-react/` — cliente React gerado a partir do OpenAPI
- `lib/api-zod/` — schemas Zod gerados para validação de API
- `scripts/` — scripts utilitários do workspace
- `pnpm-lock.yaml` — lockfile do pnpm
- `tsconfig.base.json` — configuração de TypeScript compartilhada
- `vercel.json` — configuração de build para Vercel

## Instalação

```bash
pnpm install
```

> O workspace exige `pnpm`. O script `preinstall` verifica se o gerenciador correto está sendo usado.

## Executando em desenvolvimento

### Loja Next.js

```bash
pnpm --filter @workspace/los-santos run dev
```

A loja roda em `http://localhost:3000` por padrão.

### API Server

```bash
pnpm --filter @workspace/api-server run dev
```

O servidor de API é iniciado localmente, geralmente na porta configurada no código.

## Build e Verificação

Para compilar o workspace e verificar tipos:

```bash
pnpm run build
pnpm run typecheck
```

Para compilar apenas a aplicação Next.js:

```bash
pnpm --filter @workspace/los-santos run build
```

## Painel Administrativo

A aplicação `artifacts/los-santos` inclui rotas administrativas protegidas por middleware Supabase:

- `/admin/login`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/orders`

O acesso ao admin é controlado pelo Supabase Auth.

## Esquema Supabase esperado

As principais tabelas usadas pelo projeto incluem:

- `products`
- `product_variants`
- `orders`
- `order_items`

## Variáveis de ambiente

A loja Next.js requer as variáveis abaixo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

O backend e as bibliotecas compartilham configurações de ambiente via Supabase e banco de dados.

## Pacotes principais

### `artifacts/los-santos`

- Aplicação Next.js com loja, carrinho, produtos e checkout.
- Páginas de admin e middleware de proteção.
- Conexão com Supabase via `@supabase/supabase-js` e `@supabase/ssr`.

### `artifacts/api-server`

- Servidor Express modular.
- Usa bibliotecas compartilhadas `@workspace/db` e `@workspace/api-zod`.
- Compila com `esbuild` para `dist/`.

### `lib/db`

- Configuração de Drizzle ORM e geração de schema.
- Scripts de push para banco de dados com `drizzle-kit`.

## Hospedagem

A configuração `vercel.json` define a build para o pacote `@workspace/los-santos` com saída em `artifacts/los-santos/.next`.

## Nota

Este README foi gerado com base no contexto do projeto e na estrutura presente no workspace. Para informações adicionais, verifique os arquivos específicos de cada pacote e a configuração do Supabase.
