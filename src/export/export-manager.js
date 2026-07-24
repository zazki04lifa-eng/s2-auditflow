/**
 * AuditFlow AI - Export Manager
 * Manager untuk orchestrasi semua fungsi export
 */

import { ImageExporter } from './image-exporter.js';
import { PdfExporter } from './pdf-exporter.js';
import { DocxExporter } from './docx-exporter.js';

/**
 * @typedef {import('../types/index.js').FlowchartData} FlowchartData
 * @typedef {import('../types/index.js').WcgwEntry} WcgwEntry
 * @typedef {import('../types/index.js').WorkingPaper} WorkingPaper
 * @typedef {import('../types/index.js').FlowchartOptions} FlowchartOptions
 */

/**
 * @typedef {Object} ExportData
 * @property {string} projectName
 * @property {string} industry
 * @property {FlowchartData} flowchartData
 * @property {FlowchartOptions} flowchartOptions
 * @property {WcgwEntry[]} wcgwEntries
 * @property {WorkingPaper} [workingPaper]
 */

export class ExportManager {
  constructor() {
    this.imageExporter = new ImageExporter();
    this.pdfExporter = new PdfExporter();
    this.docxExporter = new DocxExporter();
  }
  
  /**
   * Export ke PNG
   * @param {ExportData} data
   * @param {Object} renderer - FlowchartRenderer instance
   * @param {string} [filename]
   * @returns {Promise<void>}
   */
  async exportPng(data, renderer, filename) {
    try {
      const svgString = renderer.render(data.flowchartData, {
        ...data.flowchartOptions,
        showWcgw: data.wcgwEntries.length > 0
      });
      
      const blob = await this.imageExporter.exportFromSvg(svgString, 'png', {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      this.imageExporter.downloadBlob(blob, filename || `${data.projectName}-flowchart.png`);
    } catch (error) {
      console.error('Export PNG failed:', error);
      throw error;
    }
  }
  
  /**
   * Export ke JPG
   * @param {ExportData} data
   * @param {Object} renderer - FlowchartRenderer instance
   * @param {string} [filename]
   * @returns {Promise<void>}
   */
  async exportJpg(data, renderer, filename) {
    try {
      const svgString = renderer.render(data.flowchartData, {
        ...data.flowchartOptions,
        showWcgw: data.wcgwEntries.length > 0
      });
      
      const blob = await this.imageExporter.exportFromSvg(svgString, 'jpg', {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      this.imageExporter.downloadBlob(blob, filename || `${data.projectName}-flowchart.jpg`);
    } catch (error) {
      console.error('Export JPG failed:', error);
      throw error;
    }
  }
  
  /**
   * Export ke PDF (complete document)
   * @param {ExportData} data
   * @param {Object} renderer - FlowchartRenderer instance
   * @param {string} [filename]
   * @returns {Promise<void>}
   */
  async exportPdf(data, renderer, filename) {
    try {
      // Generate SVG untuk flowchart
      const flowchartSvg = renderer.render(data.flowchartData, {
        ...data.flowchartOptions,
        showWcgw: data.wcgwEntries.length > 0
      });
      
      // Prepare export data
      const exportData = {
        projectName: data.projectName,
        industry: data.industry,
        flowchartSvg: flowchartSvg,
        wcgwEntries: data.wcgwEntries,
        workingPaper: data.workingPaper
      };
      
      // Export menggunakan print-to-PDF
      this.pdfExporter.export(exportData, filename || `${data.projectName}-working-paper.html`);
    } catch (error) {
      console.error('Export PDF failed:', error);
      throw error;
    }
  }
  
  /**
   * Export ke DOCX
   * @param {ExportData} data
   * @param {string} [filename]
   * @returns {Promise<void>}
   */
  async exportDocx(data, filename) {
    try {
      // Prepare export data (DOCX tidak butuh SVG)
      const exportData = {
        projectName: data.projectName,
        industry: data.industry,
        wcgwEntries: data.wcgwEntries,
        workingPaper: data.workingPaper
      };
      
      await this.docxExporter.export(exportData, filename || `${data.projectName}-working-paper.docx`);
    } catch (error) {
      console.error('Export DOCX failed:', error);
      throw error;
    }
  }
  
  /**
   * Export semua format sekaligus
   * @param {ExportData} data
   * @param {Object} renderer - FlowchartRenderer instance
   * @returns {Promise<Object>} - Results dari setiap export
   */
  async exportAll(data, renderer) {
    const results = {
      png: null,
      jpg: null,
      pdf: null,
      docx: null,
      errors: []
    };
    
    // Export PNG
    try {
      await this.exportPng(data, renderer, `${data.projectName}-flowchart.png`);
      results.png = 'success';
    } catch (error) {
      results.png = 'failed';
      results.errors.push({ format: 'png', error: error.message });
    }
    
    // Export JPG
    try {
      await this.exportJpg(data, renderer, `${data.projectName}-flowchart.jpg`);
      results.jpg = 'success';
    } catch (error) {
      results.jpg = 'failed';
      results.errors.push({ format: 'jpg', error: error.message });
    }
    
    // Export PDF
    try {
      await this.exportPdf(data, renderer, `${data.projectName}-working-paper.html`);
      results.pdf = 'success';
    } catch (error) {
      results.pdf = 'failed';
      results.errors.push({ format: 'pdf', error: error.message });
    }
    
    // Export DOCX
    try {
      await this.exportDocx(data, `${data.projectName}-working-paper.docx`);
      results.docx = 'success';
    } catch (error) {
      results.docx = 'failed';
      results.errors.push({ format: 'docx', error: error.message });
    }
    
    return results;
  }
  
  /**
   * Get available export formats
   * @returns {Array<{id: string, label: string, description: string, extension: string}>}
   */
  getAvailableFormats() {
    return [
      {
        id: 'png',
        label: 'PNG Image',
        description: 'Flowchart dalam format PNG berkualitas tinggi',
        extension: '.png'
      },
      {
        id: 'jpg',
        label: 'JPG Image',
        description: 'Flowchart dalam format JPG (ukuran lebih kecil)',
        extension: '.jpg'
      },
      {
        id: 'pdf',
        label: 'PDF Document',
        description: 'Dokumen lengkap (flowchart + analisis) - Print to PDF',
        extension: '.html'
      },
      {
        id: 'docx',
        label: 'Word Document',
        description: 'Dokumen Word (.docx) - editable',
        extension: '.docx'
      }
    ];
  }
  
  /**
   * Validate export data
   * @param {ExportData} data
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateData(data) {
    const errors = [];
    
    if (!data.projectName) {
      errors.push('Project name diperlukan');
    }
    
    if (!data.industry) {
      errors.push('Industry diperlukan');
    }
    
    if (!data.flowchartData || !data.flowchartData.nodes) {
      errors.push('Flowchart data diperlukan');
    }
    
    if (!data.wcgwEntries) {
      errors.push('WCGW entries diperlukan');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
