/**
 * AuditFlow AI - Dashboard Component
 * Clean, intuitive dashboard for project management
 */

import { Storage } from '../storage.js';

/**
 * @typedef {import('../types/index.js').Project} Project
 */

export class Dashboard {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} [options.onNewProject] - Callback saat buat project baru
   * @param {Function} [options.onOpenProject] - Callback saat buka project
   * @param {Function} [options.onContinue] - Callback saat continue project
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onNewProject = options.onNewProject;
    this.onOpenProject = options.onOpenProject;
    this.onContinue = options.onContinue;
    
    this._render();
    this._bindEvents();
    this._loadData();
  }
  
  /**
   * Render dashboard
   * @private
   */
  _render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <!-- Hero Section -->
        <section class="dashboard-hero">
          <div class="hero-content">
            <h1 class="hero-title">AuditFlow AI</h1>
            <p class="hero-subtitle">Asisten Audit Planning berbasis AI — identifikasi risiko, petakan kontrol, dan hasilkan working paper dalam hitungan menit.</p>
            <button class="btn btn-primary btn-lg" id="btnNewProject">
              <span class="btn-icon">+</span>
              Buat Project Baru
            </button>
          </div>
          <div class="hero-illustration">
            <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="160" height="120" rx="12" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
              <rect x="40" y="40" width="40" height="24" rx="4" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
              <rect x="120" y="40" width="40" height="24" rx="4" fill="#FED7AA" stroke="#F97316" stroke-width="1.5"/>
              <rect x="40" y="80" width="40" height="24" rx="4" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/>
              <rect x="120" y="80" width="40" height="24" rx="4" fill="#FEF3C7" stroke="#EAB308" stroke-width="1.5"/>
              <path d="M80 52 H120" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 2"/>
              <path d="M60 64 V80" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 2"/>
              <path d="M140 64 V80" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 2"/>
              <circle cx="100" cy="100" r="20" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
              <text x="100" y="105" text-anchor="middle" font-size="16" fill="#6366F1">AI</text>
            </svg>
          </div>
        </section>
        
        <!-- Stats Cards -->
        <section class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-icon stat-icon-total">📊</div>
            <div class="stat-content">
              <div class="stat-value" id="statTotal">0</div>
              <div class="stat-label">Total Project</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-active">⚡</div>
            <div class="stat-content">
              <div class="stat-value" id="statActive">0</div>
              <div class="stat-label">Sedang Berjalan</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-completed">✅</div>
            <div class="stat-content">
              <div class="stat-value" id="statCompleted">0</div>
              <div class="stat-label">Sudah Selesai</div>
            </div>
          </div>
        </section>
        
        <!-- Continue Last Project -->
        <section class="dashboard-continue" id="continueSection" style="display:none;">
          <div class="continue-card">
            <div class="continue-header">
              <span class="continue-badge">Lanjutkan</span>
              <span class="continue-stage" id="continueStage">Stage 1</span>
            </div>
            <h3 id="continueProjectName">Project Name</h3>
            <p class="continue-meta" id="continueMeta">Updated 2 hours ago</p>
            <button class="btn btn-primary" id="btnContinue">
              Lanjutkan Project
            </button>
          </div>
        </section>
        
        <!-- Projects List -->
        <section class="dashboard-projects">
          <div class="section-header">
            <h2>Project Saya</h2>
            <div class="section-actions">
              <span class="project-count" id="projectCount">0 project</span>
              <button class="btn btn-ghost btn-sm text-danger" id="btnClearAll" title="Hapus semua project" style="display:none;">
                🗑️ Clear All
              </button>
            </div>
          </div>
          
          <div class="projects-list" id="projectsList">
            <!-- Projects will be rendered here -->
          </div>
          
          <div class="projects-empty" id="projectsEmpty" style="display:none;">
            <div class="empty-icon">📁</div>
            <h3>Belum ada project</h3>
            <p>Mulai dengan membuat project audit pertama Anda.</p>
            <button class="btn btn-secondary" id="btnNewProjectEmpty">
              Buat Project Pertama
            </button>
          </div>
        </section>
        
        <!-- Onboarding (shown only when no projects) -->
        <section class="dashboard-onboarding" id="onboardingSection" style="display:none;">
          <h2>Cara Menggunakan AuditFlow AI</h2>
          <div class="onboarding-steps">
            <div class="onboarding-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Input Deskripsi Proses</h4>
                <p>Tulis atau upload dokumen yang menjelaskan proses bisnis yang akan diaudit.</p>
              </div>
            </div>
            <div class="onboarding-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Generate Flowchart</h4>
                <p>Sistem akan membuat flowchart dengan swimlanes secara otomatis.</p>
              </div>
            </div>
            <div class="onboarding-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Analisis Risiko (WCGW)</h4>
                <p>Identifikasi What Could Go Wrong dan evaluasi kontrol yang ada.</p>
              </div>
            </div>
            <div class="onboarding-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Export Working Paper</h4>
                <p>Hasilkan working paper lengkap dalam format PDF atau DOCX.</p>
              </div>
            </div>
          </div>
          
          <!-- Example Case -->
          <div class="onboarding-example">
            <h4>Contoh: PT Mayora - Proses Order to Cash</h4>
            <div class="example-text">
              <p>"Proses dimulai ketika sales menerima purchase order dari customer. Sales input order ke sistem dan cek ketersediaan stok. Jika stok tersedia, finance menerbitkan invoice dan mengirim barang. Jika tidak tersedia, production menjadwalkan pembuatan barang terlebih dahulu. Setelah barang dikirim, finance mencatat pembayaran dan menutup order."</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btnTryExample">
              Coba Contoh Ini
            </button>
          </div>
        </section>
      </div>
    `;
  }
  
  /**
   * Bind event handlers
   * @private
   */
  _bindEvents() {
    // New project buttons
    this.container.querySelector('#btnNewProject')?.addEventListener('click', () => {
      if (this.onNewProject) this.onNewProject();
    });
    
    this.container.querySelector('#btnNewProjectEmpty')?.addEventListener('click', () => {
      if (this.onNewProject) this.onNewProject();
    });
    
    // Continue button
    this.container.querySelector('#btnContinue')?.addEventListener('click', () => {
      const currentId = Storage.getCurrentProjectId();
      if (currentId && this.onContinue) {
        const project = Storage.getProject(currentId);
        if (project) this.onContinue(project);
      }
    });
    
    // Try example button
    this.container.querySelector('#btnTryExample')?.addEventListener('click', () => {
      if (this.onNewProject) {
        this.onNewProject({
          name: 'PT Mayora - Order to Cash',
          industry: 'Manufacturing',
          description: 'Proses dimulai ketika sales menerima purchase order dari customer. Sales input order ke sistem dan cek ketersediaan stok. Jika stok tersedia, finance menerbitkan invoice dan mengirim barang. Jika tidak tersedia, production menjadwalkan pembuatan barang terlebih dahulu. Setelah barang dikirim, finance mencatat pembayaran dan menutup order.'
        });
      }
    });
    
    // Clear all projects button
    this.container.querySelector('#btnClearAll')?.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus SEMUA project? Tindakan ini tidak dapat dibatalkan.')) {
        // Clear all projects from localStorage
        localStorage.removeItem('auditflow_projects');
        localStorage.removeItem('auditflow_current');
        
        // Refresh dashboard
        this._loadData();
        
        console.log('✅ All projects cleared');
      }
    });
  }
  
  /**
   * Load and render data
   * @private
   */
  _loadData() {
    const stats = Storage.getStats();
    const projects = Storage.getProjects();
    const currentProjectId = Storage.getCurrentProjectId();
    
    // Update stats
    this.container.querySelector('#statTotal').textContent = stats.total;
    this.container.querySelector('#statActive').textContent = stats.active;
    this.container.querySelector('#statCompleted').textContent = stats.completed;
    
    // Continue section
    if (currentProjectId) {
      const project = Storage.getProject(currentProjectId);
      if (project && project.stage !== 'review') {
        this.container.querySelector('#continueSection').style.display = 'block';
        this.container.querySelector('#continueProjectName').textContent = project.name;
        this.container.querySelector('#continueStage').textContent = this._getStageLabel(project.stage);
        this.container.querySelector('#continueMeta').textContent = this._timeAgo(project.updatedAt);
      }
    }
    
    // Projects list
    this.container.querySelector('#projectCount').textContent = `${projects.length} project`;
    
    // Show/hide clear all button based on project count
    const clearAllBtn = this.container.querySelector('#btnClearAll');
    if (clearAllBtn) {
      clearAllBtn.style.display = projects.length > 0 ? 'inline-flex' : 'none';
    }
    
    if (projects.length === 0) {
      this.container.querySelector('#projectsEmpty').style.display = 'block';
      this.container.querySelector('#projectsList').style.display = 'none';
      this.container.querySelector('#onboardingSection').style.display = 'block';
    } else {
      this.container.querySelector('#projectsEmpty').style.display = 'none';
      this.container.querySelector('#projectsList').style.display = 'flex';
      this._renderProjects(projects);
    }
  }
  
  /**
   * Render projects list
   * @param {Project[]} projects
   * @private
   */
  _renderProjects(projects) {
    const list = this.container.querySelector('#projectsList');
    
    // Sort by updated_at descending
    const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
    
    list.innerHTML = sorted.map(project => `
      <div class="project-card" data-id="${project.id}">
        <div class="project-header">
          <h3 class="project-name">${project.name}</h3>
          <span class="project-stage project-stage-${project.stage}">
            ${this._getStageLabel(project.stage)}
          </span>
        </div>
        <div class="project-meta">
          <span class="project-industry">${project.industry}</span>
          <span class="project-date">${this._timeAgo(project.updatedAt)}</span>
        </div>
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this._getProgressPercent(project.stage)}%"></div>
          </div>
          <span class="progress-label">${this._getProgressPercent(project.stage)}%</span>
        </div>
        <div class="project-actions">
          <button class="btn btn-sm btn-primary" data-action="continue" data-id="${project.id}">
            Lanjutkan
          </button>
          <button class="btn btn-sm btn-ghost" data-action="delete" data-id="${project.id}">
            Hapus
          </button>
        </div>
      </div>
    `).join('');
    
    // Bind project card events
    list.querySelectorAll('[data-action="continue"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projectId = btn.getAttribute('data-id');
        const project = Storage.getProject(projectId);
        if (project && this.onContinue) {
          Storage.setCurrentProjectId(projectId);
          this.onContinue(project);
        }
      });
    });
    
    list.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projectId = btn.getAttribute('data-id');
        if (confirm('Hapus project ini?')) {
          Storage.deleteProject(projectId);
          this.refresh();
        }
      });
    });
  }
  
  /**
   * Get stage label
   * @param {string} stage
   * @returns {string}
   * @private
   */
  _getStageLabel(stage) {
    const labels = {
      input: 'Input',
      flowchart: 'Flowchart',
      analysis: 'Analisis',
      review: 'Selesai'
    };
    return labels[stage] || stage;
  }
  
  /**
   * Get progress percentage
   * @param {string} stage
   * @returns {number}
   * @private
   */
  _getProgressPercent(stage) {
    const percents = {
      input: 25,
      flowchart: 50,
      analysis: 75,
      review: 100
    };
    return percents[stage] || 0;
  }
  
  /**
   * Time ago helper
   * @param {number} timestamp
   * @returns {string}
   * @private
   */
  _timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari yang lalu`;
    
    return new Date(timestamp).toLocaleDateString('id-ID');
  }
  
  /**
   * Refresh dashboard data
   */
  refresh() {
    this._loadData();
  }
}
