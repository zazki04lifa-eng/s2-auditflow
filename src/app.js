/**
 * AuditFlow AI - Main Application
 * Integrasi semua modul dan komponen UI
 */

import { Storage } from './storage.js';
import { Dashboard, AiAssistant, InputForm, FlowchartViewer, ExportPanel, Settings } from './ui/index.js';
import { FlowchartRenderer } from './flowchart/renderer.js';
import { WcgwEngine } from './flowchart/wcgw-engine.js';
import { WorkingPaperGenerator } from './analysis/working-paper-generator.js';
import { ExportManager } from './export/export-manager.js';
import { aiService } from './ai/index.js';
import { parser } from './parser/index.js';

/**
 * Main Application Class
 */
class AuditFlowApp {
  constructor() {
    this.currentProject = null;
    this.currentStage = 'input';
    this.renderer = null;
    this.wcgwEngine = null;
    this.wpGenerator = null;
    this.exportManager = null;

    // UI Components
    this.dashboard = null;
    this.aiAssistant = null;
    this.inputForm = null;
    this.flowchartViewer = null;
    this.exportPanel = null;
    this.settings = null;

    this.init();
  }

  /**
   * Initialize application
   */
  init() {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup application components
   */
  setup() {
    console.log('🚀 AuditFlow AI initializing...');

    // Initialize core modules
    this.renderer = new FlowchartRenderer({ containerId: 'flowchart-container' });
    this.wcgwEngine = new WcgwEngine();
    this.wpGenerator = new WorkingPaperGenerator();
    this.exportManager = new ExportManager();

    // Setup header navigation
    this.setupNavigation();

    // Setup UI based on current state
    this.setupUI();

    // Show dashboard by default
    this.showView('dashboard');

    // Load current project if exists
    this.loadCurrentProject();

    console.log('✅ AuditFlow AI ready!');
  }

  /**
   * Setup header navigation
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = link.getAttribute('data-nav');

        // Update active state in sidebar
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Handle navigation
        switch (nav) {
          case 'dashboard':
            this.showView('dashboard');
            break;
          case 'new':
            this.createNewProject();
            this.showView('new-project');
            break;
          case 'projects':
            this.showView('projects');
            break;
          case 'settings':
            this.showSettings();
            this.showView('settings');
            break;
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
      });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }
  }

  /**
   * Show a specific view
   * @param {string} viewId - View identifier
   */
  showView(viewId) {
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.style.display = 'block';
      targetView.classList.add('active');
    }

    // Update topbar title
    const titles = {
      'dashboard': ['Dashboard', 'Ringkasan aktivitas audit planning kamu'],
      'new-project': ['New Project', 'Buat project audit baru'],
      'projects': ['My Projects', 'Kelola project audit kamu'],
      'workspace': ['Workspace', 'Edit project aktif'],
      'settings': ['Settings', 'Konfigurasi aplikasi'],
      'export': ['Export', 'Ekspor hasil audit']
    };

    const [title, sub] = titles[viewId] || ['Dashboard', ''];
    const topbarTitle = document.getElementById('topbarTitle');
    const topbarSub = document.getElementById('topbarSub');
    if (topbarTitle) topbarTitle.textContent = title;
    if (topbarSub) topbarSub.textContent = sub;

    console.log(`📍 View shown: ${viewId}`);
  }

