# CrowdPark Code Rules

Status: wajib. Berlaku untuk kode baru dan refactor kode lama.

Dokumen ini adalah sumber aturan proyek. Jika aturan di kode atau konfigurasi lebih spesifik,
ikuti konfigurasi yang berjalan dan perbarui dokumen ini pada perubahan arsitektur berikutnya.

## Prinsip kerja

- Gunakan Bun untuk install, script, dan lockfile.
- Gunakan ponytail: pilih solusi standar yang paling kecil, YAGNI, dan satu sumber kebenaran.
- Selalu baca dokumentasi resmi versi yang dipakai sebelum memakai API framework, library, Supabase, Leaflet, OSM, atau tool lain.
- Sebelum membuat komponen UI, cari komponen yang tersedia di shadcn-svelte registry dan `src/lib/components/ui/`; gunakan komponen shadcn terlebih dahulu.
- Buat komponen custom hanya ketika shadcn tidak menyediakan perilaku yang dibutuhkan; catat alasan teknisnya di dekat implementasi atau dokumentasi fitur.
- Pertahankan desain Figma dan user flow yang sudah disepakati. Perubahan visual harus punya alasan produk.
- Simpan setiap tanggung jawab di tempat yang paling kecil dan paling dekat dengan pemiliknya.

## Batas file dan struktur

- Maksimal sekitar 150 baris per file setelah Prettier.
- Satu file memiliki satu tanggung jawab. Satu halaman atau komponen besar memiliki satu file.
- Semua kode aplikasi berada di `src/`.
- Route hanya berada di `src/routes/` dan menyusun komponen fitur.
- Komponen shadcn-svelte berada di `src/lib/components/ui/`.
- Komponen layout lintas fitur berada di `src/lib/components/layout/`.
- Komponen lintas fitur berada di `src/lib/components/shared/`.
- Logic domain dan UI fitur berada di `src/lib/features/<feature>/`.
- Kode server-only berada di `src/lib/server/`.
- Gunakan `$lib` untuk shared infrastructure dan alias feature yang tersedia untuk kode fitur.
- Sebelum membuat komponen, cari nama dan perilaku yang sudah ada dengan `rg`.
- Untuk komponen UI, cek shadcn-svelte terlebih dahulu sebelum menulis markup atau primitive baru.
- Satu komponen tidak boleh menerima props lalu membuangnya. Hapus abstraction yang tidak berguna.

## Peta struktur proyek

Struktur aktual proyek dipertahankan dengan pola berikut:

```text
docs/CODE_RULES.md              # aturan agent dan kontributor
src/routes/                     # entry point route SvelteKit yang tipis
src/lib/components/ui/          # source komponen shadcn-svelte lokal
src/lib/components/layout/      # layout lintas fitur jika diperlukan
src/lib/components/shared/      # UI lintas fitur jika diperlukan
src/lib/features/crowdpark/     # domain, data, type, component, dan screen CrowdPark
src/lib/server/                 # Supabase dan kode server-only
src/lib/assets/                 # asset yang di-import oleh source
static/                         # asset publik yang diakses lewat URL
```

- Setiap feature memiliki `components/`, `data.ts`, `types.ts`, dan `screens/` sesuai kebutuhan.
- `components/` berisi komponen domain yang dipakai screen feature tersebut.
- `screens/` berisi komposisi halaman; route hanya mengimpor dan merender screen.
- `data.ts` menyimpan data feature yang typed; `types.ts` menyimpan kontrak datanya.
- `src/lib/components/ui/` adalah satu-satunya lokasi primitive shadcn-svelte.
- Asset publik masuk `static/`; asset yang diproses bundler masuk `src/lib/assets/`.
- Nama folder, alias import, dan lokasi file harus mengikuti pola ini pada setiap feature baru.
- Sebelum membuat folder baru, cari struktur yang sudah ada dengan `rg --files` dan gunakan lokasi terdekat yang sesuai.
- Jangan membuat alternatif seperti `app/`, `components/`, atau `lib/` di root proyek.

## SvelteKit dan Svelte 5

- Gunakan rune Svelte 5 untuk state dan derivation.
- `+page.svelte` hanya mengatur metadata dan komposisi UI.
- Query server dilakukan di `+page.server.ts` atau `+layout.server.ts` dan diteruskan melalui `data`.
- Mutasi memakai Form Actions di `+page.server.ts`; endpoint hanya untuk API yang memang dikonsumsi klien lain.
- Fetch, validasi, repository, secrets, database, dan enkripsi tetap di server boundary.
- State browser seperti draft atau preview file berada di modul feature khusus.
- Data dummy typed berada di `data.ts` atau folder `dummy/` milik feature.
- Type feature berada di `types.ts`; helper murni berada di `utils/`.
- Public routes tetap SSR dan hydrated. Jika nanti dibuat app/admin shell client-rendered, atur opsi rendering di layout induknya.
- Gunakan `onMount` dan dynamic import untuk library browser-only seperti Leaflet agar SSR tetap aman.

