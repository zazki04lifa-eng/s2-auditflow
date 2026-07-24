/**
 * AuditFlow AI - Working Paper Generator
 * g. Rakit 8 section working paper dari data analisis
 */

import { riskEngine } from './risk-engine.js';
import { standardsReference } from './standards-reference.js';

/**
 * @typedef {Object} WorkingPaperData
 * @property {Object} project - Project info
 * @property {import('../types/index.js').FlowchartData} flowchartData
 * @property {import('../types/index.js').WcgwEntry[]} wcgwEntries
 * @property {Object} auditorInput - Data yang diisi auditor
 */

/**
 * @typedef {Object} WorkingPaperSection
 * @property {string} title
 * @property {Object} content
 * @property {string} status - 'draft' | 'reviewed' | 'confirmed'
 */

class WorkingPaperGenerator {
  constructor() {
    this.sections = [];
  }

  /**
   * Generate complete 8-section working paper
   * @param {WorkingPaperData} data
   * @returns {WorkingPaperSection[]}
   */
  generate(data) {
    const { project, flowchartData, wcgwEntries, auditorInput = {} } = data;
    
    // Enhance WCGW entries with analysis
    const enhancedWcgw = this.enhanceWcgwEntries(wcgwEntries, auditorInput);
    
    // Generate all 8 sections
    this.sections = [
      this.generateExecutiveSummary(project, enhancedWcgw, flowchartData),
      this.generateRiskSection(enhancedWcgw),
      this.generateControlSection(enhancedWcgw, auditorInput),
      this.generateAssertionSection(enhancedWcgw),
      this.generateAuditResponseSection(enhancedWcgw),
      this.generateAuditProcedureSection(enhancedWcgw),
      this.generateRecommendationSection(enhancedWcgw),
      this.generateConclusionSection(project, enhancedWcgw)
    ];
    
    return this.sections;
  }

  /**
   * Enhance WCGW entries with calculated fields
   */
  enhanceWcgwEntries(wcgwEntries, auditorInput) {
    return wcgwEntries.map(entry => {
      const enhanced = { ...entry };
      
      // a. Calculate risk level
      enhanced.riskCalculation = riskEngine.calculateRiskLevel(
        entry.impact,
        entry.likelihood
      );
      
      // b. Calculate confidence score
      const baseScore = entry.confidenceScore || 70;
      const auditorConfirmed = auditorInput.confirmedWcgw?.includes(entry.id);
      enhanced.confidenceCalculation = riskEngine.calculateConfidenceScore(
        entry,
        baseScore,
        auditorConfirmed
      );
      
      // c. Generate/enhance root cause
      if (!enhanced.rootCauseDraft) {
        enhanced.rootCause = riskEngine.generateRootCauseDraft(
          entry.description,
          entry.description
        );
      } else {
        enhanced.rootCause = {
          draft: enhanced.rootCauseDraft,
          isDraft: true,
          alternatives: []
        };
      }
      
      // d. Existing control (auditor-filled)
      enhanced.existingControl = auditorInput.existingControls?.[entry.id] || null;
      
      // e. Control gap
      if (enhanced.existingControl) {
        enhanced.controlGap = riskEngine.calculateControlGap(
          enhanced.existingControl,
          null // TODO: Get ideal control from knowledge base
        );
      }
      
      return enhanced;
    });
  }

  /**
   * Section 1: Executive Summary
   */
  generateExecutiveSummary(project, enhancedWcgw, flowchartData) {
    const totalRisks = enhancedWcgw.length;
    const highRisks = enhancedWcgw.filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical').length;
    const mediumRisks = enhancedWcgw.filter(w => w.riskCalculation?.level === 'medium').length;
    const lowRisks = enhancedWcgw.filter(w => w.riskCalculation?.level === 'low').length;
    
    return {
      id: 'executive-summary',
      title: 'Executive Summary',
      status: 'draft',
      content: {
        overview: `Audit atas ${project.area || 'proses'} PT ${project.client || 'Klien'} mengidentifikasi ${totalRisks} risiko potensial yang memerlukan perhatian. Dari jumlah tersebut, ${highRisks} risiko dikategorikan tinggi/kritis, ${mediumRisks} risiko medium, dan ${lowRisks} risiko rendah.`,
        keyRisks: enhancedWcgw
          .filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical')
          .slice(0, 3)
          .map(w => w.description)
          .join('; '),
        riskDistribution: {
          critical: enhancedWcgw.filter(w => w.riskCalculation?.level === 'critical').length,
          high: enhancedWcgw.filter(w => w.riskCalculation?.level === 'high').length,
          medium: mediumRisks,
          low: lowRisks
        },
        recommendations: this.getTopRecommendations(enhancedWcgw),
        conclusion: `Berdasarkan analisis risiko, diperlukan ${highRisks > 0 ? 'prosedur substantif yang diperluas' : 'prosedur audit standar'} untuk area ${project.area || 'ini'}.`,
        flowchartSummary: {
          totalNodes: flowchartData.nodes.length,
          totalEdges: flowchartData.edges.length,
          totalLanes: flowchartData.lanes.length
        }
      }
    };
  }

