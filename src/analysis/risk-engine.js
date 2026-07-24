/**
 * AuditFlow AI - Risk Analysis Engine
 * a. Risk Level calculation (impact × likelihood matrix)
 * b. Confidence Score calculation
 * c. Root Cause draft generation
 * e. Control Gap calculation
 */

/**
 * Risk Level Matrix (Impact × Likelihood)
 * 
 * Impact: insignificant(1), minor(2), moderate(3), major(4), catastrophic(5)
 * Likelihood: rare(1), unlikely(2), possible(3), likely(4), almost_certain(5)
 * 
 * Score = Impact × Likelihood
 * 1-4: Low
 * 5-12: Medium
 * 13-20: High
 * 21-25: Critical
 */

const IMPACT_SCORES = {
  insignificant: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  catastrophic: 5
};

const LIKELIHOOD_SCORES = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5
};

const RISK_THRESHOLDS = [
  { max: 4, level: 'low', color: '#14a394' },
  { max: 12, level: 'medium', color: '#d69e2e' },
  { max: 20, level: 'high', color: '#e53e3e' },
  { max: 25, level: 'critical', color: '#c53030' }
];

class RiskEngine {
  constructor() {
    // Root cause templates based on patterns
    this.rootCauseTemplates = [
      {
        pattern: /pesanan|order|penjualan/i,
        causes: [
          'Kurangnya validasi otomatis terhadap keabsahan pesanan',
          'Prosedur persetujuan pesanan tidak ditegakkan secara konsisten',
          'Sistem tidak melakukan cross-check dengan data historis'
        ]
      },
      {
        pattern: /pembayaran|payment|kas|cash/i,
        causes: [
          'Segregasi tugas antara fungsi otorisasi dan pencatatan tidak memadai',
          'Kontrol atas akses sistem pembayaran tidak ketat',
          'Rekonsiliasi tidak dilakukan secara berkala'
        ]
      },
      {
        pattern: /persediaan|inventory|stok|gudang/i,
        causes: [
          'Prosedur stock opname tidak dijalankan secara konsisten',
          'Sistem pencatatan persediaan tidak terintegrasi dengan fisik',
          'Kurangnya pengawasan atas barang masuk dan keluar'
        ]
      },
      {
        pattern: /pendapatan|revenue|penjualan/i,
        causes: [
          'Kebijakan pengakuan pendapatan tidak terdokumentasi dengan jelas',
          'Sistem tidak secara otomatis memvalidasi periode pengakuan',
          'Kurangnya review atas jurnal penyesuaian pendapatan'
        ]
      },
      {
        pattern: /pembelian|procurement|purchasing/i,
        causes: [
          'Prosedur pemilihan vendor tidak kompetitif',
          'Batas wewenang persetujuan pembelian tidak ditegakkan',
          'Tidak ada validasi tiga arah (PO, receiving, invoice)'
        ]
      }
    ];
  }

  /**
   * a. Hitung Risk Level dari impact dan likelihood
   * @param {string} impact - Impact level
   * @param {string} likelihood - Likelihood level
   * @returns {{ score: number, level: string, color: string }}
   */
  calculateRiskLevel(impact, likelihood) {
    const impactScore = IMPACT_SCORES[impact] || 3;
    const likelihoodScore = LIKELIHOOD_SCORES[likelihood] || 3;
    const riskScore = impactScore * likelihoodScore;
    
    // Find risk level based on score
    let riskLevel = 'medium';
    let color = '#d69e2e';
    
    for (const threshold of RISK_THRESHOLDS) {
      if (riskScore <= threshold.max) {
        riskLevel = threshold.level;
        color = threshold.color;
        break;
      }
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      color: color,
      impactScore,
      likelihoodScore
    };
  }

  /**
   * b. Hitung Confidence Score
   * @param {Object} wcgwEntry - WCGW entry
   * @param {number} baseScore - Base score from pattern matching (0-100)
   * @param {boolean} [auditorOverride] - Whether auditor manually set the score
   * @returns {{ score: number, level: string, explanation: string }}
   */
  calculateConfidenceScore(wcgwEntry, baseScore, auditorOverride = false) {
    let score = baseScore;
    let level = '';
    let explanation = '';
    
    if (auditorOverride) {
      // Override = 100 (auditor confirmed)
      score = 100;
      level = 'confirmed';
      explanation = 'Dikonfirmasi oleh auditor';
    } else if (score >= 90) {
      level = 'curated';
      explanation = 'Match dengan template terkurasi';
    } else if (score >= 60) {
      level = 'keyword';
      explanation = 'Match berdasarkan keyword pattern';
    } else {
      level = 'fallback';
      explanation = 'Identifikasi fallback (confidence rendah)';
    }
    
    return {
      score: Math.min(score, 100),
      level,
      explanation
    };
  }

