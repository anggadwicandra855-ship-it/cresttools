#!/bin/sh
# CrestTools - Fase 2a (dijalankan dari ROOT project, setelah zip di-unzip)
set -e

echo "1) Hapus <Navbar /> per-halaman (Navbar sekarang ada di layout.tsx)..."
for f in $(grep -rl 'components/layout/Navbar' src/app 2>/dev/null || true); do
  sed -i '/^import Navbar from "@\/components\/layout\/Navbar";[[:space:]]*$/d' "$f"
  sed -i '/^[[:space:]]*<Navbar[[:space:]]*\/>[[:space:]]*$/d' "$f"
  sed -i 's/className="min-h-screen bg-\[#080b11\]/className="flex-1 bg-[#080b11]/' "$f"
  echo "   dibersihkan: $f"
done

echo "2) Update script package.json (lint + build lokal)..."
npm pkg set scripts.lint="eslint"
npm pkg set scripts.build:local="next build --webpack"

echo "3) Cek sisa referensi Navbar di src/app (harus kosong):"
grep -rn "Navbar" src/app || echo "   bersih"

echo "Selesai. Lanjut: npm run build:local"
