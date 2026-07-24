/**
 * AuditFlow AI - Main Entry Point
 * Complete application with dashboard, AI assistant, and all modules
 */

// Import global styles (Vite will handle CSS injection)
import './styles.css';

// Import app (includes all integrations)
import './app.js';

// Import types dan examples
import { Types } from './types/index.js';
import { Examples } from './types/examples.js';

// Import parser
import { parser } from './parser/index.js';

// Import file extractor
import { extractTextFromFile } from './parser/file-extractor.js';

// Import UI components
import { InputForm, FlowchartViewer, Dashboard, AiAssistant, ExportPanel, Settings } from './ui/index.js';

// Import AI service
import { aiService } from './ai/index.js';

console.log('🚀 AuditFlow AI - Application Ready');
console.log('✅ Environment loaded successfully');

// Export types for debugging (optional, can be removed in production)
window.AuditFlowTypes = Types;
window.AuditFlowExamples = Examples;
window.AuditFlowAI = aiService;