  /**
   * c. Draft Root Cause otomatis
   * @param {string} nodeLabel - Label dari node flowchart
   * @param {string} wcgwDescription - Deskripsi WCGW
   * @returns {{ draft: string, isDraft: boolean, alternatives: string[] }}
   */
  generateRootCauseDraft(nodeLabel, wcgwDescription) {
    const combinedText = `${nodeLabel} ${wcgwDescription}`.toLowerCase();
    const alternatives = [];
    let primaryCause = 'Penyebab belum teridentifikasi secara spesifik. Perlu review lebih lanjut oleh auditor.';
    
    for (const template of this.rootCauseTemplates) {
      if (template.pattern.test(combinedText)) {
        // Get first cause as primary, rest as alternatives
        primaryCause = template.causes[0];
        alternatives.push(...template.causes.slice(1));
        break;
      }
    }
    
    // If no pattern matched, use generic causes based on node type
    if (alternatives.length === 0) {
      alternatives.push(
        'Kurangnya dokumentasi prosedur yang jelas',
        'Pelatihan karyawan yang tidak memadai',
        'Sistem kontrol yang tidak terautomasi'
      );
    }
    
    return {
      draft: primaryCause,
      isDraft: true,
      alternatives
    };
  }

  /**
   * e. Hitung Control Gap
   * @param {Object} existingControl - Existing control yang diisi auditor
   * @param {Object} idealControl - Ideal control dari knowledge base
   * @returns {{ gap: 'none' | 'partial' | 'significant', explanation: string, recommendations: string[] }}
   */
  calculateControlGap(existingControl, idealControl) {
    if (!existingControl || !existingControl.description) {
      return {
        gap: 'significant',
        explanation: 'Tidak ada kontrol yang diimplementasikan',
        recommendations: [
          'Segera implementasikan kontrol yang sesuai',
          'Dokumentasikan prosedur kontrol',
          'Tetapkan pemilik kontrol yang jelas'
        ]
      };
    }
    
    let gapScore = 0;
    const recommendations = [];
    
    // Check design effectiveness
    if (!existingControl.designEffective) {
      gapScore += 2;
      recommendations.push('Perbaiki desain kontrol agar lebih efektif');
    }
    
    // Check operating effectiveness
    if (!existingControl.operatingEffective) {
      gapScore += 2;
      recommendations.push('Tingkatkan pelaksanaan kontrol secara konsisten');
    }
    
    // Check frequency
    if (!existingControl.frequency || existingControl.frequency === 'ad-hoc') {
      gapScore += 1;
      recommendations.push('Tetapkan frekuensi pelaksanaan yang teratur');
    }
    
    // Check owner
    if (!existingControl.owner) {
      gapScore += 1;
      recommendations.push('Tetapkan pemilik kontrol yang bertanggung jawab');
    }
    
    // Compare with ideal control if available
    if (idealControl) {
      if (existingControl.type !== idealControl.type) {
        gapScore += 1;
        recommendations.push(`Pertimbangkan kontrol tipe ${idealControl.type}`);
      }
    }
    
    // Determine gap level
    let gap = 'none';
    let explanation = 'Kontrol sudah memadai';
    
    if (gapScore >= 4) {
      gap = 'significant';
      explanation = 'Terdapat kesenjangan signifikan dalam implementasi kontrol';
    } else if (gapScore >= 2) {
      gap = 'partial';
      explanation = 'Kontrol ada tetapi belum sepenuhnya memadai';
    }
    
    return {
      gap,
      explanation,
      recommendations
    };
  }

  /**
   * Get risk matrix visualization data
   * @returns {Array}
   */
  getRiskMatrix() {
    const matrix = [];
    
    const impacts = Object.keys(IMPACT_SCORES);
    const likelihoods = Object.keys(LIKELIHOOD_SCORES);
    
    impacts.forEach(impact => {
      likelihoods.forEach(likelihood => {
        const result = this.calculateRiskLevel(impact, likelihood);
        matrix.push({
          impact,
          likelihood,
          ...result
        });
      });
    });
    
    return matrix;
  }
}

// Export singleton
export const riskEngine = new RiskEngine();
export { RiskEngine };
