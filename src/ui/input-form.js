/**
 * AuditFlow AI - Enhanced Input Form UI Component
 * Form lengkap: Company Name, Industry, Cycle Type, dan Deskripsi Proses
 */

import { extractTextFromFile, validateExtractedText, getFileTypeDisplayName } from '../parser/file-extractor.js';
import { parser } from '../parser/index.js';
import './input-form.css';

/**
 * @typedef {Object} InputFormConfig
 * @property {string} containerId - ID container HTML
 * @property {Function} onSubmit - Callback saat submit (menerima object dengan company, industry, cycle, description)
 * @property {Function} [onFileExtract] - Callback saat file diekstrak
 */

export class InputForm {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.onSubmit = config.onSubmit;
    this.onFileExtract = config.onFileExtract || (() => { });

    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }

    this.extractedText = null;
    this.extractedFile = null;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="input-form">
        <div class="form-header">
          <h2>📝 Input Data Audit</h2>
          <p>Lengkapi informasi project dan deskripsikan proses bisnis yang akan dianalisis</p>
        </div>
        
        <div class="form-body">
          <!-- Company Information Section -->
          <div class="form-section">
            <h3 class="section-title">Informasi Perusahaan</h3>
            
            <!-- Company Name -->
            <div class="form-group">
              <label for="company-name">
                <span class="label-text">Nama Perusahaan</span>
                <span class="label-hint">Wajib diisi</span>
              </label>
              <input 
                type="text" 
                id="company-name" 
                class="form-input" 
                placeholder="Contoh: PT Maju Jaya Abadi"
                required
              />
            </div>
            
            <!-- Industry & Cycle Type Row -->
            <div class="form-row">
              <div class="form-group">
                <label for="industry">
                  <span class="label-text">Industri</span>
                </label>
                <select id="industry" class="form-select">
                  <option value="">Pilih Industri...</option>
                  <option value="manufaktur">Manufaktur</option>
                  <option value="retail">Retail / Perdagangan</option>
                  <option value="jasa">Jasa / Services</option>
                  <option value="keuangan">Keuangan / Perbankan</option>
                  <option value="pertambangan">Pertambangan</option>
                  <option value="konstruksi">Konstruksi</option>
                  <option value="kesehatan">Kesehatan</option>
                  <option value="teknologi">Teknologi / IT</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="cycle-type">
                  <span class="label-text">Siklus Audit</span>
                  <span class="label-hint">Pilih siklus yang akan dianalisis</span>
                </label>
                <select id="cycle-type" class="form-select">
                  <option value="">Pilih Siklus...</option>
                  <option value="pendapatan">Siklus Pendapatan (Revenue)</option>
                  <option value="pengeluaran">Siklus Pengeluaran (Expenditure)</option>
                  <option value="produksi">Siklus Produksi (Production)</option>
                  <option value="payroll">Siklus Payroll (Penggajian)</option>
                  <option value="inventory">Siklus Inventory (Persediaan)</option>
                  <option value="fixed-assets">Siklus Aset Tetap (Fixed Assets)</option>
                  <option value="financing">Siklus Pendanaan (Financing)</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Process Description Section -->
          <div class="form-section">
            <h3 class="section-title">Deskripsi Proses Bisnis</h3>
            
            <!-- Text Input -->
            <div class="form-group">
              <label for="text-input">
                <span class="label-text">Narasi Proses</span>
                <span class="label-hint">Minimal 50 karakter. Jelaskan alur proses dari awal sampai akhir.</span>
              </label>
              <textarea 
                id="text-input" 
                class="form-textarea" 
                placeholder="Contoh:
