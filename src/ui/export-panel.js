/**
 * AuditFlow AI - Export Panel UI Component
 * UI untuk export ke berbagai format
 */

import { ExportManager } from '../export/export-manager.js';

/**
 * @typedef {import('../types/index.js').FlowchartData} FlowchartData
 * @typedef {import('../types/index.js').WcgwEntry} WcgwEntry
 * @typedef {import('../types/index.js').WorkingPaper} WorkingPaper
 * @typedef {import('../types/index.js').FlowchartOptions} FlowchartOptions
 */

export class ExportPanel {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Object} [options.renderer] - FlowchartRenderer instance
   * @param {Function} [options.onNavigate] - Callback untuk navigasi ke stage lain
   */
  constructor(container, options = {}) {
    this.container = container;
    this.renderer = options.renderer;
    this.onNavigate = options.onNavigate;
    this.exportManager = new ExportManager();
    this.data = null;
    
    this._render();
    this._bindEvents();
  }
  
  /**
   * Set data untuk export
   * @param {Object} data
   */
  setData(data) {
    this.data = data;
    
    // Update project name display
    const nameEl = this.container.querySelector('.export-project-name');
    if (nameEl) {
      nameEl.textContent = data.projectName || 'Untitled Project';
    }
    
    // Validate data
    const validation = this.exportManager.validateData(data);
    const exportBtn = this.container.querySelector('#btnExport');
    if (exportBtn) {
      exportBtn.disabled = !validation.valid;
    }
    
    // Show validation errors
    const errorEl = this.container.querySelector('.export-errors');
    if (errorEl) {
      if (!validation.valid) {
        errorEl.innerHTML = validation.errors.map(e => `<div>⚠️ ${e}</div>`).join('');
        errorEl.style.display = 'block';
      } else {
        errorEl.style.display = 'none';
      }
    }
  }
  
  /**
   * Render component
   * @private
   */
  _render() {
    this.container.innerHTML = `
      <div class="export-panel">
        <div class="export-header">
          <h2>📤 Export & Bagikan</h2>
          <div class="export-project-info">
            <span class="export-label">Project:</span>
            <span class="export-project-name">-</span>
          </div>
        </div>
        
        <div class="export-errors" style="display:none;"></div>
        
        <!-- Navigation Buttons -->
        <div class="export-nav">
          <button class="btn btn-secondary" data-navigate="input" title="Kembali ke input">
            ← Tahap 1: Input
          </button>
          <button class="btn btn-secondary" data-navigate="flowchart" title="Edit flowchart">
            ← Tahap 2: Flowchart
          </button>
          <button class="btn btn-secondary" data-navigate="analysis" title="Lihat analisis">
            ← Tahap 3: Analisis
          </button>
        </div>
        
        <!-- Export Options -->
        <div class="export-options">
          <h3>Pilih Format Export</h3>
          
          <div class="export-format-grid">
            <!-- PNG -->
            <div class="export-format-card" data-format="png">
              <div class="format-icon">🖼️</div>
              <div class="format-info">
                <h4>PNG Image</h4>
                <p>Flowchart berkualitas tinggi dengan latar transparan</p>
                <span class="format-ext">.png</span>
              </div>
            </div>
            
            <!-- JPG -->
            <div class="export-format-card" data-format="jpg">
              <div class="format-icon">📷</div>
              <div class="format-info">
                <h4>JPG Image</h4>
                <p>Flowchart dengan ukuran file lebih kecil</p>
                <span class="format-ext">.jpg</span>
              </div>
            </div>
            
            <!-- PDF -->
            <div class="export-format-card" data-format="pdf">
              <div class="format-icon">📄</div>
              <div class="format-info">
                <h4>PDF Document</h4>
                <p>Dokumen lengkap: flowchart + analisis + rekomendasi</p>
                <span class="format-ext">.html → PDF</span>
              </div>
            </div>
            
            <!-- DOCX -->
            <div class="export-format-card" data-format="docx">
              <div class="format-icon">📝</div>
              <div class="format-info">
                <h4>Word Document</h4>
                <p>Dokumen editable untuk kolaborasi lebih lanjut</p>
                <span class="format-ext">.docx</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Export Settings -->
        <div class="export-settings">
          <h3>Pengaturan Export</h3>
          <div class="settings-grid">
            <div class="field">
              <label>Nama File</label>
              <input type="text" id="exportFilename" class="input" placeholder="audit-working-paper" value="audit-working-paper">
            </div>
            <div class="field">
              <label>Resolusi (Scale)</label>
              <select id="exportScale" class="select">
                <option value="1">1x (72 DPI)</option>
                <option value="2" selected>2x (144 DPI)</option>
                <option value="3">3x (216 DPI)</option>
                <option value="4">4x (288 DPI)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Export Actions -->
        <div class="export-actions">
          <button class="btn btn-secondary" id="btnExportSelected">
            Export Terpilih
          </button>
          <button class="btn btn-primary" id="btnExport">
            Export Semua Format
          </button>
        </div>
        
        <!-- Progress -->
        <div class="export-progress" id="exportProgress" style="display:none;">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">Memproses...</div>
        </div>
        
        <!-- Results -->
        <div class="export-results" id="exportResults" style="display:none;">
          <h3>Hasil Export</h3>
          <div class="results-list" id="resultsList"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Bind event handlers
   * @private
   */
  _bindEvents() {
    // Format selection
    const formatCards = this.container.querySelectorAll('.export-format-card');
    formatCards.forEach(card => {
      card.addEventListener('click', () => {
        formatCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
    
    // Navigate buttons
    const navButtons = this.container.querySelectorAll('[data-navigate]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const stage = btn.getAttribute('data-navigate');
        if (this.onNavigate) {
          this.onNavigate(stage);
        }
      });
    });
    
    // Export selected
    const btnExportSelected = this.container.querySelector('#btnExportSelected');
    btnExportSelected?.addEventListener('click', () => this._exportSelected());
    
    // Export all
    const btnExport = this.container.querySelector('#btnExport');
    btnExport?.addEventListener('click', () => this._exportAll());
  }
  
  /**
   * Export format yang dipilih
   * @private
   */
  async _exportSelected() {
    const selectedCard = this.container.querySelector('.export-format-card.selected');
    if (!selectedCard) {
      alert('Pilih minimal satu format export');
      return;
    }
    
    const format = selectedCard.getAttribute('data-format');
    const filename = this.container.querySelector('#exportFilename').value || 'audit-working-paper';
    const scale = parseInt(this.container.querySelector('#exportScale').value);
    
    this._showProgress();
    
    try {
      await this._doExport(format, filename, scale);
      this._showResult(format, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this._showResult(format, 'error', error.message);
    }
    
    this._hideProgress();
  }
  
  /**
   * Export semua format
   * @private
   */
  async _exportAll() {
    if (!this.data) {
      alert('Data belum dimuat');
      return;
    }
    
    const filename = this.container.querySelector('#exportFilename').value || 'audit-working-paper';
    const scale = parseInt(this.container.querySelector('#exportScale').value);
    
    this._showProgress();
    
    const formats = ['png', 'jpg', 'pdf', 'docx'];
    const results = {};
    
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      const progress = ((i + 1) / formats.length) * 100;
      this._updateProgress(progress, `Exporting ${format.toUpperCase()}...`);
      
      try {
        await this._doExport(format, filename, scale);
        results[format] = 'success';
      } catch (error) {
        console.error(`Export ${format} failed:`, error);
        results[format] = 'error';
      }
      
      // Delay sedikit agar progress terlihat
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    this._showResults(results);
    this._hideProgress();
  }
  
  /**
   * Do export untuk format tertentu
   * @private
   */
  async _doExport(format, filename, scale) {
    if (!this.data || !this.renderer) {
      throw new Error('Data or renderer not available');
    }
    
    switch (format) {
      case 'png':
        await this.exportManager.exportPng(
          { ...this.data, flowchartOptions: { ...this.data.flowchartOptions, scale } },
          this.renderer,
          `${filename}.png`
        );
        break;
        
      case 'jpg':
        await this.exportManager.exportJpg(
          { ...this.data, flowchartOptions: { ...this.data.flowchartOptions, scale } },
          this.renderer,
          `${filename}.jpg`
        );
        break;
        
      case 'pdf':
        await this.exportManager.exportPdf(
          this.data,
          this.renderer,
          `${filename}.html`
        );
        break;
        
      case 'docx':
        await this.exportManager.exportDocx(
          this.data,
          `${filename}.docx`
        );
        break;
        
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }
  
  /**
   * Show progress
   * @private
   */
  _showProgress() {
    const progress = this.container.querySelector('#exportProgress');
    progress.style.display = 'block';
    this._updateProgress(0, 'Memulai export...');
  }
  
  /**
   * Update progress
   * @private
   */
  _updateProgress(percent, text) {
    const fill = this.container.querySelector('#progressFill');
    const textEl = this.container.querySelector('#progressText');
    fill.style.width = `${percent}%`;
    textEl.textContent = text;
  }
  
  /**
   * Hide progress
   * @private
   */
  _hideProgress() {
    const progress = this.container.querySelector('#exportProgress');
    progress.style.display = 'none';
  }
  
  /**
   * Show result for single export
   * @private
   */
  _showResult(format, status, error) {
    const results = this.container.querySelector('#exportResults');
    const list = this.container.querySelector('#resultsList');
    results.style.display = 'block';
    
    const icon = status === 'success' ? '✅' : '❌';
    const ext = format === 'pdf' ? '.html' : `.${format}`;
    
    list.innerHTML += `
      <div class="result-item ${status}">
        <span>${icon} ${format.toUpperCase()} (${ext})</span>
        <span>${status === 'success' ? 'Berhasil' : 'Gagal'}</span>
        ${error ? `<span class="error-msg">${error}</span>` : ''}
      </div>
    `;
  }
  
  /**
   * Show all results
   * @private
   */
  _showResults(results) {
    const resultsEl = this.container.querySelector('#exportResults');
    const list = this.container.querySelector('#resultsList');
    resultsEl.style.display = 'block';
    list.innerHTML = '';
    
    Object.entries(results).forEach(([format, status]) => {
      this._showResult(format, status);
    });
  }
}
