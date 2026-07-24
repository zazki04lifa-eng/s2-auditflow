/**
 * AuditFlow AI - Parser Module
 * Parser input teks natural language untuk ekstraksi entitas audit
 */

/**
 * @typedef {Object} ParsedProcess
 * @property {string} name - Nama proses
 * @property {string[]} steps - Langkah-langkah proses
 * @property {string[]} risks - Risiko yang teridentifikasi
 * @property {string[]} controls - Kontrol yang disebutkan
 * @property {string} industry - Industri yang terdeteksi
 * @property {string} area - Area audit
 */

/**
 * @typedef {Object} EntityMatch
 * @property {string} type - Tipe entitas (risk, control, process, etc)
 * @property {string} text - Teks yang cocok
 * @property {number} confidence - Skor kepercayaan
 * @property {number} start - Posisi awal
 * @property {number} end - Posisi akhir
 */

class AuditParser {
  constructor() {
    // Keywords untuk identifikasi entitas
    this.riskKeywords = [
      'risiko', 'bahaya', 'ancaman', 'kerugian', 'fraud', 'kecurangan',
      'kesalahan', 'error', 'weakness', 'kelemahan', 'gap', 'celah'
    ];
    
    this.controlKeywords = [
      'kontrol', 'pengendalian', 'control', 'pemeriksaan', 'review',
      'persetujuan', 'approval', 'otorisasi', 'authorization', 'rekonsiliasi',
      'validasi', 'validasi', 'verifikasi', 'pembatasan', 'akses'
    ];
    
    this.processKeywords = [
      'proses', 'langkah', 'tahap', 'aktivitas', 'kegiatan', 'prosedur',
      'mulai', 'akhir', 'kemudian', 'setelah', 'sebelum', 'saat'
    ];
    
    this.industryPatterns = [
      { pattern: /manufaktur|pabrik|produksi/i, industry: 'Manufaktur' },
      { pattern: /retail|dagangan|toko|penjualan/i, industry: 'Retail' },
      { pattern: /jasa|layanan|service|konsultan/i, industry: 'Jasa' },
      { pattern: /keuangan|bank|asuransi|finansial/i, industry: 'Keuangan' },
      { pattern: /kesehatan|rumah sakit|medis|klini/i, industry: 'Kesehatan' }
    ];
    
    this.areaPatterns = [
      { pattern: /pendapatan|penjualan|revenue|sales/i, area: 'Pendapatan' },
      { pattern: /pembelian|procurement|purchasing|pembelian/i, area: 'Pembelian' },
      { pattern: /persediaan|inventory|stok|gudang/i, area: 'Persediaan' },
      { pattern: /kas|cash|treasury|bendahara/i, area: 'Kas' },
      { pattern: /aset tetap|fixed asset|properti/i, area: 'Aset Tetap' },
      { pattern: /utang|liabilitas|kewajiban/i, area: 'Utang' }
    ];
  }

  /**
   * Parse teks input dan ekstrak entitas audit
   * @param {string} text - Teks input dari user
   * @returns {ParsedProcess} Hasil parsing
   */
  parse(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text is required');
    }

    const normalizedText = text.toLowerCase().trim();
    
    // Ekstrak entitas
    const risks = this.extractRisks(text);
    const controls = this.extractControls(text);
    const steps = this.extractSteps(text);
    const industry = this.detectIndustry(text);
    const area = this.detectArea(text);
    
    // Generate nama proses dari area dan industry
    const name = this.generateProcessName(area, industry, text);
    