  /**
   * Setup UI components
   */
  setupUI() {
    // Dashboard
    const dashboardContainer = document.getElementById('dashboard-container');
    if (dashboardContainer) {
      this.dashboard = new Dashboard(dashboardContainer, {
        onNewProject: (preset) => this.createNewProject(preset),
        onOpenProject: (project) => this.openProject(project),
        onContinue: (project) => this.continueProject(project)
      });
    }

    // AI Assistant
    const aiContainer = document.getElementById('ai-assistant-container');
    if (aiContainer) {
      this.aiAssistant = new AiAssistant(aiContainer);
    }

    // Input Form
    const inputContainer = document.getElementById('input-container');
    if (inputContainer) {
      this.inputForm = new InputForm({
        containerId: 'input-container',
        onSubmit: (text) => this.handleInputSubmit(text)
      });
    }

    // Flowchart Viewer
    const flowchartContainer = document.getElementById('flowchart-container');
    if (flowchartContainer) {
      this.flowchartViewer = new FlowchartViewer({
        containerId: 'flowchart-container',
        defaultOrientation: 'vertical',
        showWcgw: true
      });
    }

    // Export Panel
    const exportContainer = document.getElementById('export-container');
    if (exportContainer) {
      this.exportPanel = new ExportPanel(exportContainer, {
        renderer: this.renderer,
        onNavigate: (stage) => this.navigateToStage(stage)
      });
    }

    // Settings
    const settingsContainer = document.getElementById('settings-container');
    if (settingsContainer) {
      this.settings = new Settings({
        containerId: 'settings-container',
        onSave: (settings) => this.handleSettingsSave(settings)
      });
    }
  }

  /**
   * Show settings page
   */
  showSettings() {
    this.hideAllStages();
    const settingsContainer = document.getElementById('settings-container');
    if (settingsContainer) {
      settingsContainer.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('[data-nav]').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-nav="settings"]').classList.add('active');
  }

  /**
   * Handle settings save
   */
  handleSettingsSave(settings) {
    console.log('Settings saved:', settings);

    // Reload AI service config
    aiService.loadConfig();

    // Update AI assistant if exists
    if (this.aiAssistant) {
      this.aiAssistant.updateConfig(settings);
    }
  }

  /**
   * Load current project from storage
   */
  loadCurrentProject() {
    const currentId = Storage.getCurrentProjectId();
    if (currentId) {
      const project = Storage.getProject(currentId);
      if (project) {
        this.currentProject = project;
        this.currentStage = project.stage;
      }
    }
  }

  /**
   * Create new project
   * @param {Object} preset - Preset data (name, industry, description)
   */
  createNewProject(preset = {}) {
    const project = {
      id: `project_${Date.now()}`,
      name: preset.name || 'New Project',
      industry: preset.industry || 'General',
      stage: 'input',
      data: {
        description: preset.description || ''
      }
    };

    Storage.saveProject(project);
    Storage.setCurrentProjectId(project.id);

    this.currentProject = project;
    this.currentStage = 'input';

    this.navigateToStage('input');

    // Pre-fill input if preset description exists
    if (preset.description && this.inputForm) {
      this.inputForm.setText(preset.description);
    }
  }

  /**
   * Open existing project
   * @param {Object} project
   */
  openProject(project) {
    this.currentProject = project;
    this.currentStage = project.stage;
    Storage.setCurrentProjectId(project.id);

    this.navigateToStage(project.stage);
  }

  /**
   * Continue project
   * @param {Object} project
   */
  continueProject(project) {
    this.openProject(project);
  }

  /**
   * Navigate to stage
   * @param {string} stage
   */
  /**
   * Hide all stage containers
   * @private
   */
  hideAllStages() {
    document.querySelectorAll('.stage-container').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
  }

  navigateToStage(stage) {
    this.currentStage = stage;

    // Hide all stage containers
    this.hideAllStages();

    // Show appropriate container
    const stageMap = {
      input: 'input-container',
      flowchart: 'flowchart-container',
      analysis: 'analysis-container',
      review: 'export-container',
      dashboard: 'dashboard-container',
      settings: 'settings-container'
    };

    const containerId = stageMap[stage];
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'block';
      container.classList.add('active');
    }

    // Update project stage
    if (this.currentProject) {
      this.currentProject.stage = stage;
      Storage.saveProject(this.currentProject);
    }

    // Refresh dashboard if visible
    if (this.dashboard) {
      this.dashboard.refresh();
    }

