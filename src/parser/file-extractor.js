/**
 * AuditFlow AI - File Extractor Module
 * Extract text from .docx and .pdf files
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// For development (npm run dev): use CDN
// For production (npm run build): worker is copied to dist/ by vite plugin
const isDev = import.meta.env.DEV;
pdfjsLib.GlobalWorkerOptions.workerSrc = isDev
  ? 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  : '/pdf.worker.min.mjs';

/**
 * @typedef {'text' | 'docx' | 'pdf'} FileType
 */

/**
 * @typedef {Object} ExtractResult
 * @property {FileType} type
 * @property {string} text - Extracted text
 * @property {string} fileName - Original file name
 * @property {number} fileSize - File size in bytes
 * @property {boolean} success - Extraction success
 * @property {string} [error] - Error message if failed
 */

/**
 * Detect file type from file object
 * @param {File} file
 * @returns {FileType}
 */
function detectFileType(file) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  
  if (type.includes('word') || type.includes('docx') || name.endsWith('.docx')) {
    return 'docx';
  }
  if (type.includes('pdf') || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (type.includes('text') || name.endsWith('.txt')) {
    return 'text';
  }
  
  // Fallback based on extension
  if (name.endsWith('.txt')) return 'text';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.pdf')) return 'pdf';
  
  return 'text'; // Default to text
}

/**
 * Extract text from plain text file
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read text file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Extract text from DOCX file using Mammoth
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractDocxFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth warnings:', result.messages);
    }
    
    return result.value || '';
  } catch (error) {
    throw new Error(`Failed to extract DOCX: ${error.message}`);
  }
}

/**
 * Extract text from PDF file using PDF.js
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractPdfFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
}

/**
 * Extract text from any supported file
 * @param {File} file
 * @returns {Promise<ExtractResult>}
 */
export async function extractTextFromFile(file) {
  const type = detectFileType(file);
  const startTime = Date.now();
  
  try {
    let text = '';
    
    switch (type) {
      case 'text':
        text = await extractTextFile(file);
        break;
      case 'docx':
        text = await extractDocxFile(file);
        break;
      case 'pdf':
        text = await extractPdfFile(file);
        break;
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
    
    // Clean up extracted text
    text = cleanExtractedText(text, type);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Extracted ${type} file in ${duration}ms: ${text.length} chars`);
    
    return {
      type,
      text,
      fileName: file.name,
      fileSize: file.size,
      success: true
    };
  } catch (error) {
    console.error(`❌ Failed to extract ${type} file:`, error);
    return {
      type,
      text: '',
      fileName: file.name,
      fileSize: file.size,
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean up extracted text based on file type
 * @param {string} text
 * @param {FileType} type
 * @returns {string}
 */
function cleanExtractedText(text, type) {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  
  if (type === 'pdf') {
    // PDF extraction often has issues with line breaks and spacing
    cleaned = cleaned
      // Remove excessive whitespace
      .replace(/[ \t]+/g, ' ')
      // Join hyphenated words split across lines
      .replace(/-\s*\n/g, '')
      // Replace multiple newlines with double newline (paragraph break)
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  } else if (type === 'docx') {
    // DOCX extraction is usually cleaner
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } else {
    // Text files - minimal cleaning
    cleaned = cleaned.trim();
  }
  
  return cleaned;
}

/**
 * Validate extracted text
 * @param {string} text
 * @param {FileType} type
 * @returns {{ valid: boolean, issues: string[] }}
 */
export function validateExtractedText(text, type) {
  const issues = [];
  
  if (!text || text.length === 0) {
    issues.push('Text is empty');
    return { valid: false, issues };
  }
  
  // Check for common extraction issues
  if (type === 'pdf') {
    // Check for excessive line breaks
    const lines = text.split('\n');
    const avgLineLength = text.length / lines.length;
    if (avgLineLength < 20) {
      issues.push('Too many line breaks - possible formatting issues');
    }
    
    // Check for garbled text (common PDF issue)
    const specialCharRatio = (text.match(/[^\x00-\x7F]/g) || []).length / text.length;
    if (specialCharRatio > 0.1) {
      issues.push('High ratio of special characters - possible encoding issues');
    }
  }
  
  // Check minimum length
  if (text.length < 10) {
    issues.push('Text too short - may not contain meaningful content');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Get file type display name
 * @param {FileType} type
 * @returns {string}
 */
export function getFileTypeDisplayName(type) {
  const names = {
    text: 'Text File',
    docx: 'Word Document',
    pdf: 'PDF Document'
  };
  return names[type] || 'Unknown';
}

// Export utilities
export const FileExtractor = {
  extractTextFromFile,
  validateExtractedText,
  detectFileType,
  getFileTypeDisplayName
};
