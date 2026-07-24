# 📚 PANDUAN PENGGUNAAN - 4 STUDI KASUS AUDITFLOW

## ✨ DAFTAR STUDI KASUS YANG TERSEDIA

### 1️⃣ SIKLUS PENDAPATAN (Revenue Cycle)
**Company:** PT Digital Nusantara Teknologi  
**Jenis:** SaaS / Cloud ERP Provider  
**Scope Audit:** Revenue Cycle - dari prospecting hingga cash collection  

**Proses Bisnis Utama:**
- Prospecting → Sales Proposal → Service Agreement
- ERP auto-generate Customer ID, Contract No, Invoice Schedule
- Project Implementation → "Go Live" Status
- Invoice dikirim otomatis via email
- Customer bayar via transfer bank
- Finance reconcile: Invoice ↔ Transfer ↔ Bank Statement
- Deferred Revenue untuk kontrak tahunan

**Risiko Utama:**
- Revenue Recognition Accuracy
- Deferred Revenue Calculation Errors
- Customer Verification Failures
- Payment Reconciliation Issues
- System Integration Accuracy

---

### 2️⃣ SIKLUS PENGELUARAN (Expenditure Cycle)
**Company:** PT Prima Retail Indonesia  
**Jenis:** Retail Modern (180+ Supermarkets)  
**Scope Audit:** Expenditure Cycle - dari pembelian hingga pembayaran  

**Proses Bisnis Utama:**
- Inventory monitoring → Stok di bawah Reorder Point
- Purchase Requisition dikirim ke Purchasing
- RFQ (Request for Quotation) ke min. 3 supplier
- Supplier kirim Quotation → Purchasing Manager pilih best option
- PO (Purchase Order) diterbitkan
- Supplier kirim barang → Gudang cek (jumlah, kualitas, expired)
- Goods Receipt dibuat
- Three-Way Matching: PO ↔ Goods Receipt ↔ Supplier Invoice
- Voucher Payable dibuat
- Finance schedule pembayaran
- Internet banking payment (2 approvals required)

**Risiko Utama:**
- Unauthorized purchases
- Quality & receipt discrepancies
- Three-way match failures
- Duplicate payments
- Unauthorized approvals

---

### 3️⃣ SIKLUS PENGGAJIAN (Payroll Cycle)
**Company:** PT Garuda Customer Service Indonesia  
**Jenis:** BPO (Business Process Outsourcing)  
**Employee Count:** 3,800 karyawan  
**Scope Audit:** Payroll Cycle - dari HR hingga payment  

**Proses Bisnis Utama:**
- HR Recruitment → Kontrak Kerja → Data entry ke HRIS
- Daily Absensi: Fingerprint + Facial Recognition
- Supervisor approve overtime
- HR monitor: Cuti, Izin, Sakit
- End of month: HR kirim payroll data ke Payroll Officer
- Payroll Officer hitung: Gaji Pokok, Tunjangan, Lembur, BPJS, PPh21, Potongan
- Payroll Manager review & approve → Payroll Register dibuat
- Finance upload transfer file ke bank
- Direktur Keuangan approval
- Bank transfer ke seluruh rekening karyawan
- Slip gaji via Employee Self Service

**Risiko Utama:**
- Unauthorized salary changes
- Incorrect deductions
- Missing employees in payroll
- Tax compliance violations
- Duplicate payments

---

### 4️⃣ SIKLUS PRODUKSI (Production Cycle)
**Company:** PT Maju Plastik Indonesia  
**Jenis:** Manufaktur Kemasan Plastik  
**Produk:** Botol, Tutup, Gelas, Food Container  
**Scope Audit:** Production Cycle - dari sales order hingga finished goods  

**Proses Bisnis Utama:**
- Sales receive pesanan → Sales Order ke ERP
- PPIC buat Master Production Schedule
- MRP hitung kebutuhan raw materials
- Purchasing beli BM jika stok kurang
- Gudang issue BM via Material Requisition
- Production processes:
  - Mixing → Heating → Injection Molding → Cooling → Finishing → QC → Packing
- QC inspect: ukuran, berat, warna, ketahanan
- Passed goods → Finished Goods
- Rejected items → Reject Product
- Accounting hitung Cost of Goods Produced (COGS) setiap bulan

**Risiko Utama:**
- Production efficiency issues
- Quality control failures
- Material wastage
- Cost allocation inaccuracy
- Inventory obsolescence
- WIP valuation errors

---

## 🚀 CARA MEMULAI

### Step 1: Buka Halaman "New Project"
Klik tombol **"New Project"** di sidebar atau dari dashboard

### Step 2: Lihat Case Studies Section
Scroll ke bawah hingga menemukan section: **"📚 Atau Muat Studi Kasus"**

### Step 3: Pilih Studi Kasus
Klik pada salah satu dari 4 case study cards yang tersedia

### Step 4: Sistem Otomatis
Sistem akan:
- ✅ Membuat project baru
- ✅ Mengisi semua data narasi proses bisnis
- ✅ Set framework audit (COSO)
- ✅ Redirect ke Audit Planning Workspace

### Step 5: Mulai Audit Planning
Dari workspace, kamu bisa:
1. **Review Input** - Lihat/edit narasi proses
2. **Generate Flowchart** - Sistem auto-generate diagram alur
3. **Analyze Risks** - WCGW & risk assessment
4. **Create Programs** - Audit program & test of control
5. **Export** - Generate dokumen audit

