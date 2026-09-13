# GIS Web

SvelteKit + Supabase dengan TypeScript dan Bun.

## Mulai

```sh
cp .env.example .env
bun install
bun run dev
```

Isi `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari Supabase Dashboard.
`PUBLIC_OSM_TILE_URL` bersifat opsional dan menggunakan tile standar OpenStreetMap secara default.
Gunakan publishable key untuk aplikasi web; jangan masukkan secret key ke kode client atau `.env` yang dibagikan.

## Verifikasi

```sh
bun run format
bun run check
bun run build
```

Database type placeholder di `src/lib/database.types.ts` perlu diganti dengan type hasil generate setelah schema Supabase dibuat
