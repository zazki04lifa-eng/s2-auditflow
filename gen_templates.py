"""
Script to generate templates.js and inject Template Gallery into index.html,
then rebuild the final AuditFlow-AI (1).html
"""
import os, base64, re

ARTIFACTS_DIR = r'C:\Users\ASUS 409\.gemini\antigravity-ide\brain\961c2a2e-dda4-4931-8a7f-976e4940a529'
SOURCE_DIR = 'AuditFlow-AI-source'

# ─────────────────────────────────────────────
# 1. Load template images as base64
# ─────────────────────────────────────────────
def load_b64(filename):
    path = os.path.join(ARTIFACTS_DIR, filename)
    with open(path, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()

payroll_h_b64   = load_b64('tmpl_payroll_horizontal_1784187707965.png')
pengeluaran_b64 = load_b64('tmpl_pengeluaran_horizontal_1784187744441.png')
penggajian_b64  = load_b64('tmpl_penggajian_vertical_1784187774003.png')

print('Images loaded OK')

# ─────────────────────────────────────────────
# 2. Write templates.js
# ─────────────────────────────────────────────
templates_js = '''/* ===== js/templates.js ===== */
// Flowchart Template Gallery Data
const FLOWCHART_TEMPLATES = [
  {
    id: 'tmpl_payroll_unilever_h',
    name: 'Siklus Payroll (Horizontal)',
    subtitle: 'PT Unilever Indonesia TBK',
    category: 'Siklus Penggajian',
    layout: 'horizontal',
    icon: '💰',
    tags: ['payroll', 'HRIS', 'swimlane', 'WCGW'],
    description: 'Flowchart horizontal 6-lane mencakup alur lengkap dari HR/People, Timekeeping, Payroll Processing, Finance/Treasury, Bank, hingga Karyawan. Dilengkapi WCGW 1-7 dan control points C1-C7.',
    thumbnail: ''' + repr(payroll_h_b64) + ''',
    narrative: `Siklus Payroll - Alur Proses:
1. HR/People melakukan pengelolaan data master karyawan (hiring, termination, perubahan) dan mengupdate Employee Master Data Change Form ke HRIS Global.
2. Timekeeping merekam kehadiran dan jam kerja/lembur. Sistem memvalidasi data absensi; jika tidak valid dikembalikan untuk koreksi. Jika valid, input timesheet ke sistem HRIS Absensi.
3. Payroll/Shared Svc menerima data HR & Timekeeping dari HRIS. Menghitung Gaji Bruto (Base + Bonus + Lembur).
4. Menghitung Potongan (Pajak + Pensiun 11% + Social Security).
5. Menghitung Gaji Neto = Bruto - Potongan.
6. Memverifikasi varians vs bulan lalu; jika tidak OK dikembalikan untuk koreksi ulang.
7. Menyusun Payroll Register (Daftar Gaji Semua Karyawan).
8. Mencetak Payslip / Slip Gaji Per Karyawan.
9. Finance/Treasury memverifikasi Payroll Register dari Payroll.
10. CFO/CPO melakukan approval; jika tidak disetujui dikembalikan.
11. Mengirim Instruksi Transfer ke Bank.
12. Menyetor Pajak & Iuran Pensiun ke Pemerintah.
13. Membuat Jurnal Penggajian (Dr. Beban Gaji, Kr. Kas/Bank) dan posting ke ERP GL.
14. Melakukan rekonsiliasi Payroll vs Kas Keluar; jika tidak OK dilakukan koreksi.
15. Menyusun Laporan Pajak & Staff Costs.
16. Bank memproses instruksi transfer masuk dan mengeksekusi transfer ke rekening karyawan.
17. Bank menerbitkan Bukti Transfer / Bank Statement.
18. Karyawan menerima Payslip via HRIS/Digital dan Gaji Neto di rekening bank.`,
    wcgw: [
      'WCGW1: Ghost employee / data karyawan tidak valid',
      'WCGW2: Manipulasi absensi / lembur (overclaim)',
      'WCGW3: Kesalahan perhitungan gaji & pajak (gross→net)',
      'WCGW4: Payroll register dimanipulasi sebelum pembayaran',
      'WCGW5: Pembayaran tidak sah (rekening salah / fraud / duplikat)',
      'WCGW6: Salah periode / salah pencatatan (cutoff & klasifikasi)',
      'WCGW7: Selisih payroll vs kas keluar tidak terdeteksi'
    ]
  },
  {
    id: 'tmpl_pengeluaran_unilever_h',
    name: 'Siklus Pengeluaran (Horizontal)',
    subtitle: 'PT Unilever Indonesia TBK',
    category: 'Siklus Pengeluaran',
    layout: 'horizontal',
    icon: '📤',
    tags: ['pengeluaran', 'procurement', '3-way matching', 'swimlane', 'WCGW'],
    description: 'Flowchart horizontal 5-lane mencakup alur Gudang, Pembelian/Procurement, Supplier, Penerimaan Barang, dan Keuangan/AP. Dilengkapi 3-Way Matching, WCGW 1-10 dan control points C1-C10.',
    thumbnail: ''' + repr(pengeluaran_b64) + ''',
    narrative: `Siklus Pengeluaran - Alur Proses:
1. Gudang mengidentifikasi kebutuhan barang/raw material dan menyusun Formulir Permintaan Barang (FPB).
2. Pembelian/Procurement menerima dan memverifikasi FPB dari gudang.
3. Procurement melakukan sourcing supplier dan membuat RFQ/SPPH (Request for Quotation / Surat Permintaan Penawaran Harga).
4. Supplier menerima RFQ dan membuat Surat Penawaran Harga (SPH).
5. Procurement mengevaluasi SPH dan melakukan negosiasi harga.
6. Membuat Purchase Order (PO) yang ditandatangani dan diinput ke ERP (PO Entry).
7. Supplier memproses PO dan menyiapkan barang untuk pengiriman beserta surat jalan.
8. Penerimaan Barang menerima salinan PO dan menyiapkan penerimaan.
9. Memverifikasi kesesuaian barang dengan PO (Qty & Kualitas); jika tidak sesuai diterbitkan Return Note/Debit Note (Retur ke Supplier).
10. Jika barang sesuai, menerbitkan Good Receipt Notes (GRN) dan input ke ERP GRN Data.
11. Supplier menerbitkan Invoice (Tagihan Supplier).
12. Keuangan/AP menerima Invoice dan melakukan verifikasi dokumen.
13. Melakukan 3-Way Matching antara PO, GRN, dan Invoice + validasi dengan data ERP.
14. Jika dokumen tidak match, dilakukan investigasi & klarifikasi.
15. Jika match, dilakukan approval CFO/DoA.
16. Menerbitkan Voucher Pembayaran AP Approved.
17. Mengeksekusi transfer pembayaran ke Supplier.
18. Membuat Jurnal & Posting GL (Dr. Trade Payable, Kr. Kas/Bank) ke ERP.
19. Menyusun Laporan Trade Payables.`,
    wcgw: [
      'WCGW1: Kebutuhan tidak valid (fiktif/overbudget)',
      'WCGW2: Vendor tidak tervalidasi / kolusi sourcing',
      'WCGW3: Evaluasi vendor dimanipulasi / tidak objektif',
      'WCGW4: PO tidak sah / dimanipulasi',
      'WCGW5: Penerimaan barang tidak valid (tidak sesuai / kolusi)',
      'WCGW6: Invoice tidak valid diproses (mismatch/duplikat/fraud)',
      'WCGW7: 3-Way Match tidak dieksekusikan tanpa kontrol',
      'WCGW8: Pembayaran tidak sah (rekening salah / fraud / sebelum GRN)',
      'WCGW9: Salah periode pencatatan (cut off error)',
      'WCGW10: Saldo utang tidak akurat'
    ]
  },
  {
    id: 'tmpl_penggajian_vertical',
    name: 'Siklus Penggajian (Vertikal)',
    subtitle: 'Template Standar 6-Lane',
    category: 'Siklus Penggajian',
    layout: 'vertical',
    icon: '👥',
    tags: ['penggajian', 'payroll', 'HRD', 'swimlane', 'vertikal'],
    description: 'Flowchart vertikal 6-lane (Karyawan, HRD, Accountant, Finance, Manager, Bank) dengan alur proses penggajian dari absensi hingga transfer gaji dan laporan keuangan.',
    thumbnail: ''' + repr(penggajian_b64) + ''',
    narrative: `Siklus Penggajian - Alur Proses:
1. Karyawan melakukan absensi melalui mesin fingerprint setiap hari kerja.
2. HRD merekap kehadiran dan membuat ringkasan kehadiran periode penggajian.
3. HRD memvalidasi data kehadiran; jika ada keberatan dari karyawan dikembalikan untuk koreksi (Ditolak).
4. Setelah validasi, HRD membuat payroll berdasarkan rekap kehadiran yang sudah disetujui.
5. Accountant menerima ringkasan kehadiran dan membuat slip gaji serta ringkasan payroll.
6. Accountant memvalidasi payroll; jika tidak valid dikembalikan ke HRD.
7. Accountant menerbitkan Rekap Payroll dan Slip Gaji untuk didistribusikan.
8. Finance menerima Nilai Gaji dan dokumen Payroll, kemudian membuat Bukti Pembayaran Tunai.
9. Manager menerima dan meninjau dokumen: Rekap Payroll, Ringkasan Kehadiran, dan Bukti Pembayaran Tunai.
10. Manager memberikan persetujuan (approval); jika tidak disetujui dikembalikan untuk revisi.
11. Setelah disetujui, dokumen diteruskan ke Bank untuk proses transfer.
12. Bank menerima Payroll dan Bukti Pembayaran, kemudian mengeksekusi Transfer Payroll ke rekening karyawan.
13. Bank mengirimkan Notifikasi Bukti Transfer kepada karyawan dan Balancing Koran.
14. Karyawan menerima notifikasi transfer dan Slip Gaji.
15. Accountant melakukan Jurnal Entri (pencatatan akuntansi) dan menyusun Laporan Keuangan.`,
    wcgw: [
      'WCGW1: Data kehadiran tidak valid / manipulasi absensi',
      'WCGW2: Perhitungan gaji tidak akurat',
      'WCGW3: Payroll tidak melalui proses validasi yang memadai',
      'WCGW4: Pembayaran ke rekening yang salah',
      'WCGW5: Pencatatan jurnal tidak akurat atau terlambat'
    ]
  }
];
'''

templates_path = os.path.join(SOURCE_DIR, 'js', 'templates.js')
with open(templates_path, 'w', encoding='utf-8') as f:
    f.write(templates_js)
print('templates.js written:', os.path.getsize(templates_path), 'bytes')