  /**
   * Section 2: Risk Assessment
   */
  generateRiskSection(enhancedWcgw) {
    const risks = enhancedWcgw.map((w, idx) => ({
      id: `risk-${idx + 1}`,
      description: w.description,
      category: w.category || 'Umum',
      level: w.riskCalculation?.level || 'medium',
      score: w.riskCalculation?.score || 9,
      impact: w.impact,
      likelihood: w.likelihood,
      confidenceScore: w.confidenceCalculation?.score || 70,
      confidenceLevel: w.confidenceCalculation?.level || 'keyword',
      nodeReference: w.nodeId,
      isDraft: w.confidenceCalculation?.level !== 'confirmed'
    }));
    
    // Sort by risk score (highest first)
    risks.sort((a, b) => b.score - a.score);
    
    return {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      status: 'draft',
      content: {
        risks,
        summary: {
          total: risks.length,
          byLevel: {
            critical: risks.filter(r => r.level === 'critical').length,
            high: risks.filter(r => r.level === 'high').length,
            medium: risks.filter(r => r.level === 'medium').length,
            low: risks.filter(r => r.level === 'low').length
          }
        },
        riskMatrix: riskEngine.getRiskMatrix()
      }
    };
  }

  /**
   * Section 3: Control Assessment
   */
  generateControlSection(enhancedWcgw, auditorInput) {
    const controls = enhancedWcgw.map((w, idx) => ({
      id: `control-${idx + 1}`,
      wcgwId: w.id,
      existingControl: w.existingControl ? {
        description: w.existingControl.description,
        type: w.existingControl.type || 'manual',
        frequency: w.existingControl.frequency || 'periodic',
        owner: w.existingControl.owner || 'Unassigned',
        designEffective: w.existingControl.designEffective || false,
        operatingEffective: w.existingControl.operatingEffective || false,
        isAuditorFilled: true
      } : null,
      controlGap: w.controlGap || {
        gap: 'unknown',
        explanation: 'Belum dievaluasi',
        recommendations: []
      },
      idealControl: this.getIdealControl(w)
    }));
    
    return {
      id: 'control-assessment',
      title: 'Control Assessment',
      status: 'draft',
      content: {
        controls,
        summary: {
          total: controls.length,
          withExistingControl: controls.filter(c => c.existingControl).length,
          withGap: controls.filter(c => c.controlGap.gap !== 'none').length
        }
      }
    };
  }

  /**
   * Section 4: Assertion Analysis
   */
  generateAssertionSection(enhancedWcgw) {
    const assertions = [];
    const assertionTypes = Object.keys(standardsReference.getAllAssertions());
    
    // Map risks to relevant assertions
    enhancedWcgw.forEach(w => {
      const relevantAssertions = this.determineRelevantAssertions(w);
      
      relevantAssertions.forEach(assertionType => {
        const template = standardsReference.getAssertionTemplate(assertionType);
        if (template) {
          assertions.push({
            id: `assertion-${assertionType}-${w.nodeId}`,
            type: assertionType,
            name: template.name,
            description: template.description,
            relevantRisks: [w.id],
            auditResponse: this.getAssertionResponse(assertionType, w),
            procedures: standardsReference.getRecommendedProcedures(assertionType),
            standards: template.standards
          });
        }
      });
    });
    
    // Group by assertion type
    const groupedAssertions = {};
    assertions.forEach(a => {
      if (!groupedAssertions[a.type]) {
        groupedAssertions[a.type] = {
          ...a,
          relevantRisks: []
        };
      }
      groupedAssertions[a.type].relevantRisks.push(...a.relevantRisks);
    });
    
    return {
      id: 'assertion-analysis',
      title: 'Assertion Analysis',
      status: 'draft',
      content: {
        assertions: Object.values(groupedAssertions),
        assertionTypes: assertionTypes.map(type => ({
          type,
          ...standardsReference.getAssertionTemplate(type)
        }))
      }
    };
  }

