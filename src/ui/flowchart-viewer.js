/**
 * AuditFlow AI - Flowchart Viewer UI Component
 * Viewer dengan toggle orientation dan WCGW display
 */

import { SwimlaneRenderer } from '../flowchart/swimlane-renderer.js';
import { wcgwEngine } from '../flowchart/wcgw-engine.js';

/**
 * @typedef {Object} FlowchartViewerConfig
 * @property {string} containerId
 * @property {'vertical' | 'horizontal'} [defaultOrientation]
 * @property {boolean} [showWcgw]
 */

class FlowchartViewer {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.orientation = config.defaultOrientation || 'vertical';
    this.showWcgw = config.showWcgw !== false;

    this.renderer = null;
    this.swimlaneRenderer = null;
    this.currentData = null;
    this.currentWcgw = [];

    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="flowchart-viewer">
        <div class="flowchart-header">
          <h3>📊 Flowchart Proses</h3>
          <div class="flowchart-controls">
            <div class="control-group">
              <span class="control-label">Orientasi:</span>
              <button class="toggle-btn active" data-orientation="vertical">Vertikal</button>
              <button class="toggle-btn" data-orientation="horizontal">Horizontal</button>
            </div>
            <div class="control-group">
              <span class="control-label">WCGW:</span>
              <button class="toggle-btn active" data-wcgw="true">On</button>
              <button class="toggle-btn" data-wcgw="false">Off</button>
            </div>
          </div>
        </div>
        
        <div class="flowchart-body" id="flowchart-body">
          <div class="flowchart-empty">
            <div class="flowchart-empty-icon">📋</div>
            <p>Belum ada flowchart. Submit input terlebih dahulu.</p>
          </div>
        </div>
        
        <div class="wcgw-stats" id="wcgw-stats" style="display: none;">
          <h4>⚠️ WCGW Summary</h4>
          <div class="stats-grid" id="wcgw-stats-grid"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Orientation toggles
    this.container.querySelectorAll('[data-orientation]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orientation = e.target.dataset.orientation;
        this.setOrientation(orientation);

        // Update active state
        this.container.querySelectorAll('[data-orientation]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // WCGW toggles
    this.container.querySelectorAll('[data-wcgw]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const show = e.target.dataset.wcgw === 'true';
        this.showWcgw = show;

        // Update active state
        this.container.querySelectorAll('[data-wcgw]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Re-render if data exists
        if (this.currentData) {
          this.renderFlowchart(this.currentData, this.currentWcgw);
        }
      });
    });
  }

  /**
   * Set orientation
   * @param {'vertical' | 'horizontal'} orientation
   */
  setOrientation(orientation) {
    this.orientation = orientation;
    if (this.swimlaneRenderer && this.currentData) {
      this.swimlaneRenderer.setOrientation(orientation);
    }
  }

  /**
   * Render flowchart from flowchartData
   * @param {import('../types/index.js').FlowchartData} data
   * @param {string} [context] - Process description for WCGW analysis
   */
  renderFlowchart(data, context = '') {
    if (!data || !data.nodes || data.nodes.length === 0) {
      console.warn('No flowchart data to render');
      return;
    }

    this.currentData = data;

    // Initialize swimlane renderer (enhanced version)
    if (!this.swimlaneRenderer) {
      this.swimlaneRenderer = new SwimlaneRenderer({
        containerId: 'flowchart-body',
        orientation: this.orientation,
        showWcgw: this.showWcgw,
        laneWidth: 220,
        nodeSpacing: 90
      });
    }

    // Analyze WCGW
    this.currentWcgw = wcgwEngine.analyzeFlowchart(data, context);

    // Render with swimlane renderer
    this.swimlaneRenderer.render(data, this.showWcgw ? this.currentWcgw : []);

    // Update stats
    this.updateWcgwStats();

    console.log('✅ Swimlane flowchart rendered:', data.nodes.length, 'nodes,', data.lanes.length, 'lanes');
  }

  /**
   * Update WCGW statistics panel
   */
  updateWcgwStats() {
    const statsEl = document.getElementById('wcgw-stats');
    const gridEl = document.getElementById('wcgw-stats-grid');

    if (!statsEl || !gridEl || this.currentWcgw.length === 0) {
      if (statsEl) statsEl.style.display = 'none';
      return;
    }

    const stats = wcgwEngine.getStatistics(this.currentWcgw);

    statsEl.style.display = 'block';
    gridEl.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total WCGW</div>
      </div>
      <div class="stat-item critical">
        <div class="stat-value">${stats.byRiskLevel.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-item high">
        <div class="stat-value">${stats.byRiskLevel.high}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-item medium">
        <div class="stat-value">${stats.byRiskLevel.medium}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-item low">
        <div class="stat-value">${stats.byRiskLevel.low}</div>
        <div class="stat-label">Low</div>
      </div>
    `;
  }

  /**
   * Clear flowchart
   */
  clear() {
    this.currentData = null;
    this.currentWcgw = [];

    const body = document.getElementById('flowchart-body');
    if (body) {
      body.innerHTML = `
        <div class="flowchart-empty">
          <div class="flowchart-empty-icon">📋</div>
          <p>Belum ada flowchart. Submit input terlebih dahulu.</p>
        </div>
      `;
    }

    const stats = document.getElementById('wcgw-stats');
    if (stats) stats.style.display = 'none';

    if (this.swimlaneRenderer) {
      this.swimlaneRenderer.clear();
      this.swimlaneRenderer = null;
    }
  }
}

export { FlowchartViewer };
