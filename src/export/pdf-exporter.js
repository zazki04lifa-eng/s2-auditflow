/**
 * AuditFlow AI - PDF Exporter
 * Export dokumen lengkap ke PDF menggunakan print-to-PDF HTML approach
 */

/**
 * @typedef {import('../types/index.js').FlowchartData} FlowchartData
 * @typedef {import('../types/index.js').WcgwEntry} WcgwEntry
 * @typedef {import('../types/index.js').AnalysisSection} AnalysisSection
 * @typedef {import('../types/index.js').WorkingPaper} WorkingPaper
 */

export class PdfExporter {
  /**
   * Generate HTML lengkap untuk PDF
   * @param {Object} data - Data lengkap untuk export
   * @param {string} data.projectName - Nama project
   * @param {string} data.industry - Industri
   * @param {string} data.flowchartSvg - SVG flowchart
   * @param {WcgwEntry[]} data.wcgwEntries - Daftar WCGW
   * @param {WorkingPaper} [data.workingPaper] - Working paper (opsional)
   * @returns {string} - HTML string
   */
  generatePdfHtml(data) {
    const { projectName, industry, flowchartSvg, wcgwEntries, workingPaper } = data;
    
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Audit Working Paper</title>
  <style>
    /* Reset & Base */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Page Setup */
    @page {
      size: A4;
      margin: 2cm;
    }
    
    /* Container */
    .pdf-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 2cm;
    }
    
    /* Header */
    .doc-header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .doc-header h1 {
      font-size: 24pt;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .doc-header .meta {
      font-size: 10pt;
      color: #64748b;
    }
    
    /* Section */
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .section h2 {
      font-size: 16pt;
      color: #1e40af;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .section h3 {
      font-size: 13pt;
      color: #334155;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    
    /* Flowchart */
    .flowchart-container {
      margin: 24px 0;
      text-align: center;
    }
    .flowchart-container svg {
      max-width: 100%;
      height: auto;
    }
    
    /* WCGW Table */
    .wcgw-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin: 16px 0;
    }
    .wcgw-table th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #cbd5e1;
    }
    .wcgw-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .wcgw-table tr:last-child td {
      border-bottom: none;
    }
    