  /**
   * Section 5: Audit Response
   */
  generateAuditResponseSection(enhancedWcgw) {
    const responses = [];
    
    // High risks need substantive procedures
    const highRisks = enhancedWcgw.filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical');
    if (highRisks.length > 0) {
      responses.push({
        id: 'response-1',
        type: 'substantive',
        description: 'Melakukan prosedur substantif yang diperluas untuk risiko tinggi',
        risks: highRisks.map(w => w.id),
        procedures: [
          'Test detail atas transaksi signifikan',
          'Konfirmasi dengan pihak eksternal',
          'Prosedur analitis substantif'
        ]
      });
    }
    
    // All risks need some control testing
    if (enhancedWcgw.some(w => w.existingControl)) {
      responses.push({
        id: 'response-2',
        type: 'test-of-controls',
        description: 'Menguji efektivitas operasional kontrol',
        risks: enhancedWcgw.filter(w => w.existingControl).map(w => w.id),
        procedures: [
          'Inquiry dengan pemilik kontrol',
          'Observasi pelaksanaan kontrol',
          'Inspeksi dokumentasi',
          'Reperformance kontrol'
        ]
      });
    }
    
    return {
      id: 'audit-response',
      title: 'Audit Response',
      status: 'draft',
      content: {
        responses,
        overallStrategy: highRisks.length > 0 ? 'Combined approach with emphasis on substantive procedures' : 'Primarily substantive approach'
      }
    };
  }

  /**
   * Section 6: Audit Procedures
   */
  generateAuditProcedureSection(enhancedWcgw) {
    const procedures = [];
    let procId = 1;
    
    enhancedWcgw.forEach(w => {
      const relevantAssertions = this.determineRelevantAssertions(w);
      
      relevantAssertions.forEach(assertionType => {
        const templateProcedures = standardsReference.getRecommendedProcedures(assertionType);
        
        templateProcedures.forEach(proc => {
          procedures.push({
            id: `procedure-${procId++}`,
            assertionType,
            description: proc,
            riskId: w.id,
            nature: this.determineNature(assertionType),
            timing: 'Interim',
            extent: 'Sample-based',
            sampleSize: this.calculateSampleSize(w.riskCalculation?.level),
            standards: standardsReference.getStandardsForProcedure(proc.split(' ')[0])
          });
        });
      });
    });
    
    return {
      id: 'audit-procedures',
      title: 'Audit Procedures',
      status: 'draft',
      content: {
        procedures,
        summary: {
          total: procedures.length,
          byNature: {
            testOfDetails: procedures.filter(p => p.nature === 'Test of details').length,
            substantiveAnalytical: procedures.filter(p => p.nature === 'Substantive analytical').length,
            testOfControls: procedures.filter(p => p.nature === 'Test of controls').length
          }
        }
      }
    };
  }

  /**
   * Section 7: Recommendations
   */
  generateRecommendationSection(enhancedWcgw) {
    const recommendations = [];
    let recId = 1;
    
    enhancedWcgw.forEach(w => {
      if (w.controlGap && w.controlGap.recommendations) {
        w.controlGap.recommendations.forEach(rec => {
          recommendations.push({
            id: `recommendation-${recId++}`,
            wcgwId: w.id,
            description: rec,
            priority: w.riskCalculation?.level === 'critical' ? 'High' : 
                      w.riskCalculation?.level === 'high' ? 'Medium' : 'Low',
            timeline: this.estimateTimeline(w.riskCalculation?.level),
            responsibleParty: 'Management',
            status: 'proposed'
          });
        });
      }
    });
    
    // Sort by priority
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return {
      id: 'recommendations',
      title: 'Recommendations',
      status: 'draft',
      content: {
        recommendations,
        summary: {
          total: recommendations.length,
          byPriority: {
            high: recommendations.filter(r => r.priority === 'High').length,
            medium: recommendations.filter(r => r.priority === 'Medium').length,
            low: recommendations.filter(r => r.priority === 'Low').length
          }
        }
      }
    };
  }