    return {
      name,
      steps,
      risks,
      controls,
      industry,
      area
    };
  }

  /**
   * Ekstrak risiko dari teks
   * @param {string} text 
   * @returns {string[]}
   */
  extractRisks(text) {
    const risks = [];
    const sentences = this.splitSentences(text);
    
    for (const sentence of sentences) {
      const hasRiskKeyword = this.riskKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (hasRiskKeyword) {
        // Bersihkan dan tambahkan
        const cleanedRisk = sentence.trim();
        if (cleanedRisk.length > 10) { // Minimal 10 karakter
          risks.push(cleanedRisk);
        }
      }
    }
    
    // Jika tidak ada risiko teridentifikasi, gunakan heuristic
    if (risks.length === 0) {
      const potentialRisks = this.identifyPotentialRisks(text);
      risks.push(...potentialRisks);
    }
    
    return risks.slice(0, 10); // Max 10 risiko
  }

  /**
   * Ekstrak kontrol dari teks
   * @param {string} text 
   * @returns {string[]}
   */
  extractControls(text) {
    const controls = [];
    const sentences = this.splitSentences(text);
    
    for (const sentence of sentences) {
      const hasControlKeyword = this.controlKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (hasControlKeyword) {
        const cleanedControl = sentence.trim();
        if (cleanedControl.length > 10) {
          controls.push(cleanedControl);
        }
      }
    }
    
    return controls.slice(0, 10); // Max 10 kontrol
  }

  /**
   * Ekstrak langkah-langkah proses
   * @param {string} text 
   * @returns {string[]}
   */
  extractSteps(text) {
    const steps = [];
    const sentences = this.splitSentences(text);
    
    // Cari kalimat yang menunjukkan urutan
    const sequenceIndicators = [
      'pertama', 'kedua', 'ketiga', 'keempat', 'kelima',
      'selanjutnya', 'kemudian', 'setelah itu', 'terakhir',
      'mulai dari', 'diawali', 'diakhiri'
    ];
    
    for (const sentence of sentences) {
      const hasSequence = sequenceIndicators.some(indicator => 
        sentence.toLowerCase().includes(indicator)
      );
      
      const hasProcessVerb = this.processKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (hasSequence || hasProcessVerb) {
        const cleanedStep = sentence.trim();
        if (cleanedStep.length > 5) {
          steps.push(cleanedStep);
        }
      }
    }
    
    // Jika tidak ada step teridentifikasi, coba ekstrak dari verbs
    if (steps.length === 0) {
      const verbs = this.extractProcessVerbs(text);
      steps.push(...verbs);
    }
    
    return steps.slice(0, 15); // Max 15 steps
  }

  /**
   * Deteksi industri dari teks
   * @param {string} text 
   * @returns {string}
   */
  detectIndustry(text) {
    for (const { pattern, industry } of this.industryPatterns) {
      if (pattern.test(text)) {
        return industry;
      }
    }
    return 'Umum';
  }

  /**
   * Deteksi area audit dari teks
   * @param {string} text 
   * @returns {string}
   */
  detectArea(text) {
    for (const { pattern, area } of this.areaPatterns) {
      if (pattern.test(text)) {
        return area;
      }
    }
    return 'Umum';
  }

  /**
   * Generate nama proses dari informasi yang tersedia
   * @param {string} area 
   * @param {string} industry 
   * @param {string} text 
   * @returns {string}
   */
  generateProcessName(area, industry, text) {
    // Coba ekstrak nama perusahaan
    const companyMatch = text.match(/PT\s+([A-Za-z\s]+)/i);
    const company = companyMatch ? companyMatch[1].trim() : null;
    
    if (company) {
      return `Audit ${area} - PT ${company}`;
    }
    
    return `Audit ${area} - ${industry}`;
  }

  /**
   * Split teks menjadi kalimat
   * @param {string} text 
   * @returns {string[]}
   */
  splitSentences(text) {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Identifikasi risiko potensial menggunakan heuristic
   * @param {string} text 
   * @returns {string[]}
   */
  identifyPotentialRisks(text) {
    const potentialRisks = [];
    
    // Pola umum risiko
    const riskPatterns = [
      /tidak\s+(tercatat|dicatat|diverifikasi|disetujui)/i,
      /kesalahan\s+(dalam|pada)/i,
      /kurangnya\s+(kontrol|pengawasan)/i,
      /rentan\s+terhadap/i,
      /dapat\s+menyebabkan/i
    ];
    
    const sentences = this.splitSentences(text);
    for (const sentence of sentences) {
      for (const pattern of riskPatterns) {
        if (pattern.test(sentence)) {
          potentialRisks.push(sentence.trim());
          break;
        }
      }
    }
    
    return potentialRisks;
  }

  /**
   * Ekstrak kata kerja proses dari teks
   * @param {string} text 
   * @returns {string[]}
   */
  extractProcessVerbs(text) {
    const verbs = [];
    const processVerbs = [
      'menerima', 'mengirim', 'membuat', 'menyetujui', 'memeriksa',
      'mencatat', 'menghitung', 'membayar', 'menagih', 'memproses'
    ];
    
    const sentences = this.splitSentences(text);
    for (const sentence of sentences) {
      for (const verb of processVerbs) {
        if (sentence.toLowerCase().includes(verb)) {
          verbs.push(sentence.trim());
          break;
        }
      }
    }
    
    return verbs;
  }
}

// Export instance dan class
export const parser = new AuditParser();
export { AuditParser };
