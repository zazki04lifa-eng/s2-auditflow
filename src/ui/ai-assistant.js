/**
 * AuditFlow AI - AI Assistant Component
 * Chatbot-style AI assistant for audit guidance
 */

import { Storage } from '../storage.js';
import { aiService } from '../ai/index.js';

export class AiAssistant {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} [options.onSendMessage] - Callback saat kirim pesan ke AI
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onSendMessage = options.onSendMessage;
    this.messages = [];
    this.isOpen = false;

    this._render();
    this._bindEvents();
    this._loadSettings();
  }

  /**
   * Render AI Assistant UI
   * @private
   */
  _render() {
    this.container.innerHTML = `
      <div class="ai-assistant">
        <!-- Toggle Button -->
        <button class="ai-toggle" id="aiToggle" title="AI Assistant">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a7 7 0 0 0-7 7v1a3 3 0 0 0 0 6v1a7 7 0 0 0 14 0v-1a3 3 0 0 0 0-6V9a7 7 0 0 0-7-7z"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/>
            <circle cx="15" cy="12" r="1" fill="currentColor"/>
          </svg>
          <span class="ai-toggle-badge">AI</span>
        </button>
        
        <!-- Chat Panel -->
        <div class="ai-panel" id="aiPanel" style="display:none;">
          <div class="ai-panel-header">
            <div class="ai-panel-title">
              <span class="ai-avatar">🤖</span>
              <div>
                <div class="ai-title">AI Audit Assistant</div>
                <div class="ai-status">
                  <span class="status-dot"></span>
                  <span id="aiStatusText">Online</span>
                </div>
              </div>
            </div>
            <button class="ai-close" id="aiClose" title="Tutup">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="ai-messages" id="aiMessages">
            <!-- Welcome message -->
            <div class="ai-message ai-message-ai">
              <div class="message-content">
                <p>Halo! Saya AI Assistant AuditFlow. 👋</p>
                <p>Saya bisa membantu Anda dengan:</p>
                <ul>
                  <li>Analisis risiko audit</li>
                  <li>Rekomendasi kontrol</li>
                  <li>Panduan working paper</li>
                  <li>Referensi standar audit (SA/COSO)</li>
                </ul>
                <p>Apa yang bisa saya bantu hari ini?</p>
              </div>
            </div>
          </div>
          
          <div class="ai-input-area">
            <div class="ai-quick-actions">
              <button class="quick-action" data-action="risk">🔍 Analisis Risiko</button>
              <button class="quick-action" data-action="control">🛡️ Rekomendasi Kontrol</button>
              <button class="quick-action" data-action="standard">📚 Standar Audit</button>
            </div>
            <div class="ai-input-row">
              <input 
                type="text" 
                id="aiInput" 
                class="ai-input" 
                placeholder="Tanya sesuatu..."
                autocomplete="off"
              >
              <button class="ai-send" id="aiSend" title="Kirim">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Bind event handlers
   * @private
   */
  _bindEvents() {
    // Toggle panel
    this.container.querySelector('#aiToggle')?.addEventListener('click', () => {
      this.toggle();
    });

    // Close panel
    this.container.querySelector('#aiClose')?.addEventListener('click', () => {
      this.close();
    });

    // Send message
    const sendBtn = this.container.querySelector('#aiSend');
    const input = this.container.querySelector('#aiInput');

    sendBtn?.addEventListener('click', () => this._sendMessage());

    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this._sendMessage();
      }
    });

    // Quick actions
    this.container.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this._handleQuickAction(action);
      });
    });
  }

  /**
   * Load settings
   * @private
   */
  _loadSettings() {
    const settings = Storage.getSettings();
    const statusText = this.container.querySelector('#aiStatusText');
    const statusDot = this.container.querySelector('.status-dot');

    if (settings.aiProvider === 'none' || !settings.apiKey) {
      if (statusText) statusText.textContent = 'Mode Offline (Rule-based)';
      if (statusDot) statusDot.className = 'status-dot offline';
    } else {
      const providerName = settings.aiProvider.charAt(0).toUpperCase() + settings.aiProvider.slice(1);
      if (statusText) statusText.textContent = `Online (${providerName})`;
      if (statusDot) statusDot.className = 'status-dot online';
    }
  }

  /**
   * Update config from settings
   * @param {Object} settings
   */
  updateConfig(settings) {
    this._loadSettings();
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = this.container.querySelector('#aiPanel');
    if (panel) {
      panel.style.display = this.isOpen ? 'flex' : 'none';
    }
  }

  /**
   * Open panel
   */
  open() {
    this.isOpen = true;
    const panel = this.container.querySelector('#aiPanel');
    if (panel) panel.style.display = 'flex';
  }

  /**
   * Close panel
   */
  close() {
    this.isOpen = false;
    const panel = this.container.querySelector('#aiPanel');
    if (panel) panel.style.display = 'none';
  }

  /**
   * Send message
   * @private
   */
  async _sendMessage() {
    const input = this.container.querySelector('#aiInput');
    const message = input?.value.trim();

    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');

    // Clear input
    if (input) input.value = '';

    // Show typing indicator
    this._showTyping();

    // Check if AI service is available
    if (aiService.isAvailable()) {
      try {
        // Use AI service for intelligent response
        const project = this._getCurrentProject();
        const analysisData = project?.analysis || null;

        const response = await aiService.answerQuestion(message, analysisData);
        this._hideTyping();
        this.addMessage(response, 'ai');
      } catch (error) {
        console.error('AI Service error:', error);
        this._hideTyping();
        this.addMessage(`Maaf, terjadi kesalahan saat menghubungi AI: ${error.message}`, 'ai');
      }
    } else {
      // Fallback to rule-based response
      setTimeout(() => {
        this._hideTyping();
        const response = this._generateResponse(message);
        this.addMessage(response, 'ai');
      }, 1000 + Math.random() * 1000);
    }
  }

  /**
   * Get current project data
   * @private
   */
  _getCurrentProject() {
    const projects = Storage.getProjects();
    const currentId = Storage.getCurrentProjectId();
    if (currentId) {
      return Storage.getProject(currentId);
    }
    return projects[0] || null;
  }

  /**
   * Handle quick action
   * @param {string} action
   * @private
   */
  _handleQuickAction(action) {
    const prompts = {
      risk: 'Bagaimana cara mengidentifikasi risiko dalam audit?',
      control: 'Apa saja jenis kontrol yang efektif untuk mencegah fraud?',
      standard: 'Jelaskan standar audit SA 315 tentang identifikasi risiko.'
    };

    const prompt = prompts[action];
    if (prompt) {
      this.addMessage(prompt, 'user');
      this._showTyping();

      setTimeout(() => {
        this._hideTyping();
        const response = this._generateResponse(prompt);
        this.addMessage(response, 'ai');
      }, 1000 + Math.random() * 1000);
    }
  }

  /**
   * Generate response (rule-based)
   * @param {string} message
   * @returns {string}
   * @private
   */
  _generateResponse(message) {
    const lower = message.toLowerCase();

    // Risk-related
    if (lower.includes('risiko') || lower.includes('risk')) {
      return `Untuk mengidentifikasi risiko dalam audit, Anda bisa:
      
1. **Analisis Proses Bisnis** - Pahami alur proses dari awal hingga akhir
2. **Identifikasi WCGW** (What Could Go Wrong) - Tanyakan "apa yang bisa salah?" di setiap langkah
3. **Evaluasi Kontrol Existing** - Cek apakah kontrol sudah memadai
4. **Gunakan Framework** - SA 315 dan COSO memberikan panduan lengkap

Contoh WCGW untuk proses order:
- Order tidak sah/tidak disetujui
- Harga tidak sesuai
- Barang tidak tersedia
- Pembayaran tidak tercatat

Ingin saya bantu analisis risiko untuk proses tertentu?`;
    }

    // Control-related
    if (lower.includes('kontrol') || lower.includes('control') || lower.includes('pengendalian')) {
      return `Jenis-jenis kontrol yang efektif untuk mencegah fraud:

**Kontrol Preventif:**
- Segregation of Duties (pemisahan tugas)
- Authorization & Approval workflows
- Access controls & passwords
- Physical safeguards

**Kontrol Detektif:**
- Reconciliations (rekonsiliasi)
- Exception reports
- Surprise audits
- Data analytics

**Kontrol Korektif:**
- Backup procedures
- Incident response plans
- Corrective action processes

Untuk proses audit Anda, kontrol mana yang paling relevan?`;
    }

    // Standard-related
    if (lower.includes('standar') || lower.includes('SA ') || lower.includes('standar audit')) {
      return `**Standar Audit Indonesia (SA):**

SA 200-series: Prinsip dasar & tanggung jawab
SA 300-series: Penilaian risiko
SA 400-series: Respons terhadap risiko
SA 500-series: Bukti audit
SA 600-series: Laporan audit
SA 700-series: Opini audit

**SA 315** khususnya membahas identifikasi dan penilaian risiko misstatement melalui pemahaman entitas dan lingkungannya.

**COSO Framework** memiliki 5 komponen:
1. Control Environment
2. Risk Assessment
3. Control Activities
4. Information & Communication
5. Monitoring Activities

Ada standar spesifik yang ingin Anda ketahui lebih detail?`;
    }

    // WCGW-related
    if (lower.includes('wcgw') || lower.includes('what could go wrong')) {
      return `**WCGW (What Could Go Wrong)** adalah teknik identifikasi risiko dengan bertanya "apa yang bisa salah?" di setiap langkah proses.

**Contoh WCGW per kategori:**

**Authorization:**
- Transaksi tidak disetujui oleh orang yang berwenang
- Melebihi batas otorisasi

**Completeness:**
- Transaksi tidak dicatat
- Dokumen hilang

**Accuracy:**
- Jumlah salah hitung
- Kurs salah konversi

**Cutoff:**
- Transaksi dicatat di periode yang salah
- Cut-off tidak konsisten

**Classification:**
- Akun salah klasifikasi
- Capital vs expense salah

Mau saya bantu identifikasi WCGW untuk proses spesifik?`;
    }

    // Greeting
    if (lower.includes('halo') || lower.includes('hi') || lower.includes('hello')) {
      return `Halo! 👋 Senang bertemu Anda. 

Saya AI Assistant AuditFlow, siap membantu Anda dalam:
• Analisis risiko audit
• Rekomendasi kontrol
• Panduan working paper
• Referensi standar audit

Ada yang bisa saya bantu hari ini?`;
    }

    // Default
    return `Terima kasih atas pertanyaan Anda. 

Sebagai AI Assistant audit, saya bisa membantu dengan:
• Analisis risiko dan WCGW
• Rekomendasi kontrol berdasarkan COSO
• Referensi Standar Audit (SA)
• Panduan working paper

Coba tanyakan tentang salah satu topik di atas, atau jelaskan proses bisnis yang ingin Anda audit.

*Catatan: Ini adalah mode offline (rule-based). Untuk analisis lebih mendalam, Anda bisa mengaktifkan AI provider di Settings.*`;
  }

  /**
   * Add message to chat
   * @param {string} text
   * @param {'user' | 'ai'} type
   */
  addMessage(text, type = 'user') {
    const messagesContainer = this.container.querySelector('#aiMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-message-${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convert markdown-like text to HTML
    const htmlText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- /g, '</p><li>')
      .replace(/\n\d\. /g, '</p><li>')
      .replace(/<li>/g, '</p><ul><li>')
      .replace(/<\/li>/g, '</li>');

    contentDiv.innerHTML = `<p>${htmlText}</p>`;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Show typing indicator
   * @private
   */
  _showTyping() {
    const messagesContainer = this.container.querySelector('#aiMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-message-ai ai-typing';
    typingDiv.id = 'aiTyping';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Hide typing indicator
   * @private
   */
  _hideTyping() {
    const typingEl = this.container.querySelector('#aiTyping');
    if (typingEl) typingEl.remove();
  }
}