  /**
   * Section 8: Conclusion
   */
  generateConclusionSection(project, enhancedWcgw) {
    const highRisks = enhancedWcgw.filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical').length;
    const significantGaps = enhancedWcgw.filter(w => w.controlGap?.gap === 'significant').length;
    
    let conclusion = '';
    let opinion = 'unmodified';
    
    if (highRisks > 2 || significantGaps > 2) {
      conclusion = 'Ditemukan beberapa kelemahan signifikan dalam pengendalian internal yang memerlukan perhatian manajemen. Disarankan untuk melakukan perbaikan sebelum audit tahun berikutnya.';
      opinion = 'emphasis-of-matter';
    } else if (highRisks > 0 || significantGaps > 0) {
      conclusion = 'Terdapat beberapa area yang memerlukan perbaikan, namun secara keseluruhan pengendalian internal cukup memadai.';
      opinion = 'unmodified';
    } else {
      conclusion = 'Pengendalian internal atas proses ini dinilai memadai. Tidak ada temuan signifikan yang memerlukan perhatian khusus.';
      opinion = 'unmodified';
    }
    
    return {
      id: 'conclusion',
      title: 'Conclusion',
      status: 'draft',
      content: {
        conclusion,
        opinion,
        keyFindings: enhancedWcgw
          .filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical')
          .map(w => w.description),
        managementActions: enhancedWcgw
          .filter(w => w.controlGap?.recommendations)
          .flatMap(w => w.controlGap.recommendations)
          .slice(0, 5),
        followUpRequired: highRisks > 0 || significantGaps > 0,
        nextSteps: [
          'Review working paper dengan engagement partner',
          'Diskusikan temuan dengan manajemen',
          'Finalisasi audit procedures',
          'Dokumentasi bukti audit'
        ]
      }
    };
  }

  // Helper methods
  getIdealControl(wcgwEntry) {
    // TODO: Get from knowledge base
    return null;
  }

  determineRelevantAssertions(wcgwEntry) {
    const text = wcgwEntry.description.toLowerCase();
    
    if (text.includes('pendapatan') || text.includes('penjualan')) {
      return ['occurrence', 'completeness', 'accuracy', 'cutoff'];
    }
    if (text.includes('persediaan') || text.includes('aset')) {
      return ['existence', 'rights', 'valuation', 'completeness'];
    }
    if (text.includes('utang') || text.includes('kewajiban')) {
      return ['completeness', 'existence', 'valuation'];
    }
    if (text.includes('kas') || text.includes('pembayaran')) {
      return ['existence', 'occurrence', 'accuracy'];
    }
    
    return ['occurrence', 'completeness', 'accuracy'];
  }

  getAssertionResponse(assertionType, wcgwEntry) {
    const responses = {
      occurrence: 'Vouch transaksi ke dokumen pendukung',
      completeness: 'Trace dari dokumen sumber ke jurnal',
      accuracy: 'Rekalkulasi dan review bukti',
      cutoff: 'Test cut-off transaksi',
      classification: 'Review klasifikasi akun',
      existence: 'Konfirmasi dan observasi fisik',
      rights: 'Review dokumen kepemilikan',
      valuation: 'Review metode dan asumsi penilaian'
    };
    return responses[assertionType] || 'Prosedur audit standar';
  }

  determineNature(assertionType) {
    if (['occurrence', 'existence', 'rights'].includes(assertionType)) {
      return 'Test of details';
    }
    if (['completeness', 'accuracy', 'valuation'].includes(assertionType)) {
      return 'Substantive analytical';
    }
    return 'Test of controls';
  }

  calculateSampleSize(riskLevel) {
    const sizes = {
      critical: '40-60 items',
      high: '25-40 items',
      medium: '15-25 items',
      low: '5-15 items'
    };
    return sizes[riskLevel] || '10-20 items';
  }

  estimateTimeline(riskLevel) {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return 'Immediate (1-2 weeks)';
    }
    if (riskLevel === 'medium') {
      return 'Short-term (1-3 months)';
    }
    return 'Long-term (3-6 months)';
  }

  getTopRecommendations(enhancedWcgw) {
    return enhancedWcgw
      .filter(w => w.riskCalculation?.level === 'high' || w.riskCalculation?.level === 'critical')
      .slice(0, 3)
      .map(w => w.description);
  }
}

// Export singleton
export const workingPaperGenerator = new WorkingPaperGenerator();
export { WorkingPaperGenerator };