---

## 📊 CONTOH WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│ 1. PILIH STUDI KASUS                                    │
│    Misal: "Siklus Pendapatan - PT Digital Nusantara"   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PROJECT DIBUAT OTOMATIS                              │
│    - Name: "Studi Kasus 1: Siklus Pendapatan"         │
│    - Company: "PT Digital Nusantara Teknologi"         │
│    - Industry: "SaaS / Technology"                     │
│    - Area: "Revenue Cycle"                            │
│    - Narrative: [5+ halaman deskripsi lengkap]        │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MASUK KE AUDIT PLANNING WORKSPACE                   │
│    Stage 1: Input Proses [✓ SUDAH TERISI]            │
│    Stage 2: Generate Flowchart [Ready]                │
│    Stage 3: Audit Analysis [Ready]                    │
│    Stage 4: Review & Export [Ready]                   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 4. GENERATE FLOWCHART OTOMATIS                         │
│    Sistem parse narasi → generate flowchart            │
│    Pilih arah (vertical/horizontal)                   │
│    Pilih theme (professional/minimal/clean)          │
│    Klik "Generate Flowchart"                         │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 5. GENERATE AUDIT ANALYSIS                             │
│    - WCGW & Risk Assessment                           │
│    - Internal Control Evaluation                      │
│    - Audit Objective Mapping                         │
│    - Test of Control Design                         │
│    - Audit Program Creation                         │
│    - Working Paper Templates                        │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 6. EXPORT DOKUMEN AUDIT                                │
│    Pilih format: PDF / Word / PNG                     │
│    Pilih konten: Flowchart, WCGW, Control, Program   │
│    Download dokumen final                            │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 TIPS & TRICKS

### ✓ Customization Narasi
Jika ingin menyesuaikan narasi:
1. Buka project di Audit Planning Workspace
2. Klik Stage 1 Panel (Input Proses)
3. Klik "Edit Narasi"
4. Ubah/tambahkan text sesuai kebutuhan
5. Narasi yang diupdate akan digunakan saat generate flowchart

### ✓ Reuse Template
Setiap case study bisa di-load berulang kali:
- Load "Siklus Pendapatan" untuk audit Revenue Cycle berbeda
- Setiap load akan create project baru
- Modify narasi sesuai klien spesifik

### ✓ Export ke Format Berbeda
Setelah generate Flowchart & Analysis:
- PDF: Bagus untuk presentasi, digital filing
- Word: Untuk editing lanjutan di MS Word
- PNG: Untuk embed di presentation/dokumentasi

---

## 📝 DATA YANG SUDAH DIISI (PER CASE STUDY)

| Field | Content | Editable? |
|-------|---------|-----------|
| Project Name | Studi Kasus # - [Siklus] | ✅ Ya |
| Company | [Nama Perusahaan] | ✅ Ya |
| Industry | [Industri] | ✅ Ya |
| Audit Area | [Area Audit] | ✅ Ya |
| Framework | COSO | ✅ Ya |
| Narrative | 5-7 halaman full | ✅ Ya |
| Process Steps | 15-20 steps detail | ✅ Ya |
| Key Risks | 6-8 risiko utama | ✅ Ya |

---

## ⚙️ SYSTEM REQUIREMENTS

✅ Semua file sudah diintegrasikan di:
- `js/case-studies.js` - Data & logic
- `js/app.js` - Rendering & event handling
- `index.html` - UI section
- `css/style.css` - Styling

✅ No external dependencies needed
✅ 100% browser-based
✅ Data simpan di localStorage

---

## 🔒 DATA STORAGE

Semua case study data:
- ✅ Simpan di localStorage browser
- ✅ Tidak dikirim ke server
- ✅ Tersimpan offline
- ✅ Bisa di-export anytime

**Backup Data:**
Gunakan tombol "Export" untuk download backup JSON project

---

## 🎓 LEARNING PATH

### Untuk Pemula:
1. Load "Siklus Penggajian" (paling simple & universal)
2. Review narasi
3. Generate flowchart
4. Lihat hasil analisis

### Untuk Intermediate:
1. Load semua 4 case studies
2. Compare struktur & risiko masing-masing
3. Customize sesuai klien
4. Export hasil untuk presentasi

### Untuk Advanced:
1. Load case study → Customize narasi
2. Generate flowchart → Edit & revisi
3. Generate analysis → Validate rules
4. Build audit program dari template
5. Export complete audit documentation

---

## 📞 TROUBLESHOOTING

**Q: Studi kasus tidak muncul?**
A: Refresh browser (Ctrl+R), atau clear localStorage & reload

**Q: Data narasi hilang?**
A: Data simpan di localStorage. Jangan clear browser data. Backup via Export.

**Q: Ingin mengganti data studi kasus?**
A: Load ulang dari "New Project" → "Muat Studi Kasus" section

**Q: Bisa load multiple case study sekaligus?**
A: Ya! Setiap load create project terpisah. Lihat di "My Projects"

---

## 🎉 SELESAI!

Sekarang kamu siap untuk:
- ✅ Membuat audit planning dengan cepat
- ✅ Menggunakan template proven dari industry leaders
- ✅ Generate flowchart & analysis otomatis
- ✅ Export dokumentasi audit profesional

**Happy Auditing! 🚀**
