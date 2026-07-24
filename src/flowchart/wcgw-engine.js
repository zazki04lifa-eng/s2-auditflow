/**
 * AuditFlow AI - WCGW (What Could Go Wrong) Engine
 * Analisis risiko otomatis berdasarkan pola proses
 */

/**
 * @typedef {Object} WcgwTemplate
 * @property {string} pattern - Regex pattern untuk match
 * @property {string} description - Deskripsi risiko
 * @property {string} riskLevel - low|medium|high|critical
 * @property {string} category - Fraud|Error|Compliance|etc
 */

class WcgwEngine {
  constructor() {
    // Template WCGW berdasarkan pola proses
    this.templates = [
      // Fraud patterns
      {
        pattern: /pesanan|order|penjualan/i,
        description: 'Pesanan fiktif atau tidak sah diproses',
        riskLevel: 'high',
        category: 'Fraud'
      },
      {
        pattern: /pembayaran|payment|kas|cash/i,
        description: 'Pembayaran tidak sah atau diselewengkan',
        riskLevel: 'high',
        category: 'Fraud'
      },
      {
        pattern: /persetujuan|approval|otorisasi/i,
        description: 'Persetujuan diberikan tanpa verifikasi yang memadai',
        riskLevel: 'medium',
        category: 'Control'
      },
      
      // Error patterns
      {
        pattern: /pengiriman|shipping|barang/i,
        description: 'Barang dikirim ke alamat atau jumlah yang salah',
        riskLevel: 'medium',
        category: 'Error'
      },
      {
        pattern: /faktur|invoice|penagihan/i,
        description: 'Faktur dibuat dengan jumlah atau harga yang salah',
        riskLevel: 'medium',
        category: 'Error'
      },
      {
        pattern: /pendapatan|revenue|penjualan/i,
        description: 'Pendapatan diakui pada periode yang tidak tepat',
        riskLevel: 'high',
        category: 'Cut-off'
      },
      
      // Compliance patterns
      {
        pattern: /dokumen|document|berkas/i,
        description: 'Dokumen pendukung tidak lengkap atau hilang',
        riskLevel: 'medium',
        category: 'Compliance'
      },
      {
        pattern: /rekonsiliasi|reconcile|pencocokan/i,
        description: 'Rekonsiliasi tidak dilakukan secara berkala',
        riskLevel: 'medium',
        category: 'Control'
      },
      
      // Inventory patterns
      {
        pattern: /stok|inventory|persediaan|gudang/i,
        description: 'Persediaan tidak tercatat atau hilang',
        riskLevel: 'medium',
        category: 'Error'
      },
      
      // Credit patterns
      {
        pattern: /kredit|credit|piutang/i,
        description: 'Kredit diberikan kepada pelanggan dengan risiko tinggi',
        riskLevel: 'high',
        category: 'Credit'
      }
    ];
  }
  
  /**
   * Find WCGW entries for a node based on its label and context
   * @param {import('../types/index.js').FlowchartNode} node
   * @param {string} context - Full process description
   * @returns {import('../types/index.js').WcgwEntry[]}
   */
  findWcgwForNode(node, context = '') {
    const wcgwEntries = [];
    const textToAnalyze = `${node.label} ${context}`.toLowerCase();
    
    for (const template of this.templates) {
      if (template.pattern.test(textToAnalyze)) {
        wcgwEntries.push({
          id: `wcgw-${node.id}-${Date.now()}`,
          nodeId: node.id,
          description: template.description,
          riskLevel: template.riskLevel,
          likelihood: this.inferLikelihood(template.riskLevel),
          impact: this.inferImpact(template.riskLevel),
          rootCauseDraft: this.generateRootCause(template.category),
          confidenceScore: this.calculateConfidence(template, textToAnalyze),
          standardRef: this.getStandardRef(template.category)
        });
      }
    }
    
    // If no specific WCGW found, add generic one
    if (wcgwEntries.length === 0 && node.type === 'process') {
      wcgwEntries.push({
        id: `wcgw-${node.id}-${Date.now()}`,
        nodeId: node.id,
        description: `Proses ${node.label} tidak berjalan sesuai prosedur`,
        riskLevel: 'low',
        likelihood: 'possible',
        impact: 'minor',
        rootCauseDraft: 'Kurangnya dokumentasi prosedur yang jelas',
        confidenceScore: 0.5,
        standardRef: 'SA 315 - Risk Assessment'
      });
    }
    
    return wcgwEntries;
  }
  
  /**
   * Find WCGW for all nodes in flowchart
   * @param {import('../types/index.js').FlowchartData} flowchartData
   * @param {string} context
   * @returns {import('../types/index.js').WcgwEntry[]}
   */
  analyzeFlowchart(flowchartData, context = '') {
    const allWcgw = [];
    
    flowchartData.nodes.forEach(node => {
      const wcgwForNode = this.findWcgwForNode(node, context);
      allWcgw.push(...wcgwForNode);
    });
    
    return allWcgw;
  }
  
  /**
   * Infer likelihood from risk level
   */
  inferLikelihood(riskLevel) {
    const mapping = {
      low: 'unlikely',
      medium: 'possible',
      high: 'likely',
      critical: 'almost_certain'
    };
    return mapping[riskLevel] || 'possible';
  }
  
  /**
   * Infer impact from risk level
   */
  inferImpact(riskLevel) {
    const mapping = {
      low: 'minor',
      medium: 'moderate',
      high: 'major',
      critical: 'catastrophic'
    };
    return mapping[riskLevel] || 'moderate';
  }
  
  /**
   * Generate root cause based on category
   */
  generateRootCause(category) {
    const causes = {
      Fraud: 'Kurangnya segregasi tugas dan oversight yang memadai',
      Error: 'Prosedur tidak diikuti atau dokumentasi tidak jelas',
      Control: 'Desain kontrol tidak memadai atau tidak diimplementasikan',
      Compliance: 'Kurangnya monitoring dan review berkala',
      Credit: 'Kebijakan kredit tidak ditegakkan secara konsisten',
      'Cut-off': 'Sistem tidak mencatat transaksi pada periode yang tepat'
    };
    return causes[category] || 'Penyebab belum teridentifikasi';
  }
  
  /**
   * Calculate confidence score based on pattern match strength
   */
  calculateConfidence(template, text) {
    const matchCount = (text.match(template.pattern) || []).length;
    const baseScore = 0.6;
    const bonus = Math.min(matchCount * 0.1, 0.3);
    return Math.min(baseScore + bonus, 0.95);
  }
  
  /**
   * Get relevant audit standard reference
   */
  getStandardRef(category) {
    const refs = {
      Fraud: 'SA 240 - Fraud Considerations',
      Error: 'SA 500 - Audit Evidence',
      Control: 'SA 315 - Risk Assessment',
      Compliance: 'SA 250 - Laws and Regulations',
      Credit: 'SA 540 - Accounting Estimates',
      'Cut-off': 'SA 500 - Audit Evidence'
    };
    return refs[category] || 'SA 315 - Risk Assessment';
  }
  
  /**
   * Get WCGW statistics
   * @param {import('../types/index.js').WcgwEntry[]} wcgwEntries
   * @returns {{ total: number, byRiskLevel: Object, byCategory: Object }}
   */
  getStatistics(wcgwEntries) {
    const stats = {
      total: wcgwEntries.length,
      byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 },
      byCategory: {}
    };
    
    wcgwEntries.forEach(entry => {
      stats.byRiskLevel[entry.riskLevel]++;
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const wcgwEngine = new WcgwEngine();
export { WcgwEngine };