    console.log(`📍 Navigated to stage: ${stage}`);
  }

  /**
   * Handle input form submission
   * @param {Object} data - Form data with sourceInput and parsed
   */
  async handleInputSubmit(data) {
    if (!this.currentProject) return;

    const { sourceInput, parsed } = data;

    // Save input to project
    this.currentProject.data.company = sourceInput.company;
    this.currentProject.data.industry = sourceInput.industry;
    this.currentProject.data.cycle = sourceInput.cycle;
    this.currentProject.data.description = sourceInput.rawText;
    this.currentProject.data.sourceType = sourceInput.type;

    Storage.saveProject(this.currentProject);

    // Parse and generate flowchart
    const flowchartData = await this.generateFlowchart(sourceInput.rawText, {
      company: sourceInput.company,
      industry: sourceInput.industry,
      cycle: sourceInput.cycle
    });

    // Save flowchart
    this.currentProject.data.flowchart = flowchartData;
    this.currentProject.stage = 'flowchart';
    Storage.saveProject(this.currentProject);

    // Navigate to flowchart stage
    this.navigateToStage('flowchart');

    // Render flowchart
    if (this.flowchartViewer) {
      this.flowchartViewer.renderFlowchart(flowchartData, sourceInput.rawText);
    }

    console.log('✅ Project saved with company:', sourceInput.company, 'cycle:', sourceInput.cycle);
  }

  /**
   * Generate flowchart from text using parser
   * @param {string} text - Business process narrative
   * @param {Object} context - Company context (company, industry, cycle)
   * @returns {Object} Flowchart data with lanes, nodes, edges
   */
  async generateFlowchart(text, context = {}) {
    // Use parser to extract steps from narrative
    const parsed = parser.parse(text);

    // Actor detection patterns - common departments/divisions in Indonesian business context
    const actorPatterns = [
      /\b(Sales|Penjualan|Marketing|Pemasaran)\b/gi,
      /\b(Warehouse|Gudang|Logistik|Inventory)\b/gi,
      /\b(Finance|Keuangan|Accounting|Akuntansi)\b/gi,
      /\b(Procurement|Pembelian|Purchasing)\b/gi,
      /\b(Production|Produksi|Manufacturing|Manufaktur)\b/gi,
      /\b(HR|HRD|Human Resources|Sumber Daya Manusia)\b/gi,
      /\b(IT|Teknologi Informasi|Sistem Informasi)\b/gi,
      /\b(Legal|Hukum|Compliance)\b/gi,
      /\b(Customer|Pelanggan|Nasabah|Klien)\b/gi,
      /\b(Supplier|Vendor|Pemasok)\b/gi,
      /\b(Management|Manajemen|Direksi)\b/gi,
      /\b(Audit|Internal Audit|Auditor)\b/gi,
      /\b(Quality Control|QC|QA|Quality Assurance)\b/gi,
      /\b(Receiving|Penerimaan|Receiving)\b/gi,
      /\b(Shipping|Pengiriman|Expedisi)\b/gi,
      /\b(PIC|Petugas|Staf|Karyawan|Manager|Supervisor)\b/gi
    ];

    // Function to detect actor from step text
    const detectActor = (stepText) => {
      const text = stepText.toLowerCase();
      for (const pattern of actorPatterns) {
        const match = text.match(pattern);
        if (match && match.length > 0) {
          // Return the first matched actor, normalized
          return match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
        }
      }
      return null;
    };

    // Extract unique actors/departments for lanes from parsed steps
    const actors = new Set();
    const stepActorMap = []; // Map each step to its detected actor

    parsed.steps.forEach(stepText => {
      const actor = detectActor(stepText);
      stepActorMap.push(actor);
      if (actor && actor !== 'PIC' && actor !== 'Petugas') {
        actors.add(actor);
      }
    });

    // If no actors found, use cycle-based default lanes
    let lanes = [];
    if (actors.size > 0) {
      let order = 0;
      actors.forEach(actor => {
        lanes.push({
          id: `lane_${order}`,
          name: actor,
          order: order++
        });
      });
    } else {
      // Default lanes based on cycle type
      const defaultLanes = this.getDefaultLanesForCycle(context.cycle);
      lanes = defaultLanes;
    }

    // Create actor to lane mapping
    const actorToLane = new Map();
    lanes.forEach((lane, index) => {
      actorToLane.set(lane.name, lane.id);
    });

    // Generate nodes from parsed steps
    const nodes = parsed.steps.map((stepText, index) => {
      // Determine node type based on position and content
      let type = 'process';
      const textLower = stepText.toLowerCase();

      if (index === 0) {
        type = 'start';
      } else if (index === parsed.steps.length - 1) {
        type = 'terminator';
      } else if (textLower.includes('jika') || textLower.includes('apakah') || textLower.includes('decision') || textLower.includes('memutuskan')) {
        type = 'decision';
      } else if (textLower.includes('dokumen') || textLower.includes('formulir') || textLower.includes('laporan') || textLower.includes('invoice') || textLower.includes('purchase order')) {
        type = 'document';
      }

      // Determine lane for this node
      let laneId = lanes[0].id; // Default to first lane
      const stepActor = stepActorMap[index];
      if (stepActor && actorToLane.has(stepActor)) {
        laneId = actorToLane.get(stepActor);
      }

      // Truncate label for display
      const label = stepText.length > 30 ? stepText.substring(0, 30) + '...' : stepText;

      return {
        id: `node_${index}`,
        type: type,
        label: label,
        laneId: laneId,
        actor: stepActor,
        originalText: stepText
      };
    });

    // Generate edges (connect nodes in sequence)
    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];

      // Add label for decision branches
      let label = null;
      if (sourceNode.type === 'decision') {
        label = targetNode.laneId === sourceNode.laneId ? 'Ya' : 'Tidak';
      }

      edges.push({
        id: `edge_${i}`,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        label: label
      });
    }

    return { lanes, nodes, edges };
  }

  /**
   * Get default lanes for cycle type
   * @param {string} cycle
   * @returns {Array}
   */
  getDefaultLanesForCycle(cycle) {
    const cycleLanes = {
      'pendapatan': [
        { id: 'lane_0', name: 'Sales', order: 0 },
        { id: 'lane_1', name: 'Warehouse', order: 1 },
        { id: 'lane_2', name: 'Finance', order: 2 },
        { id: 'lane_3', name: 'Customer', order: 3 }
      ],
      'pengeluaran': [
        { id: 'lane_0', name: 'Procurement', order: 0 },
        { id: 'lane_1', name: 'Finance', order: 1 },
        { id: 'lane_2', name: 'Warehouse', order: 2 },
        { id: 'lane_3', name: 'Supplier', order: 3 }
      ],
      'produksi': [
        { id: 'lane_0', name: 'Planning', order: 0 },
        { id: 'lane_1', name: 'Production', order: 1 },
        { id: 'lane_2', name: 'Quality Control', order: 2 },
        { id: 'lane_3', name: 'Warehouse', order: 3 }
      ],
      'payroll': [
        { id: 'lane_0', name: 'HR', order: 0 },
        { id: 'lane_1', name: 'Finance', order: 1 },
        { id: 'lane_2', name: 'Employee', order: 2 }
      ],
      'inventory': [
        { id: 'lane_0', name: 'Warehouse', order: 0 },
        { id: 'lane_1', name: 'Procurement', order: 1 },
        { id: 'lane_2', name: 'Finance', order: 2 }
      ]
    };

    return cycleLanes[cycle] || [
      { id: 'lane_0', name: 'Department A', order: 0 },
      { id: 'lane_1', name: 'Department B', order: 1 }
    ];
  }

  /**
   * Run analysis on current project
   */
  async runAnalysis() {
    if (!this.currentProject?.data?.flowchart) return;

    const flowchartData = this.currentProject.data.flowchart;

    // Analyze WCGW
    const wcgwEntries = this.wcgwEngine.analyzeFlowchart(flowchartData);

    // Generate working paper
    const workingPaper = this.wpGenerator.generate({
      projectName: this.currentProject.name,
      industry: this.currentProject.industry,
      flowchartData: flowchartData,
      wcgwEntries: wcgwEntries
    });

    // Save to project
    this.currentProject.data.wcgw = wcgwEntries;
    this.currentProject.data.workingPaper = workingPaper;
    this.currentProject.stage = 'review';
    Storage.saveProject(this.currentProject);

    return { wcgwEntries, workingPaper };
  }
}

// Initialize app
const app = new AuditFlowApp();

// Export for global access if needed
window.AuditFlowApp = app;
