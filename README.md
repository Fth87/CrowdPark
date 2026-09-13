# CrowdPark AI (Frontend WebGIS)

Aplikasi WebGIS prediktif ketersediaan parkir di sekitar stasiun transit massal untuk MAPID WebGIS Competition 2026. Dibangun menggunakan SvelteKit, Supabase, Tailwind CSS, dan Leaflet.js..

> [!NOTE]
> **Catatan Penggunaan Data:** Sistem saat ini menggunakan data dummy (sintetis) untuk simulasi observasi keterisian dan estimasi parkir. Pendekatan ini diambil karena keterbatasan waktu dan keterbatasan sumber daya manusia (SDM) untuk menjalankan survei lapangan langsung selama masa kompetisi.

## Cara Menjalankan

```sh
cp .env.example .env
bun install
bun run dev
```

Isi variabel `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari dashboard Supabase.
Variabel `PUBLIC_OSM_TILE_URL` bersifat opsional dan memakai tile standar OpenStreetMap secara bawaan.

## Verifikasi Build

```sh
bun run check
bun run build
```