1. Customer mengajukan pesanan melalui sales
2. Sales memeriksa ketersediaan stok di warehouse
3. Jika stok tersedia, sales membuat sales order
4. Finance menyetujui kredit customer
5. Warehouse menyiapkan barang untuk pengiriman
6. Logistik mengirim barang ke customer
7. Finance mengirim invoice ke customer
8. Customer melakukan pembayaran
9. Accounting mencatat penerimaan kas"
                rows="10"
                minlength="50"
                required
              ></textarea>
              <div class="char-counter">
                <span id="char-count">0</span> karakter (min. 50)
              </div>
            </div>
            
            <!-- Divider -->
            <div class="form-divider">
              <span>ATAU</span>
            </div>
            
            <!-- File Upload -->
            <div class="form-group">
              <label>Upload Dokumen</label>
              <div class="file-upload-area" id="file-upload-area">
                <input 
                  type="file" 
                  id="file-input" 
                  accept=".txt,.docx,.pdf"
                  class="file-input"
                />
                <div class="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p class="upload-text">Drag & drop file di sini atau klik untuk browse</p>
                <p class="upload-hint">Support: .txt, .docx, .pdf (max 10MB)</p>
                <div class="file-info" id="file-info" style="display: none;">
                  <span class="file-name" id="file-name"></span>
                  <span class="file-size" id="file-size"></span>
                  <button class="file-remove" id="file-remove">&times;</button>
                </div>
              </div>
              <div class="upload-status" id="upload-status"></div>
            </div>
            
            <!-- Extracted Text Preview -->
            <div class="extracted-preview" id="extracted-preview" style="display: none;">
              <div class="preview-header">
                <h3>Teks Terekstrak</h3>
                <button class="btn-toggle-preview" id="toggle-preview">Sembunyikan</button>
              </div>
              <div class="preview-content" id="preview-content"></div>
              <div class="preview-validation" id="preview-validation"></div>
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear Form
          </button>
          <button type="button" class="btn btn-primary" id="btn-submit" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Generate Flowchart
          </button>
        </div>
        
        <!-- Validation Messages -->
        <div class="validation-messages" id="validation-messages"></div>
      </div>
    `;
  }

  bindEvents() {
    const companyName = document.getElementById('company-name');
    const industry = document.getElementById('industry');
    const cycleType = document.getElementById('cycle-type');
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const fileRemove = document.getElementById('file-remove');
    const btnSubmit = document.getElementById('btn-submit');
    const btnClear = document.getElementById('btn-clear');
    const togglePreview = document.getElementById('toggle-preview');

    // Company name character counter (for validation)
    companyName.addEventListener('input', () => {
      this.validate();
    });

    // Industry & Cycle type change
    industry.addEventListener('change', () => {
      this.validate();
    });

    cycleType.addEventListener('change', () => {
      this.validate();
    });

    // Text input character counter
    textInput.addEventListener('input', () => {
      const count = textInput.value.length;
      document.getElementById('char-count').textContent = count;
      this.validate();
    });

    // File input
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // Drag and drop
    const uploadArea = document.getElementById('file-upload-area');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    // Remove file
    fileRemove.addEventListener('click', () => {
      this.clearFile();
    });

    // Toggle preview
    togglePreview.addEventListener('click', () => {
      const preview = document.getElementById('extracted-preview');
      preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
      togglePreview.textContent = preview.style.display === 'none' ? 'Tampilkan' : 'Sembunyikan';
    });

    // Submit
    btnSubmit.addEventListener('click', () => {
      this.handleSubmit();
    });

    // Clear
    btnClear.addEventListener('click', () => {
      this.clear();
    });
  }

  async handleFileUpload(file) {
    const statusEl = document.getElementById('upload-status');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      statusEl.innerHTML = '<span class="status-error">File terlalu besar (max 10MB)</span>';
      return;
    }

    // Show loading
    statusEl.innerHTML = '<span class="status-loading">Mengekstrak teks...</span>';

    try {
      // Extract text
      const result = await extractTextFromFile(file);

      if (result.success) {
        // Show file info
        fileName.textContent = result.fileName;
        fileSize.textContent = this.formatFileSize(result.fileSize);
        fileInfo.style.display = 'flex';

        // Validate extracted text
        const validation = validateExtractedText(result.text, result.type);

        // Show preview
        const preview = document.getElementById('extracted-preview');
        const previewContent = document.getElementById('preview-content');
        const previewValidation = document.getElementById('preview-validation');

        previewContent.textContent = result.text.substring(0, 500) + (result.text.length > 500 ? '...' : '');

        if (validation.valid) {
          previewValidation.innerHTML = '<span class="validation-ok">✅ Teks berhasil diekstrak dengan baik</span>';
        } else {
          previewValidation.innerHTML = validation.issues.map(i =>
            `<span class="validation-warning">⚠️ ${i}</span>`
          ).join('');
        }

        preview.style.display = 'block';

        // Store extracted text
        this.extractedText = result.text;
        this.extractedFile = result;

        statusEl.innerHTML = '<span class="status-success">✅ File berhasil diekstrak</span>';

        // Call onFileExtract callback
        this.onFileExtract(result);

      } else {
        statusEl.innerHTML = `<span class="status-error">❌ ${result.error}</span>`;
      }

    } catch (error) {
      statusEl.innerHTML = `<span class="status-error">❌ ${error.message}</span>`;
    }

    this.validate();
  }

  handleSubmit() {
    if (!this.validate()) {
      return;
    }

    const companyName = document.getElementById('company-name').value.trim();
    const industry = document.getElementById('industry').value;
    const cycleType = document.getElementById('cycle-type').value;
    const textInput = document.getElementById('text-input').value.trim();
    const text = textInput || this.extractedText;

    // Parse text
    const parsed = parser.parse(text);

    // Create source input object
    const sourceInput = {
      company: companyName,
      industry: industry,
      cycle: cycleType,
      type: this.extractedFile ? this.extractedFile.type : 'text',
      rawText: text,
      fileName: this.extractedFile ? this.extractedFile.fileName : undefined
    };

    // Call onSubmit callback
    this.onSubmit({
      sourceInput,
      parsed
    });
  }

  validate() {
    const companyName = document.getElementById('company-name')?.value.trim() || '';
    const industry = document.getElementById('industry')?.value || '';
    const cycleType = document.getElementById('cycle-type')?.value || '';
    const textInput = document.getElementById('text-input')?.value.trim() || '';
    const btnSubmit = document.getElementById('btn-submit');
    const validationMessages = document.getElementById('validation-messages');

    const hasCompanyName = companyName.length > 0;
    const hasIndustry = industry.length > 0;
    const hasCycleType = cycleType.length > 0;
    const hasText = textInput.length >= 50;
    const hasFile = !!this.extractedText;

    const isValid = hasCompanyName && hasIndustry && hasCycleType && (hasText || hasFile);

    btnSubmit.disabled = !isValid;

    // Show validation messages
    const messages = [];
    if (!hasCompanyName) messages.push('⚠️ Nama perusahaan wajib diisi');
    if (!hasIndustry) messages.push('⚠️ Pilih industri perusahaan');
    if (!hasCycleType) messages.push('⚠️ Pilih siklus audit yang akan dianalisis');
    if (!hasText && !hasFile) messages.push('⚠️ Masukkan minimal 50 karakter atau upload dokumen');
    if (textInput.length > 0 && textInput.length < 50) {
      messages.push(`⚠️ Teks terlalu pendek (${textInput.length}/50 karakter)`);
    }

    if (messages.length > 0) {
      validationMessages.innerHTML = messages.map(m =>
        `<div class="validation-message warning">${m}</div>`
      ).join('');
    } else {
      validationMessages.innerHTML = '';
    }

    return isValid;
  }

  clear() {
    const companyName = document.getElementById('company-name');
    const industry = document.getElementById('industry');
    const cycleType = document.getElementById('cycle-type');
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const statusEl = document.getElementById('upload-status');

    companyName.value = '';
    industry.value = '';
    cycleType.value = '';
    textInput.value = '';
    fileInput.value = '';
    this.extractedText = null;
    this.extractedFile = null;

    document.getElementById('char-count').textContent = '0';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('extracted-preview').style.display = 'none';
    statusEl.innerHTML = '';

    this.validate();
  }

  clearFile() {
    const fileInput = document.getElementById('file-input');
    const statusEl = document.getElementById('upload-status');

    fileInput.value = '';
    this.extractedText = null;
    this.extractedFile = null;

    document.getElementById('file-info').style.display = 'none';
    document.getElementById('extracted-preview').style.display = 'none';
    statusEl.innerHTML = '';

    this.validate();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Set form data (for editing existing project)
   */
  setData(data) {
    if (data.company) {
      document.getElementById('company-name').value = data.company;
    }
    if (data.industry) {
      document.getElementById('industry').value = data.industry;
    }
    if (data.cycle) {
      document.getElementById('cycle-type').value = data.cycle;
    }
    if (data.description) {
      document.getElementById('text-input').value = data.description;
      document.getElementById('char-count').textContent = data.description.length;
    }
    this.validate();
  }

  /**
   * Get form data
   */
  getData() {
    return {
      company: document.getElementById('company-name')?.value.trim() || '',
      industry: document.getElementById('industry')?.value || '',
      cycle: document.getElementById('cycle-type')?.value || '',
      description: document.getElementById('text-input')?.value.trim() || ''
    };
  }
}
