/**
 * AuditFlow AI - DOCX Exporter
 * Export dokumen ke format Word (.docx)
 * Menggunakan pendekatan RTF-to-DOCX atau HTML-to-DOCX
 * 
 * Catatan: Export DOCX dari browser memiliki keterbatasan.
 * Untuk hasil terbaik, gunakan export PDF atau HTML.
 */

/**
 * @typedef {import('../types/index.js').FlowchartData} FlowchartData
 * @typedef {import('../types/index.js').WcgwEntry} WcgwEntry
 * @typedef {import('../types/index.js').WorkingPaper} WorkingPaper
 */

export class DocxExporter {
  /**
   * Generate dokumen DOCX menggunakan library docx
   * Requires: npm install docx
   * 
   * @param {Object} data - Data untuk export
   * @returns {Promise<Blob>} - Blob DOCX
   */
  async exportToDocx(data) {
    // Cek apakah library docx tersedia
    let docxLib;
    try {
      docxLib = await import('docx');
    } catch (e) {
      // Fallback ke export HTML yang bisa dibuka di Word
      return this._exportAsMht(data);
    }
    
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, HeadingLevel, TableOfContents,
      Header, Footer, PageNumber
    } = docxLib;
    
    try {
      // Build document sections
      const children = [];
      
      // Title
      children.push(new Paragraph({
        text: 'Audit Working Paper',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }));
      
      // Meta info
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: `Project: ${data.projectName}`,
            bold: true
          })
        ],
        spacing: { after: 100 }
      }));
      
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: `Industry: ${data.industry}`
          })
        ],
        spacing: { after: 100 }
      }));
      
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleDateString('id-ID')}`
          })
        ],
        spacing: { after: 300 }
      }));
      
      // Executive Summary
      children.push(new Paragraph({
        text: '1. Ringkasan Eksekutif',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 }
      }));
      
      if (data.workingPaper?.executiveSummary?.summary) {
        children.push(new Paragraph({
          text: data.workingPaper.executiveSummary.summary,
          spacing: { after: 200 }
        }));
      }
      
      // WCGW Table
      children.push(new Paragraph({
        text: '2. Analisis WCGW (What Could Go Wrong)',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 }
      }));
      
      if (data.wcgwEntries && data.wcgwEntries.length > 0) {
        const wcgwTable = this._createWcgwTable(data.wcgwEntries, docxLib);
        children.push(wcgwTable);
      }
      
      // Working Paper Sections
      if (data.workingPaper) {
        this._addWorkingPaperSections(children, data.workingPaper, docxLib);
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });
      
      // Generate blob
      const blob = await Packer.toBlob(doc);
      return blob;
      
    } catch (error) {
      console.error('Error generating DOCX:', error);
      // Fallback ke HTML
      return this._exportAsMht(data);
    }
  }
  
  /**
   * Create WCGW table
   * @param {WcgwEntry[]} wcgwEntries
   * @param {Object} docxLib
   * @returns {Table}
   */
  _createWcgwTable(wcgwEntries, docxLib) {
    const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = docxLib;
    
    // Header row
    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'ID', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'WCGW', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Kategori', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Risiko', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Kontrol Existing', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Confidence', bold: true })] })
      ]
    });
    
    // Data rows
    const rows = wcgwEntries.map(entry => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: entry.id || '' })] }),
          new TableCell({ children: [new Paragraph({ text: entry.description || '' })] }),
          new TableCell({ children: [new Paragraph({ text: entry.category || '' })] }),
          new TableCell({ children: [new Paragraph({ 
            text: (entry.riskLevel || 'low').toUpperCase(),
            color: this._getRiskColor(entry.riskLevel)
          })] }),
          new TableCell({ children: [new Paragraph({ text: entry.existingControl?.description || '-' })] }),
          new TableCell({ children: [new Paragraph({ 
            text: `${Math.round((entry.confidence || 0) * 100)}%` 
          })] })
        ]
      });
    });
    
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...rows],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
      }
    });
  }
  
  /**
   * Get color for risk level
   * @param {string} riskLevel
   * @returns {string}
   */
  _getRiskColor(riskLevel) {
    const colors = {
      low: '006400',
      medium: 'B8860B',
      high: 'FF4500',
      critical: 'DC143C'
    };
    return colors[riskLevel] || '000000';
  }
  
  /**
   * Add working paper sections
   * @param {Array} children
   * @param {WorkingPaper} workingPaper
   * @param {Object} docxLib
   */
  _addWorkingPaperSections(children, workingPaper, docxLib) {
    const { Paragraph, HeadingLevel } = docxLib;
    
    const sections = [
      { title: '3. Analisis Risiko', data: workingPaper.risk },
      { title: '4. Evaluasi Kontrol', data: workingPaper.control },
      { title: '5. Asersi Audit', data: workingPaper.assertion },
      { title: '6. Respons Audit', data: workingPaper.auditResponse },
      { title: '7. Prosedur Audit', data: workingPaper.auditProcedures },
      { title: '8. Rekomendasi', data: workingPaper.recommendations },
      { title: '9. Kesimpulan', data: workingPaper.conclusion }
    ];
    
    sections.forEach(section => {
      children.push(new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 100 }
      }));
      
      if (section.data?.summary) {
        children.push(new Paragraph({
          text: section.data.summary,
          spacing: { after: 100 }
        }));
      }
      
      if (section.data?.details && Array.isArray(section.data.details)) {
        section.data.details.forEach(detail => {
          children.push(new Paragraph({
            text: `• ${detail}`,
            spacing: { after: 50 }
          }));
        });
      }
    });
  }
  
  /**
   * Fallback: Export sebagai MHT/MHTML (bisa dibuka di Word)
   * @param {Object} data
   * @returns {Promise<Blob>}
   */
  async _exportAsMht(data) {
    const html = this._generateMhtHtml(data);
    return new Blob([html], { type: 'application/mhtml+xml' });
  }
  
  /**
   * Generate MHT-compatible HTML
   * @param {Object} data
   * @returns {string}
   */
  _generateMhtHtml(data) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.projectName} - Audit Working Paper</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
    h1 { color: #1e40af; font-size: 18pt; }
    h2 { color: #1e40af; font-size: 14pt; border-bottom: 1px solid #ccc; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #999; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    .risk-low { color: green; }
    .risk-medium { color: orange; }
    .risk-high { color: red; }
    .risk-critical { color: darkred; font-weight: bold; }
  </style>
</head>
<body>
  <h1 style="text-align:center">Audit Working Paper</h1>
  <p><strong>Project:</strong> ${data.projectName} | <strong>Industry:</strong> ${data.industry}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString('id-ID')}</p>
  
  <h2>1. Ringkasan Eksekutif</h2>
  <p>${data.workingPaper?.executiveSummary?.summary || 'Dokumen analisis risiko audit.'}</p>
  
  <h2>2. Analisis WCGW</h2>
  ${this._renderWcgwTableHtml(data.wcgwEntries)}
  
  ${this._renderWorkingPaperSectionsHtml(data.workingPaper)}
</body>
</html>`;
  }
  
  /**
   * Render WCGW table as HTML
   * @param {WcgwEntry[]} wcgwEntries
   * @returns {string}
   */
  _renderWcgwTableHtml(wcgwEntries) {
    if (!wcgwEntries || wcgwEntries.length === 0) {
      return '<p>Tidak ada WCGW yang teridentifikasi.</p>';
    }
    
    let html = '<table><thead><tr><th>ID</th><th>WCGW</th><th>Kategori</th><th>Risiko</th><th>Kontrol Existing</th><th>Confidence</th></tr></thead><tbody>';
    
    wcgwEntries.forEach(entry => {
      html += `<tr>
        <td>${entry.id || ''}</td>
        <td>${entry.description || ''}</td>
        <td>${entry.category || ''}</td>
        <td class="risk-${entry.riskLevel || 'low'}">${(entry.riskLevel || 'low').toUpperCase()}</td>
        <td>${entry.existingControl?.description || '-'}</td>
        <td>${Math.round((entry.confidence || 0) * 100)}%</td>
      </tr>`;
    });
    
    html += '</tbody></table>';
    return html;
  }
  
  /**
   * Render working paper sections as HTML
   * @param {WorkingPaper} workingPaper
   * @returns {string}
   */
  _renderWorkingPaperSectionsHtml(workingPaper) {
    if (!workingPaper) return '';
    
    const sections = [
      { title: '3. Analisis Risiko', data: workingPaper.risk },
      { title: '4. Evaluasi Kontrol', data: workingPaper.control },
      { title: '5. Asersi Audit', data: workingPaper.assertion },
      { title: '6. Respons Audit', data: workingPaper.auditResponse },
      { title: '7. Prosedur Audit', data: workingPaper.auditProcedures },
      { title: '8. Rekomendasi', data: workingPaper.recommendations },
      { title: '9. Kesimpulan', data: workingPaper.conclusion }
    ];
    
    let html = '';
    sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      if (section.data?.summary) {
        html += `<p>${section.data.summary}</p>`;
      }
      if (section.data?.details && Array.isArray(section.data.details)) {
        html += '<ul>';
        section.data.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
        html += '</ul>';
      }
    });
    
    return html;
  }
  
  /**
   * Download blob
   * @param {Blob} blob
   * @param {string} filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Export dan download
   * @param {Object} data
   * @param {string} [filename]
   */
  async export(data, filename) {
    try {
      const blob = await this.exportToDocx(data);
      const finalFilename = filename || `${data.projectName || 'audit'}-working-paper.docx`;
      this.downloadBlob(blob, finalFilename);
    } catch (error) {
      console.error('Export DOCX failed:', error);
      alert('Export DOCX gagal. Mencoba format alternatif...');
      
      // Fallback ke MHT
      const mhtBlob = await this._exportAsMht(data);
      const filename = `${data.projectName || 'audit'}-working-paper.mht`;
      this.downloadBlob(mhtBlob, filename);
    }
  }
}