## UI, shadcn-svelte, dan Tailwind

- Gunakan komponen lokal di `$lib/components/ui/` untuk Button, Card, Badge, Field, InputGroup,
  ToggleGroup, RadioGroup, Alert, Drawer, Avatar, Separator, dan primitive sejenis.
- Compose primitive shadcn dengan komponen domain di feature; jangan membuat folder atoms, molecules, atau organisms.
- Gunakan variant shadcn sebelum class tambahan. Variant produk harus didefinisikan di primitive lokal.
- Gunakan Tailwind utility-first dan token di `src/app.css` untuk warna, radius, font, shadow, dan spacing.
- Tulis utility secara mobile-first; gunakan prefix breakpoint hanya saat layout berubah pada breakpoint tersebut.
- Cari token theme yang sudah ada sebelum menulis nilai baru. Tambahkan token ke `@theme` untuk nilai yang dipakai ulang.
- Gunakan arbitrary value hanya untuk geometri Figma, ukuran viewport, CSS variable, atau nilai one-off yang memang diperlukan.
- Gunakan token semantic untuk warna dan state. Nilai warna hex langsung di markup tidak menjadi pola umum.
- Gunakan `gap-*`, flex, dan grid untuk spacing layout. Gunakan `space-*` hanya saat struktur memang berupa alur satu dimensi.
- Gunakan `cn` atau variant `tv` untuk class conditional. Susunan class harus tetap mudah dibaca setelah Prettier.
- Gunakan `@apply` untuk base layer dan utility proyek yang berulang; styling komponen tetap didekatkan ke komponen.
- Sediakan state `hover`, `focus-visible`, `disabled`, `aria-*`, dan responsive ketika komponen membutuhkannya.
- Gunakan class layout di pemanggil komponen. Hindari CSS global baru jika utility atau token sudah cukup.
- Gunakan Lucide melalui `@lucide/svelte` untuk icon interface.
- Setiap form memiliki label, deskripsi/error yang tepat, keyboard focus, dan state disabled yang jelas.
- Setiap icon-only button memiliki `aria-label`; setiap gambar memiliki `alt` yang bermakna.

## Map dan OpenStreetMap

- Semua peta CrowdPark memakai `MapCanvas` Leaflet yang reusable.
- Import Leaflet hanya di browser, lakukan cleanup map saat komponen dilepas, dan pastikan container memiliki tinggi.
- Tile URL berasal dari `PUBLIC_OSM_TILE_URL` dengan fallback resmi HTTPS OpenStreetMap.
- Attribution OpenStreetMap selalu terlihat di setiap instance map.
- Jangan bulk download, prefetch, atau membuat offline cache untuk tile OSM.
- Marker dan koordinat typed berada di data feature, bukan hardcoded tersebar di markup.
- Ikuti [Leaflet Quick Start](https://leafletjs.com/examples/quick-start/), [Leaflet API](https://leafletjs.com/reference),
  dan [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

## Supabase

- Gunakan `@supabase/ssr` untuk session cookie pada SSR SvelteKit dan `@supabase/supabase-js` sesuai boundary.
- Gunakan publishable key pada client; secret key hanya di server environment.
- Akses database melalui server load, repository typed, atau Form Action sesuai kebutuhan.
- Jangan menaruh query database langsung di komponen Svelte.
- Type database di `src/lib/database.types.ts` harus berasal dari schema Supabase saat schema siap.
- Ikuti [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) dan [SvelteKit quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit).

## Data, admin, dan CRUD

- UI interaktif seperti search, filter, pagination, dan selection dibuat sebagai komponen Svelte ber-props.
- Admin data table memakai `columns.ts`, `data-table-features.ts`, dan `data-table.svelte`.
- Aksi CRUD utama memakai route khusus `tambah`, detail, `edit`, `verifikasi`, atau `hapus`.
- Mutasi admin melewati repository typed, validasi input, dan audit log bila domain mendukung audit.
- Menu aksi tabel menggunakan satu dropdown ringkas yang mengarah ke route aksi.

## Perintah dan verifikasi

```sh
bun install
bun run format
bun run check
bun run build
```

Perubahan selesai ketika Prettier, `svelte-check`, build, dan seluruh route terdampak berhasil.
Tambahkan verifikasi route atau QA visual jika perubahan menyentuh rendering atau responsive layout.

Rujukan resmi: [Bun](https://bun.sh/docs/pm/cli/install), [SvelteKit](https://svelte.dev/docs/kit),
[Svelte](https://svelte.dev/docs/svelte/overview), [shadcn-svelte](https://shadcn-svelte.com/docs),
dan [Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes).
