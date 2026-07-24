/**
 * AuditFlow AI - Storage Module
 * LocalStorage-based persistence for projects and settings
 */

const STORAGE_KEYS = {
  PROJECTS: 'auditflow_projects',
  SETTINGS: 'auditflow_settings',
  KNOWLEDGE_BASE: 'auditflow_kb',
  CURRENT_PROJECT: 'auditflow_current'
};

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} industry
 * @property {'input' | 'flowchart' | 'analysis' | 'review'} stage
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {Object} [data]
 */

export class Storage {
  /**
   * Get all projects
   * @returns {Project[]}
   */
  static getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save project
   * @param {Project} project
   */
  static saveProject(project) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    project.updatedAt = Date.now();
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push({
        ...project,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  /**
   * Get project by ID
   * @param {string} id
   * @returns {Project|null}
   */
  static getProject(id) {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  /**
   * Delete project
   * @param {string} id
   */
  static deleteProject(id) {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  }

  /**
   * Get current project ID
   * @returns {string|null}
   */
  static getCurrentProjectId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  }

  /**
   * Set current project ID
   * @param {string} id
   */
  static setCurrentProjectId(id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, id);
  }

  /**
   * Get settings
   * @returns {Object}
   */
  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.defaultSettings();
    } catch {
      return this.defaultSettings();
    }
  }

  /**
   * Save settings
   * @param {Object} settings
   */
  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Default settings
   * @returns {Object}
   */
  static defaultSettings() {
    return {
      aiProvider: 'none',
      apiKey: '',
      showAiAssistant: true,
      theme: 'light'
    };
  }

  /**
   * Get knowledge base entries
   * @returns {Array}
   */
  static getKnowledgeBase() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save knowledge base entry
   * @param {Object} entry
   */
  static saveKnowledgeBaseEntry(entry) {
    const kb = this.getKnowledgeBase();
    const index = kb.findIndex(e => e.id === entry.id);
    
    if (index >= 0) {
      kb[index] = entry;
    } else {
      kb.push({
        ...entry,
        id: entry.id || `kb_${Date.now()}`,
        verified: false,
        createdAt: Date.now()
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(kb));
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  static getStats() {
    const projects = this.getProjects();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    return {
      total: projects.length,
      active: projects.filter(p => p.stage !== 'review').length,
      completed: projects.filter(p => p.stage === 'review').length,
      thisWeek: projects.filter(p => now - p.createdAt < 7 * dayMs).length
    };
  }

  /**
   * Clear all data
   */
  static clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