    /* Risk Badges */
    .risk-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    .risk-low { background: #dcfce7; color: #166534; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-high { background: #fed7aa; color: #c2410c; }
    .risk-critical { background: #fee2e2; color: #dc2626; }
    
    /* Confidence */
    .confidence {
      font-size: 9pt;
      color: #64748b;
    }
    
    /* Lists */
    ul {
      margin-left: 24px;
      margin-bottom: 16px;
    }
    li {
      margin-bottom: 6px;
    }
    
    /* Paragraphs */
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    
    /* Footer */
    .doc-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #94a3b8;
      text-align: center;
    }
    
    /* Page breaks */
    .page-break {
      page-break-before: always;
    }
    
    /* Print specific */
    @media print {
      body { background: white; }
      .pdf-container { max-width: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    <!-- Header -->
    <div class="doc-header">
      <h1>Audit Working Paper</h1>
      <div class="meta">
        <strong>Project:</strong> ${projectName} | <strong>Industry:</strong> ${industry} | 
        <strong>Generated:</strong> ${new Date().toLocaleDateString('id-ID', { 
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })}
      </div>
    </div>
    
    <!-- Executive Summary -->
    <div class="section">
      <h2>1. Ringkasan Eksekutif</h2>
      ${workingPaper ? this._renderSection(workingPaper.executiveSummary) : '<p>Dokumen ini berisi analisis risiko dan kontrol untuk proses audit yang telah dipetakan dalam flowchart.</p>'}
    </div>
    
    <!-- Flowchart -->
    <div class="section">
      <h2>2. Flowchart Proses</h2>
      <div class="flowchart-container">
        ${flowchartSvg}
      </div>
    </div>
    
    <!-- WCGW Analysis -->
    <div class="section">
      <h2>3. Analisis WCGW (What Could Go Wrong)</h2>
      ${this._renderWcgwTable(wcgwEntries)}
    </div>
    
    ${workingPaper ? `
    <!-- Page Break -->
    <div class="page-break"></div>
    
    <!-- Risk Section -->
    <div class="section">
      <h2>4. Analisis Risiko</h2>
      ${this._renderSection(workingPaper.risk)}
    </div>
    
    <!-- Control Section -->
    <div class="section">
      <h2>5. Evaluasi Kontrol</h2>
      ${this._renderSection(workingPaper.control)}
    </div>
    
    <!-- Assertion Section -->
    <div class="section">
      <h2>6. Asersi Audit</h2>
      ${this._renderSection(workingPaper.assertion)}
    </div>
    
    <!-- Audit Response -->
    <div class="section">
      <h2>7. Respons Audit</h2>
      ${this._renderSection(workingPaper.auditResponse)}
    </div>
    
    <!-- Audit Procedures -->
    <div class="section">
      <h2>8. Prosedur Audit</h2>
      ${this._renderSection(workingPaper.auditProcedures)}
    </div>
    
    <!-- Recommendations -->
    <div class="section">
      <h2>9. Rekomendasi</h2>
      ${this._renderSection(workingPaper.recommendations)}
    </div>
    
    <!-- Conclusion -->
    <div class="section">
      <h2>10. Kesimpulan</h2>
      ${this._renderSection(workingPaper.conclusion)}
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="doc-footer">
      Dokumen ini dihasilkan secara otomatis oleh AuditFlow AI | ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Render WCGW table HTML
   * @param {WcgwEntry[]} wcgwEntries
   * @returns {string}
   */
  _renderWcgwTable(wcgwEntries) {
    if (!wcgwEntries || wcgwEntries.length === 0) {
      return '<p>Tidak ada WCGW yang teridentifikasi.</p>';
    }
    
    const rows = wcgwEntries.map(entry => `
      <tr>
        <td style="width: 5%;">${entry.id || ''}</td>
        <td style="width: 25%;">${entry.description || ''}</td>
        <td style="width: 15%;">${entry.category || ''}</td>
        <td style="width: 10%;">
          <span class="risk-badge risk-${entry.riskLevel || 'low'}">${entry.riskLevel || 'low'}</span>
        </td>
        <td style="width: 25%;">${entry.existingControl?.description || '-'}</td>
        <td style="width: 20%;">
          <span class="confidence">Confidence: ${Math.round((entry.confidence || 0) * 100)}%</span>
        </td>
      </tr>
    `).join('');
    
    return `
      <table class="wcgw-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>WCGW</th>
            <th>Kategori</th>
            <th>Risiko</th>
            <th>Kontrol Existing</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
  
  /**
   * Render section HTML
   * @param {AnalysisSection} section
   * @returns {string}
   */
  _renderSection(section) {
    if (!section) return '<p>Tidak ada konten.</p>';
    
    let html = '';
    
    if (section.summary) {
      html += `<p>${section.summary}</p>`;
    }
    
    if (section.details && Array.isArray(section.details)) {
      html += '<ul>';
      section.details.forEach(detail => {
        html += `<li>${detail}</li>`;
      });
      html += '</ul>';
    }
    
    if (section.content) {
      html += `<p>${section.content}</p>`;
    }
    
    return html || '<p>Tidak ada konten.</p>';
  }
  
  /**
   * Print HTML ke PDF (menggunakan window.print())
   * @param {string} html - HTML string
   * @param {string} [filename] - Nama file untuk download
   */
  printToPdf(html, filename) {
    // Buat window baru untuk print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback: download sebagai HTML
      this._downloadHtml(html, filename || 'audit-working-paper.html');
      return;
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Tunggu loading selesai lalu print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
  
  /**
   * Download HTML sebagai file
   * @param {string} html
   * @param {string} filename
   */
  _downloadHtml(html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
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
   * Export lengkap ke PDF
   * @param {Object} data - Data untuk export
   * @param {string} [filename] - Nama file
   */
  export(data, filename) {
    const html = this.generatePdfHtml(data);
    const finalFilename = filename || `${data.projectName || 'audit'}-working-paper.html`;
    this.printToPdf(html, finalFilename);
  }
}
