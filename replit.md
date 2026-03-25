# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
This project is a Vietnamese BL movie streaming website (**BLVietSub**) that scrapes data from blvietsub.online.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not used for main app)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Scraping**: cheerio (server-side HTML parsing)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (scraping proxy)
│   └── phim-web/           # React + Vite frontend (BLVietSub)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## BLVietSub Application

### Source Site: blvietsub.online (Blogger-based)

#### Movie List Scraping
- **Container**: `.phimitem`
- **Link/Title**: `a.lable-about[href, title]`, `h3.lable-home` (title wrapped in `[]`)
- **Thumbnail**: `data-image` attribute on `.lable-update` (original high-quality image), fallback to `img.img-lable[data-src]`
- **Episode**: `.main-movie-content` text, parse `[stt/Tập X END]` pattern
- **Pagination**: Blogger cursor-based — `#blog-pager a[href]` first link is next page URL (timestamp URL format)

#### Movie Detail Scraping
- **Title**: `meta[property='og:title']` content
- **Poster**: `.page-cover img[data-src]` (high-quality original image)
- **Duration**: `.listitem` containing `<strong>Thời lượng</strong>` — text after strong tag
- **Country**: `.listitem` containing `<strong>Quốc gia</strong>` — `a.quoc-gia[title]` slug → mapped to Vietnamese via COUNTRY_MAP
- **Actors**: `.listitem` containing `<strong>Diễn viên</strong>` — text after strong tag
- **Description**: Body text matching `[nd]...[/nd]` pattern
- **Video URL**: Body text matching `[01|URL]` pattern (regex `\[(\d+)\|([^\]]+)\]`)
- **Related movies**: Same `.phimitem` parsing as list

#### Country Slug Mapping (COUNTRY_MAP in movies.ts)
```
trung-quoc → Trung Quốc, viet-nam → Việt Nam, thai-lan → Thái Lan,
han-quoc → Hàn Quốc, nhat-ban → Nhật Bản, my → Mỹ, dai-loan → Đài Loan,
phap → Pháp, duc → Đức, hong-kong → Hồng Kông, philippines → Philippines,
tay-ban-nha → Tây Ban Nha, thuy-dien → Thụy Điển, ao → Áo, ha-lan → Hà Lan, uc → Úc
```

### Frontend Routes (phim-web)
- `/` — Home (phim mới cập nhật)
- `/tim-kiem?q=...` — Search results
- `/the-loai?label=...` — Category browse
- `/xem-phim?url=...` — Movie detail + player

### API Routes (api-server at /api)
- `GET /api/movies?cursor=` — Paginated movie list
- `GET /api/movies/search?q=&cursor=` — Search movies
- `GET /api/movies/category?label=&cursor=` — Category movies
- `GET /api/movies/detail?url=` — Movie detail with metadata + video URL

### Pagination Strategy
Blogger uses cursor-based pagination (not page numbers). Frontend maintains a `cursors[]` stack:
- First page: empty cursor (loads `/?m=1`)
- Next page: push `nextCursor` from response onto stack, use it as cursor param
- Previous page: pop cursor from stack

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`).
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`. Main route is `movies.ts` which is a scraping proxy to blvietsub.online using cheerio.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/movies.ts` scrapes blvietsub.online
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)

### `artifacts/phim-web` (`@workspace/phim-web`)

React + Vite frontend. Dark cinematic design with red primary color.

- Entry: `src/main.tsx`
- App shell: `src/App.tsx` — Wouter routing, React Query provider
- Pages: `src/pages/` — Home, Search, Category, MovieDetail, NotFound
- Components: `src/components/` — Header, Footer, MovieCard, MovieGrid, Pagination
- Utils: `src/lib/utils.ts` — `getValidImageUrl()` for safe image loading

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec (`openapi.yaml`) and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks (e.g. `useGetMovies`, `useGetMovieDetail`).

### `scripts` (`@workspace/scripts`)

Utility scripts package.
