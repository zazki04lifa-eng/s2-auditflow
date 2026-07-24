"""
Script to append additional templates (Pendapatan Matahari + Siklus Produksi)
to templates.js, add Template Gallery UI to index.html, update build.py, and rebuild.
"""
import os, re

SOURCE_DIR = 'AuditFlow-AI-source'

# ─────────────────────────────────────────────
# 1. Append 2 more templates to templates.js
# ─────────────────────────────────────────────
additional_templates = r"""
  {
    id: 'tmpl_pendapatan_matahari',
    name: 'Siklus Pendapatan (Vertikal)',
    subtitle: 'PT Matahari Department Store Tbk',
    category: 'Siklus Pendapatan',
    layout: 'vertical',
    icon: '📈',
    tags: ['pendapatan', 'retail', 'POS', 'swimlane', 'WCGW'],
    description: 'Flowchart vertikal 4-lane (Pelanggan, SPG/SPB & Staff Gerai, Kasir/POS, Keuangan/Akuntansi). Mencakup alur penjualan retail mulai dari kedatangan pelanggan, transaksi POS, hingga jurnal akuntansi. Dilengkapi WCGW 1-19 dan Controls C1-C19.',
    thumbnail: null,
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" font-family="Arial,sans-serif" font-size="10">
  <rect width="400" height="600" fill="#e8f4fd" rx="8"/>
  <text x="200" y="22" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a5276">SIKLUS PENDAPATAN</text>
  <text x="200" y="36" text-anchor="middle" font-size="9" fill="#2471a3">PT Matahari Department Store Tbk</text>
  <!-- Lane Headers -->
  <rect x="0" y="44" width="100" height="20" fill="#f0883e" rx="2"/>
  <text x="50" y="58" text-anchor="middle" font-size="8.5" fill="white" font-weight="bold">Pelanggan</text>
  <rect x="100" y="44" width="100" height="20" fill="#e91e8c" rx="2"/>
  <text x="150" y="58" text-anchor="middle" font-size="7.5" fill="white" font-weight="bold">SPG/SPB &amp; Staff</text>
  <rect x="200" y="44" width="100" height="20" fill="#3498db" rx="2"/>
  <text x="250" y="58" text-anchor="middle" font-size="8.5" fill="white" font-weight="bold">Kasir / POS</text>
  <rect x="300" y="44" width="100" height="20" fill="#1abc9c" rx="2"/>
  <text x="350" y="58" text-anchor="middle" font-size="7.5" fill="white" font-weight="bold">Keuangan/Akuntansi</text>
  <!-- Lane separators -->
  <line x1="100" y1="44" x2="100" y2="600" stroke="#ccc" stroke-width="1"/>
  <line x1="200" y1="44" x2="200" y2="600" stroke="#ccc" stroke-width="1"/>
  <line x1="300" y1="44" x2="300" y2="600" stroke="#ccc" stroke-width="1"/>
  <!-- Flow nodes - Lane 1 Pelanggan -->
  <ellipse cx="50" cy="90" rx="30" ry="12" fill="#f0883e"/>
  <text x="50" y="94" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Mulai</text>
  <rect x="15" y="115" width="70" height="28" fill="#fad7a0" rx="4"/>
  <text x="50" y="126" text-anchor="middle" font-size="7.5" fill="#333">Pelanggan</text>
  <text x="50" y="136" text-anchor="middle" font-size="7.5" fill="#333">Datang/Online</text>
  <rect x="15" y="155" width="70" height="28" fill="#fad7a0" rx="4"/>
  <text x="50" y="166" text-anchor="middle" font-size="7.5" fill="#333">Mencari &amp;</text>
  <text x="50" y="176" text-anchor="middle" font-size="7.5" fill="#333">Memilih Barang</text>
  <rect x="15" y="295" width="70" height="28" fill="#fad7a0" rx="4"/>
  <text x="50" y="306" text-anchor="middle" font-size="7.5" fill="#333">Ambil Barang CP</text>
  <text x="50" y="316" text-anchor="middle" font-size="7.5" fill="#333">Bawa ke Kasir</text>
  <rect x="15" y="430" width="70" height="28" fill="#fad7a0" rx="4"/>
  <text x="50" y="441" text-anchor="middle" font-size="7.5" fill="#333">Terima Barang</text>
  <text x="50" y="451" text-anchor="middle" font-size="7.5" fill="#333">&amp; Struk ke-1</text>
  <ellipse cx="50" cy="540" rx="30" ry="12" fill="#f0883e"/>
  <text x="50" y="544" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Selesai</text>
  <!-- Flow nodes - Lane 2 SPG -->
  <rect x="110" y="115" width="80" height="28" fill="#fadbd8" rx="4"/>
  <text x="150" y="126" text-anchor="middle" font-size="7.5" fill="#333">SPG/SPB Bantu</text>
  <text x="150" y="136" text-anchor="middle" font-size="7.5" fill="#333">Cek Ketersediaan</text>
  <polygon points="150,165 175,185 150,205 125,185" fill="#f5cba7"/>
  <text x="150" y="189" text-anchor="middle" font-size="7" fill="#333">Tersedia?</text>
  <rect x="110" y="295" width="80" height="28" fill="#fadbd8" rx="4"/>
  <text x="150" y="310" text-anchor="middle" font-size="7.5" fill="#333">Buat Nota Penjualan</text>
  <rect x="110" y="430" width="80" height="28" fill="#fadbd8" rx="4"/>
  <text x="150" y="441" text-anchor="middle" font-size="7.5" fill="#333">SPG Serahkan</text>
  <text x="150" y="451" text-anchor="middle" font-size="7.5" fill="#333">Barang</text>
  <!-- Flow nodes - Lane 3 Kasir/POS -->
  <rect x="210" y="115" width="80" height="28" fill="#d6eaf8" rx="4"/>
  <text x="250" y="130" text-anchor="middle" font-size="7.5" fill="#333">Scan Barang di CTP POS</text>
  <polygon points="250,155 275,175 250,195 225,175" fill="#aed6f1"/>
  <text x="250" y="179" text-anchor="middle" font-size="7" fill="#333">Reward/Voucher?</text>
  <rect x="210" y="210" width="80" height="28" fill="#d6eaf8" rx="4"/>
  <text x="250" y="221" text-anchor="middle" font-size="7.5" fill="#333">Hitung Total &amp;</text>
  <text x="250" y="231" text-anchor="middle" font-size="7.5" fill="#333">Konfirmasi</text>
  <polygon points="250,255 275,275 250,295 225,275" fill="#aed6f1"/>
  <text x="250" y="279" text-anchor="middle" font-size="7" fill="#333">Metode Bayar?</text>
  <rect x="210" y="305" width="80" height="28" fill="#d6eaf8" rx="4"/>
  <text x="250" y="316" text-anchor="middle" font-size="7.5" fill="#333">Proses Transaksi</text>
  <text x="250" y="326" text-anchor="middle" font-size="7.5" fill="#333">di ETP POS</text>
  <rect x="210" y="350" width="80" height="28" fill="#fef9e7" rx="4"/>
  <text x="250" y="361" text-anchor="middle" font-size="7.5" fill="#333">Struk Penjualan</text>
  <text x="250" y="371" text-anchor="middle" font-size="7.5" fill="#333">3 Rangkap</text>
  <!-- Flow nodes - Lane 4 Keuangan -->
  <rect x="310" y="115" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="130" text-anchor="middle" font-size="7.5" fill="#333">Rekap Penjualan Harian</text>
  <polygon points="350,170 375,190 350,210 325,190" fill="#a9dfbf"/>
  <text x="350" y="194" text-anchor="middle" font-size="7" fill="#333">Cocok &amp; Shift?</text>
  <rect x="310" y="225" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="240" text-anchor="middle" font-size="7.5" fill="#333">Setor Kas ke</text>
  <rect x="310" y="265" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="278" text-anchor="middle" font-size="7.5" fill="#333">Input Data Penjualan</text>
  <rect x="310" y="305" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="320" text-anchor="middle" font-size="7.5" fill="#333">Jurnal Akuntansi</text>
  <rect x="310" y="345" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="358" text-anchor="middle" font-size="7.5" fill="#333">Posting Buku Besar</text>
  <rect x="310" y="385" width="80" height="28" fill="#d5f5e3" rx="4"/>
  <text x="350" y="400" text-anchor="middle" font-size="7.5" fill="#333">Laporan Pendapatan</text>
  <ellipse cx="350" cy="450" rx="35" ry="12" fill="#1abc9c"/>
  <text x="350" y="454" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Selesai</text>
  <!-- WCGW Badges -->
  <circle cx="165" cy="112" r="8" fill="#e74c3c"/>
  <text x="165" y="116" text-anchor="middle" font-size="6.5" fill="white" font-weight="bold">C1</text>
  <circle cx="265" cy="112" r="8" fill="#e74c3c"/>
  <text x="265" y="116" text-anchor="middle" font-size="6.5" fill="white" font-weight="bold">C2</text>
  <!-- Arrows -->
  <line x1="50" y1="102" x2="50" y2="115" stroke="#666" stroke-width="1" marker-end="url(#arr)"/>
  <line x1="150" y1="143" x2="150" y2="165" stroke="#666" stroke-width="1"/>
  <!-- Legend -->
  <rect x="5" y="555" width="390" height="40" fill="white" rx="3" stroke="#ddd" stroke-width="0.5"/>
  <text x="10" y="568" font-size="6.5" fill="#555">WCGW1: Struk palsu/tanpa otorisasi  C1: Basis terima + wewenang  C2: System block item ≤ 0</text>
  <text x="10" y="578" font-size="6.5" fill="#555">WCGW2: Diskon tidak valid  C3: 3-way logging  C4: Voucher otorisasi  C5: Audit log + limit pagu</text>
  <text x="10" y="588" font-size="6.5" fill="#555">WCGW3: Transaksi tidak terlaporkan  C6: Rekonsiliasi harian  C7: Cash handling control</text>
</svg>`,
    narrative: `Siklus Pendapatan - Alur Proses PT Matahari Department Store:
1. Pelanggan datang ke gerai atau berbelanja secara online.
2. Pelanggan mencari dan memilih barang yang diinginkan.
3. SPG/SPB membantu pelanggan mengecek ketersediaan barang di sistem.
4. Sistem memverifikasi ketersediaan stok; jika tidak tersedia, kembali ke proses pencarian.
5. Jika jenis pembelian memerlukan nota konsinyasi, SPG membuat Nota Penjualan Konsinyasi (CV).
6. Pelanggan membawa barang ke kasir.
7. Kasir melakukan scan barang di sistem CTP POS.
8. Sistem mengecek apakah pelanggan memiliki Reward/Voucher Matahari; jika ya, input voucher.
9. Kasir menghitung total transaksi dan konfirmasi kepada pelanggan.
10. Pelanggan memilih metode pembayaran (Tunai atau Non-Tunai/GRS/Transfer Bank).
11. Jika tunai, kasir menerima uang dan memberi kembalian.
12. Jika non-tunai, kasir memproses kartu/GRS/transfer bank.
13. Kasir memproses transaksi final di sistem ETP POS.
14. Sistem mencetak Struk Penjualan 3 rangkap (Struk ke-1 untuk pelanggan, Struk ke-2 untuk SPG, Struk ke-3 untuk keuangan).
15. SPG menyerahkan barang beserta Struk ke-1 kepada pelanggan.
16. Pelanggan menerima barang dan struk. Jika ada keberatan (retur), proses dikembalikan ke SPG untuk verifikasi.
17. Keuangan/Akuntansi menerima Tanda Struk ke-2 dan Data Transaksi POS.
18. Membuat Rekap Penjualan Harian dan memverifikasi kesesuaian kas dengan shift kasir.
19. Jika tidak cocok, dilakukan investigasi selisih kas.
20. Jika cocok, menyetor kas ke rekening bank.
21. Menginput data penjualan ke sistem akuntansi.
22. Mengirim laporan penjualan ke Head Office (HO).
23. Membuat Jurnal Akuntansi (Dr. Piutang/Kas/Pendapatan).
24. Melakukan Posting Buku Besar.
25. Menyusun Laporan Pendapatan final.`,
    wcgw: [
      'WCGW1: Sales tidak valid / Ghost sales (struk palsu)',
      'WCGW2: Transaksi tidak terekam (sistem bypass)',
      'WCGW3: Manipulasi data kehadiran SPG (overclaim komisi)',
      'WCGW4: Transaksi tidak diotorisasi dengan benar',
      'WCGW5: Pengembalian/retur tidak valid (fiktif)',
      'WCGW6: Reward/voucher digunakan secara tidak sah',
      'WCGW7: Penyalahgunaan void transaksi',
      'WCGW8: Rekonsiliasi kas gagal/tidak dilakukan',
      'WCGW9: Salah periode pencatatan (cut off)',
      'WCGW10: Selisih antara data POS dan laporan keuangan tidak terdeteksi'
    ]
  },
  {
    id: 'tmpl_produksi_maju_plastik',
    name: 'Siklus Produksi (Vertikal)',
    subtitle: 'Template Manufacturing',
    category: 'Siklus Produksi',
    layout: 'vertical',
    icon: '🏭',
    tags: ['produksi', 'manufacturing', 'QC', 'PPIC', 'WCGW'],
    description: 'Flowchart vertikal siklus produksi manufacturing dari Sales Order, PPIC, Produksi, hingga Finished Goods. Mencakup tahapan Mixing, Heating, Injection Molding, QC, dan Packing.',
    thumbnail: null,
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" font-family="Arial,sans-serif" font-size="10">
  <rect width="400" height="600" fill="#fef9e7" rx="8"/>
  <text x="200" y="22" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a5276">SIKLUS PRODUKSI</text>
  <text x="200" y="36" text-anchor="middle" font-size="9" fill="#2471a3">Template Manufacturing / Plastik</text>
  <!-- Lane Headers -->
  <rect x="0" y="44" width="80" height="20" fill="#7d3c98" rx="2"/>
  <text x="40" y="58" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Sales / PPIC</text>
  <rect x="80" y="44" width="80" height="20" fill="#2980b9" rx="2"/>
  <text x="120" y="58" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Gudang</text>
  <rect x="160" y="44" width="80" height="20" fill="#e67e22" rx="2"/>
  <text x="200" y="58" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Produksi</text>
  <rect x="240" y="44" width="80" height="20" fill="#27ae60" rx="2"/>
  <text x="280" y="58" text-anchor="middle" font-size="8" fill="white" font-weight="bold">QC</text>
  <rect x="320" y="44" width="80" height="20" fill="#c0392b" rx="2"/>
  <text x="360" y="58" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Akuntansi</text>
  <!-- Lane separators -->
  <line x1="80" y1="44" x2="80" y2="600" stroke="#ccc" stroke-width="1"/>
  <line x1="160" y1="44" x2="160" y2="600" stroke="#ccc" stroke-width="1"/>
  <line x1="240" y1="44" x2="240" y2="600" stroke="#ccc" stroke-width="1"/>
  <line x1="320" y1="44" x2="320" y2="600" stroke="#ccc" stroke-width="1"/>
  <!-- Lane 1: Sales / PPIC -->
  <ellipse cx="40" cy="90" rx="30" ry="12" fill="#7d3c98"/>
  <text x="40" y="94" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Mulai</text>
  <rect x="5" y="115" width="70" height="28" fill="#e8daef" rx="4"/>
  <text x="40" y="126" text-anchor="middle" font-size="7.5" fill="#333">Sales Order</text>
  <text x="40" y="136" text-anchor="middle" font-size="7.5" fill="#333">dari Customer</text>
  <rect x="5" y="160" width="70" height="28" fill="#e8daef" rx="4"/>
  <text x="40" y="173" text-anchor="middle" font-size="7.5" fill="#333">PPIC Susun</text>
  <text x="40" y="183" text-anchor="middle" font-size="7" fill="#333">MPS/MRP</text>
  <rect x="5" y="205" width="70" height="28" fill="#e8daef" rx="4"/>
  <text x="40" y="218" text-anchor="middle" font-size="7.5" fill="#333">Beli Bahan</text>
  <text x="40" y="228" text-anchor="middle" font-size="7.5" fill="#333">Baku</text>
  <!-- Lane 2: Gudang -->
  <rect x="85" y="155" width="70" height="28" fill="#d6eaf8" rx="4"/>
  <text x="120" y="166" text-anchor="middle" font-size="7.5" fill="#333">Material</text>
  <text x="120" y="176" text-anchor="middle" font-size="7.5" fill="#333">Requisition</text>
  <rect x="85" y="195" width="70" height="28" fill="#d6eaf8" rx="4"/>
  <text x="120" y="208" text-anchor="middle" font-size="7.5" fill="#333">Keluarkan</text>
  <text x="120" y="218" text-anchor="middle" font-size="7.5" fill="#333">Bahan Baku</text>
  <rect x="85" y="380" width="70" height="28" fill="#d6eaf8" rx="4"/>
  <text x="120" y="391" text-anchor="middle" font-size="7.5" fill="#333">Gudang FG</text>
  <text x="120" y="401" text-anchor="middle" font-size="7.5" fill="#333">Terima Produk</text>
  <!-- Lane 3: Produksi -->
  <rect x="165" y="115" width="70" height="28" fill="#fde8d8" rx="4"/>
  <text x="200" y="130" text-anchor="middle" font-size="7.5" fill="#333">Terima Bahan Baku</text>
  <rect x="165" y="155" width="70" height="28" fill="#fde8d8" rx="4"/>
  <text x="200" y="166" text-anchor="middle" font-size="7.5" fill="#333">Mixing &amp;</text>
  <text x="200" y="176" text-anchor="middle" font-size="7.5" fill="#333">Heating</text>
  <rect x="165" y="195" width="70" height="28" fill="#fde8d8" rx="4"/>
  <text x="200" y="208" text-anchor="middle" font-size="7.5" fill="#333">Injection</text>
  <text x="200" y="218" text-anchor="middle" font-size="7.5" fill="#333">Molding</text>
  <rect x="165" y="235" width="70" height="28" fill="#fde8d8" rx="4"/>
  <text x="200" y="248" text-anchor="middle" font-size="7.5" fill="#333">Cooling &amp;</text>
  <text x="200" y="258" text-anchor="middle" font-size="7.5" fill="#333">Finishing</text>
  <rect x="165" y="340" width="70" height="28" fill="#fde8d8" rx="4"/>
  <text x="200" y="355" text-anchor="middle" font-size="7.5" fill="#333">Packing</text>
  <!-- Lane 4: QC -->
  <rect x="245" y="275" width="70" height="28" fill="#d5f5e3" rx="4"/>
  <text x="280" y="286" text-anchor="middle" font-size="7.5" fill="#333">Inspeksi QC</text>
  <text x="280" y="296" text-anchor="middle" font-size="7.5" fill="#333">Ukuran/Berat</text>
  <polygon points="280,320 305,340 280,360 255,340" fill="#a9dfbf"/>
  <text x="280" y="344" text-anchor="middle" font-size="7" fill="#333">Lolos QC?</text>
  <rect x="245" y="370" width="70" height="28" fill="#fef9e7" rx="4" stroke="#e74c3c" stroke-width="1"/>
  <text x="280" y="381" text-anchor="middle" font-size="7.5" fill="#c0392b">Reject</text>
  <text x="280" y="391" text-anchor="middle" font-size="7.5" fill="#c0392b">Product</text>
  <!-- Lane 5: Akuntansi -->
  <rect x="325" y="275" width="70" height="28" fill="#fdedec" rx="4"/>
  <text x="360" y="286" text-anchor="middle" font-size="7.5" fill="#333">Kumpulkan</text>
  <text x="360" y="296" text-anchor="middle" font-size="7.5" fill="#333">Biaya Prod.</text>
  <rect x="325" y="320" width="70" height="28" fill="#fdedec" rx="4"/>
  <text x="360" y="335" text-anchor="middle" font-size="7.5" fill="#333">Hitung HPP</text>
  <rect x="325" y="365" width="70" height="28" fill="#fdedec" rx="4"/>
  <text x="360" y="380" text-anchor="middle" font-size="7.5" fill="#333">Laporan</text>
  <text x="360" y="390" text-anchor="middle" font-size="7.5" fill="#333">Biaya Prod.</text>
  <ellipse cx="200" cy="480" rx="35" ry="12" fill="#7d3c98"/>
  <text x="200" y="484" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Selesai</text>
  <!-- WCGW Badges -->
  <circle cx="55" cy="152" r="8" fill="#e74c3c"/>
  <text x="55" y="156" text-anchor="middle" font-size="6.5" fill="white" font-weight="bold">W1</text>
  <circle cx="215" cy="192" r="8" fill="#e74c3c"/>
  <text x="215" y="196" text-anchor="middle" font-size="6.5" fill="white" font-weight="bold">W2</text>
  <circle cx="295" cy="272" r="8" fill="#e74c3c"/>
  <text x="295" y="276" text-anchor="middle" font-size="6.5" fill="white" font-weight="bold">W3</text>
  <!-- Legend -->
  <rect x="5" y="500" width="390" height="50" fill="white" rx="3" stroke="#ddd" stroke-width="0.5"/>
  <text x="10" y="514" font-size="6.5" fill="#555">WCGW1: MPS tidak akurat → kelebihan/kekurangan produksi</text>
  <text x="10" y="524" font-size="6.5" fill="#555">WCGW2: Bahan baku tidak sesuai spec → produk cacat</text>
  <text x="10" y="534" font-size="6.5" fill="#555">WCGW3: QC tidak independen → reject lolos ke customer</text>
  <text x="10" y="544" font-size="6.5" fill="#555">WCGW4: HPP tidak akurat → margin salah hitung</text>
</svg>`,
    narrative: `Siklus Produksi - Alur Proses Manufacturing:
1. Sales menerima pesanan pelanggan dan memasukkan Sales Order ke ERP.
2. PPIC (Production Planning and Inventory Control) menyusun Master Production Schedule (MPS) berdasarkan SO.
3. MRP (Material Requirements Planning) menghitung kebutuhan bahan baku.
4. Jika stok bahan baku tidak mencukupi, Purchasing membeli bahan baku dari supplier.
5. Gudang menerbitkan Material Requisition untuk pengeluaran bahan baku.
6. Gudang mengeluarkan bahan baku ke lantai produksi.
7. Operator produksi menerima bahan baku dan memulai proses produksi.
8. Proses Mixing: bahan baku dicampur sesuai formula/komposisi.
9. Proses Heating: campuran dipanaskan hingga suhu yang diperlukan.
10. Proses Injection Molding: bahan cair dicetak ke dalam mold plastik.
11. Proses Cooling: produk didinginkan hingga mengeras dan stabil.
12. Proses Finishing: trimming, cleaning, dan persiapan produk.
13. QC melakukan inspeksi hasil produksi: ukuran, berat, warna, dan ketahanan.
14. Jika produk lolos QC, dipindahkan ke Finished Goods.
15. Produk yang tidak lolos QC dipisahkan sebagai Reject Product untuk rework atau disposal.
16. Proses Packing: produk yang lolos dikemas sesuai standar.
17. Gudang Finished Goods menerima dan mencatat hasil produksi.
18. Akuntansi mengumpulkan biaya produksi dari bahan baku, tenaga kerja langsung, dan overhead.
19. Akuntansi menghitung Harga Pokok Produksi (HPP) setiap akhir bulan.
20. Menyusun Laporan Biaya Produksi dan analisis varians.`,
    wcgw: [
      'WCGW1: MPS tidak akurat → kelebihan atau kekurangan produksi',
      'WCGW2: Bahan baku tidak sesuai spesifikasi → produk cacat',
      'WCGW3: QC tidak independen → produk reject lolos ke customer',
      'WCGW4: HPP tidak akurat → salah hitung margin dan harga jual',
      'WCGW5: Bahan baku keluar tanpa Material Requisition yang sah',
      'WCGW6: Waste/scrap tidak tercatat → kerugian tidak terdeteksi'
    ]
  }
];
"""

# Read existing templates.js and append
with open(os.path.join(SOURCE_DIR, 'js', 'templates.js'), 'r', encoding='utf-8') as f:
    current = f.read()

# Inject before the closing "];", then close array properly  
insert_before = '\n];\n'
idx = current.rfind(insert_before)
if idx != -1:
    new_content = current[:idx] + ',\n' + additional_templates + '\n];\n'
    with open(os.path.join(SOURCE_DIR, 'js', 'templates.js'), 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Appended 2 templates. New file size: {len(new_content):,} bytes')
else:
    print('ERROR: Could not find closing ]  in templates.js')

print('templates.js updated OK')
