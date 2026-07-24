/**
 * AuditFlow AI - AI Service Module
 * Integrasi dengan berbagai LLM providers (OpenAI, Claude, Gemini)
 */

import { Storage } from '../storage.js';

/**
 * @typedef {Object} AIConfig
 * @property {string} provider - 'openai' | 'claude' | 'gemini'
 * @property {string} apiKey - API key untuk provider
 * @property {string} [model] - Model spesifik (optional)
 */

/**
 * @typedef {Object} AIMessage
 * @property {string} role - 'system' | 'user' | 'assistant'
 * @property {string} content - Isi pesan
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} content - Response content
 * @property {string} provider - Provider yang digunakan
 * @property {string} model - Model yang digunakan
 * @property {number} [usage] - Token usage (jika tersedia)
 */

export class AIService {
    constructor() {
        this.currentProvider = null;
        this.apiKey = null;
        this.model = null;
        this.loadConfig();
    }

    /**
     * Load konfigurasi AI dari storage
     */
    loadConfig() {
        const settings = Storage.getSettings();
        this.currentProvider = settings.aiProvider || 'none';
        this.apiKey = settings.apiKey || '';
        this.model = settings.aiModel || this.getDefaultModel(this.currentProvider);
    }

    /**
     * Get default model untuk setiap provider
     */
    getDefaultModel(provider) {
        const defaults = {
            openai: 'gpt-4-turbo',
            claude: 'claude-3-sonnet-20240229',
            gemini: 'gemini-pro',
            none: null
        };
        return defaults[provider] || null;
    }

    /**
     * Update konfigurasi AI
     * @param {Partial<AIConfig>} config
     */
    updateConfig(config) {
        const settings = Storage.getSettings();

        if (config.provider !== undefined) {
            settings.aiProvider = config.provider;
            this.currentProvider = config.provider;
        }

        if (config.apiKey !== undefined) {
            settings.apiKey = config.apiKey;
            this.apiKey = config.apiKey;
        }

        if (config.model !== undefined) {
            settings.aiModel = config.model;
            this.model = config.model;
        }

        Storage.saveSettings(settings);
    }

    /**
     * Cek apakah AI service tersedia
     * @returns {boolean}
     */
    isAvailable() {
        return this.currentProvider !== 'none' && !!this.apiKey;
    }

    /**
     * Get available providers
     * @returns {Array<{id: string, name: string, models: string[]}>}
     */
    static getAvailableProviders() {
        return [
            {
                id: 'openai',
                name: 'OpenAI',
                models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
                endpoint: 'https://api.openai.com/v1/chat/completions'
            },
            {
                id: 'claude',
                name: 'Anthropic Claude',
                models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
                endpoint: 'https://api.anthropic.com/v1/messages'
            },
            {
                id: 'gemini',
                name: 'Google Gemini',
                models: ['gemini-pro', 'gemini-1.5-pro'],
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
            }
        ];
    }

    /**
     * Send message ke AI provider
     * @param {string} prompt - User prompt
     * @param {AIMessage[]} [systemMessages] - Optional system messages
     * @returns {Promise<AIResponse>}
     */
    async send(prompt, systemMessages = []) {
        if (!this.isAvailable()) {
            throw new Error('AI service not configured. Please set API key in Settings.');
        }

        switch (this.currentProvider) {
            case 'openai':
                return this.sendToOpenAI(prompt, systemMessages);
            case 'claude':
                return this.sendToClaude(prompt, systemMessages);
            case 'gemini':
                return this.sendToGemini(prompt, systemMessages);
            default:
                throw new Error(`Unknown provider: ${this.currentProvider}`);
        }
    }

    /**
     * Send to OpenAI API
     * @private
     */
    async sendToOpenAI(prompt, systemMessages) {
        const messages = [
            ...systemMessages,
            { role: 'user', content: prompt }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model || 'gpt-4-turbo',
                messages,
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            provider: 'openai',
            model: this.model || 'gpt-4-turbo',
            usage: data.usage
        };
    }

    /**
     * Send to Claude API
     * @private
     */
    async sendToClaude(prompt, systemMessages) {
        const systemContent = systemMessages
            .filter(m => m.role === 'system')
            .map(m => m.content)
            .join('\n');

        const messages = [
            ...systemMessages.filter(m => m.role !== 'system'),
            { role: 'user', content: prompt }
        ];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: this.model || 'claude-3-sonnet-20240229',
                max_tokens: 4096,
                system: systemContent || 'You are an expert audit assistant.',
                messages
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            content: data.content[0].text,
            provider: 'claude',
            model: this.model || 'claude-3-sonnet-20240229',
            usage: data.usage
        };
    }

    /**
     * Send to Gemini API
     * @private
     */
    async sendToGemini(prompt, systemMessages) {
        const systemContent = systemMessages
            .filter(m => m.role === 'system')
            .map(m => m.content)
            .join('\n');

        const fullPrompt = systemContent
            ? `${systemContent}\n\n${prompt}`
            : prompt;

        const model = this.model || 'gemini-pro';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            content: data.candidates[0].content.parts[0].text,
            provider: 'gemini',
            model: model
        };
    }

    /**
     * Generate audit analysis menggunakan AI
     * @param {string} narrative - Business process narrative
     * @returns {Promise<Object>} Analysis result
     */
    async generateAuditAnalysis(narrative) {
        const systemPrompt = `You are an expert audit assistant. Analyze the business process narrative and provide:
1. What Could Go Wrong (WCGW) for each key process
2. Risk assessment (impact, likelihood, risk level)
3. Recommended controls (preventive/detective)
4. Audit objectives
5. Risk categories

Format the response as JSON with the following structure:
{
  "wcgw": [{"process": "", "wcgw": "", "impact": "High|Medium|Low", "likelihood": "High|Medium|Low", "riskLevel": "High|Medium|Low"}],
  "controls": [{"process": "", "description": "", "controlType": "Preventive|Detective"}],
  "objectives": [{"process": "", "objective": ""}],
  "riskCategories": [{"category": "", "description": ""}],
  "readinessScore": 0-100,
  "complexityScore": 0-100
}`;

        const userPrompt = `Analyze this business process narrative:\n\n${narrative}`;

        const response = await this.send(userPrompt, [{ role: 'system', content: systemPrompt }]);

        try {
            // Parse JSON from response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response from AI');
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            throw new Error('Failed to parse AI analysis. Please try again.');
        }
    }

    /**
     * Answer questions about audit analysis
     * @param {string} question - User question
     * @param {Object} analysisData - Current analysis data
     * @returns {Promise<string>} Answer
     */
    async answerQuestion(question, analysisData) {
        const systemPrompt = `You are an audit assistant. Answer questions based on the provided audit analysis data.`;

        const context = `Analysis Data:\n${JSON.stringify(analysisData, null, 2)}`;
        const userPrompt = `${context}\n\nQuestion: ${question}`;

        const response = await this.send(userPrompt, [{ role: 'system', content: systemPrompt }]);
        return response.content;
    }
}

// Export singleton instance
export const aiService = new AIService();
