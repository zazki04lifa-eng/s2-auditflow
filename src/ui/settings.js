/**
 * AuditFlow AI - Settings UI Component
 * Halaman konfigurasi API Key dan preferensi AI
 */

import { Storage } from '../storage.js';
import { AIService } from '../ai/ai-service.js';
import './settings.css';

/**
 * @typedef {Object} SettingsConfig
 * @property {string} containerId - ID container HTML
 * @property {Function} [onSave] - Callback saat settings disimpan
 */

export class Settings {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.onSave = config.onSave || (() => { });

    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }

    this.render();
    this.bindEvents();
    this.loadCurrentSettings();
  }

  render() {
    const providers = AIService.getAvailableProviders();

    this.container.innerHTML = `
      <div class="settings-container">
        <div class="settings-header">
          <h2>⚙️ Settings</h2>
          <p>Konfigurasi AI Provider dan preferensi aplikasi</p>
        </div>

        <div class="settings-body">
          <!-- AI Provider Section -->
          <section class="settings-section">
            <h3>AI Provider</h3>
            <p class="section-description">
              Pilih provider AI untuk analisis audit yang lebih cerdas. 
              Jika tidak dipilih, sistem akan menggunakan rule-based engine.
            </p>

            <div class="provider-selector">
              <div class="form-group">
                <label for="ai-provider">Provider</label>
                <select id="ai-provider" class="form-select">
                  <option value="none">Tidak menggunakan AI (Rule-based only)</option>
                  ${providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
              </div>

              <!-- Model Selector (dynamic based on provider) -->
              <div class="form-group" id="model-group" style="display: none;">
                <label for="ai-model">Model</label>
                <select id="ai-model" class="form-select">
                  <!-- Options will be populated dynamically -->
                </select>
              </div>

              <!-- API Key Input -->
              <div class="form-group" id="api-key-group" style="display: none;">
                <label for="api-key">
                  API Key
                  <span class="label-hint">Required</span>
                </label>
                <div class="api-key-input">
                  <input 
                    type="password" 
                    id="api-key" 
                    class="form-input" 
                    placeholder="Enter your API key..."
                    autocomplete="off"
                  />
                  <button class="btn-toggle-visibility" id="toggle-api-key" type="button">
                    👁️
                  </button>
                </div>
                <p class="api-key-hint" id="api-key-hint"></p>
              </div>

              <!-- Connection Test -->
              <div class="form-group" id="test-connection-group" style="display: none;">
                <button class="btn btn-secondary" id="test-connection">
                  🧪 Test Connection
                </button>
                <div class="test-result" id="test-result"></div>
              </div>
            </div>
          </section>

          <!-- Security Notice -->
          <section class="settings-section security-notice">
            <div class="notice-icon">🔒</div>
            <div class="notice-content">
              <h4>Security & Privacy</h4>
              <p>
                API Key disimpan secara lokal di browser Anda (localStorage) dan tidak pernah 
                dikirim ke server kami. Data audit Anda juga tetap tersimpan di perangkat Anda.
              </p>
            </div>
          </section>

          <!-- Display Settings -->
          <section class="settings-section">
            <h3>Display Preferences</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-ai-assistant" checked>
                <span>Show AI Assistant panel</span>
              </label>
            </div>
          </section>

          <!-- Save Button -->
          <div class="settings-actions">
            <button class="btn btn-primary" id="save-settings">
              💾 Save Settings
            </button>
            <button class="btn btn-danger" id="clear-api-key">
              🗑️ Clear API Key
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Provider selector
    const providerSelect = document.getElementById('ai-provider');
    providerSelect.addEventListener('change', () => this.onProviderChange());

    // Toggle API key visibility
    const toggleBtn = document.getElementById('toggle-api-key');
    toggleBtn.addEventListener('click', () => this.toggleApiKeyVisibility());

    // Test connection
    const testBtn = document.getElementById('test-connection');
    testBtn.addEventListener('click', () => this.testConnection());

    // Save settings
    const saveBtn = document.getElementById('save-settings');
    saveBtn.addEventListener('click', () => this.saveSettings());

    // Clear API key
    const clearBtn = document.getElementById('clear-api-key');
    clearBtn.addEventListener('click', () => this.clearApiKey());
  }

  loadCurrentSettings() {
    const settings = Storage.getSettings();

    // Set provider
    document.getElementById('ai-provider').value = settings.aiProvider || 'none';

    // Set API key (masked)
    document.getElementById('api-key').value = settings.apiKey || '';

    // Set AI assistant visibility
    document.getElementById('show-ai-assistant').checked = settings.showAiAssistant !== false;

    // Update UI based on current provider
    this.onProviderChange();
  }

  onProviderChange() {
    const provider = document.getElementById('ai-provider').value;
    const modelGroup = document.getElementById('model-group');
    const apiKeyGroup = document.getElementById('api-key-group');
    const testGroup = document.getElementById('test-connection-group');
    const modelSelect = document.getElementById('ai-model');
    const hint = document.getElementById('api-key-hint');

    // Show/hide sections based on provider
    const hasProvider = provider !== 'none';
    modelGroup.style.display = hasProvider ? 'block' : 'none';
    apiKeyGroup.style.display = hasProvider ? 'block' : 'none';
    testGroup.style.display = hasProvider ? 'block' : 'none';

    if (hasProvider) {
      // Populate models
      const providers = AIService.getAvailableProviders();
      const selectedProvider = providers.find(p => p.id === provider);

      if (selectedProvider) {
        modelSelect.innerHTML = selectedProvider.models
          .map(m => `<option value="${m}">${m}</option>`)
          .join('');

        // Set default model
        const settings = Storage.getSettings();
        if (settings.aiModel && selectedProvider.models.includes(settings.aiModel)) {
          modelSelect.value = settings.aiModel;
        }

        // Update hint text
        hint.textContent = this.getProviderHint(provider);
      }
    }
  }

  getProviderHint(provider) {
    const hints = {
      openai: 'Get your API key from https://platform.openai.com/api-keys',
      claude: 'Get your API key from https://console.anthropic.com/settings/keys',
      gemini: 'Get your API key from https://aistudio.google.com/app/apikey'
    };
    return hints[provider] || '';
  }

  toggleApiKeyVisibility() {
    const input = document.getElementById('api-key');
    const btn = document.getElementById('toggle-api-key');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  }

  async testConnection() {
    const provider = document.getElementById('ai-provider').value;
    const apiKey = document.getElementById('api-key').value;
    const resultDiv = document.getElementById('test-result');

    if (!apiKey) {
      resultDiv.innerHTML = '<p class="error">⚠️ API Key is required</p>';
      return;
    }

    resultDiv.innerHTML = '<p class="loading">🔄 Testing connection...</p>';

    try {
      // Simple test by sending a basic prompt
      const testService = new AIService();
      testService.updateConfig({ provider, apiKey });

      const response = await testService.send('Say "Connection successful" in one sentence.');

      resultDiv.innerHTML = `
        <p class="success">✅ Connection successful!</p>
        <p class="info">Provider: ${response.provider} | Model: ${response.model}</p>
      `;
    } catch (error) {
      resultDiv.innerHTML = `
        <p class="error">❌ Connection failed</p>
        <p class="error-detail">${error.message}</p>
      `;
    }
  }

  saveSettings() {
    const provider = document.getElementById('ai-provider').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('ai-model').value;
    const showAiAssistant = document.getElementById('show-ai-assistant').checked;

    // Save to storage
    const settings = Storage.getSettings();
    settings.aiProvider = provider;
    settings.apiKey = apiKey;
    settings.aiModel = model;
    settings.showAiAssistant = showAiAssistant;

    Storage.saveSettings(settings);

    // Show success message
    this.showNotification('Settings saved successfully!', 'success');

    // Trigger callback
    this.onSave(settings);
  }

  clearApiKey() {
    if (confirm('Are you sure you want to clear the stored API key?')) {
      const settings = Storage.getSettings();
      settings.apiKey = '';
      Storage.saveSettings(settings);

      document.getElementById('api-key').value = '';
      this.showNotification('API Key cleared', 'info');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Add styles if not exists
    if (!document.getElementById('settings-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'settings-notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        .notification-success { border-left: 4px solid #10b981; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-info { border-left: 4px solid #3b82f6; }
        .notification-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.5;
        }
        .notification-close:hover { opacity: 1; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
}
