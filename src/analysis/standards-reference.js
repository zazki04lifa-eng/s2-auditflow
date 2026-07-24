/**
 * AuditFlow AI - Standards Reference Lookup Table
 * f. Referensi Standar (COSO + ISA/SA) per tipe kontrol/prosedur
 */

/**
 * @typedef {Object} StandardReference
 * @property {string} code - Standard code (e.g., "SA 315")
 * @property {string} name - Standard name
 * @property {string} description - Brief description
 * @property {string[]} applicableControls - Control types this applies to
 */

/**
 * @typedef {Object} ControlTemplate
 * @property {string} type - Control type
 * @property {string} description - Description
 * @property {StandardReference} standard - Related standard
 * @property {string[]} procedures - Sample procedures
 */

const STANDARDS_REFERENCE = {
  // SA (Standar Audit) - Indonesia adoption of ISA
  'SA 200': {
    code: 'SA 200',
    name: 'Tujuan dan Prinsip Umum Audit',
    description: 'Prinsip dasar audit laporan keuangan',
    applicableControls: ['general', 'overall']
  },
  'SA 240': {
    code: 'SA 240',
    name: 'Tanggung Jawab Auditor Terkait Kecurangan',
    description: 'Pertimbangan kecurangan dalam audit',
    applicableControls: ['fraud', 'segregation', 'authorization']
  },
  'SA 250': {
    code: 'SA 250',
    name: 'Pertimbangan atas Hukum dan Peraturan',
    description: 'Kepatuhan terhadap hukum dan peraturan',
    applicableControls: ['compliance', 'regulatory']
  },
  'SA 300': {
    code: 'SA 300',
    name: 'Perencanaan Audit',
    description: 'Perencanaan audit laporan keuangan',
    applicableControls: ['planning', 'overall']
  },
  'SA 315': {
    code: 'SA 315',
    name: 'Identifikasi dan Penilaian Risiko',
    description: 'Memahami entitas dan lingkungannya',
    applicableControls: ['risk-assessment', 'control-environment', 'monitoring']
  },
  'SA 320': {
    code: 'SA 320',
    name: 'Materialitas dalam Perencanaan dan Pelaksanaan Audit',
    description: 'Penentuan materialitas',
    applicableControls: ['review', 'approval']
  },
  'SA 330': {
    code: 'SA 330',
    name: 'Tanggapan atas Risiko yang Dinilai',
    description: 'Prosedur audit sebagai tanggapan atas risiko',
    applicableControls: ['substantive', 'test-of-controls']
  },
  'SA 402': {
    code: 'SA 402',
    name: 'Pertimbangan Audit atas Entitas yang Menggunakan Jasa Organisasi Pemberi Jasa',
    description: 'Audit atas pihak ketiga',
    applicableControls: ['outsourcing', 'vendor']
  },
  'SA 500': {
    code: 'SA 500',
    name: 'Bukti Audit',
    description: 'Kecukupan dan ketepatan bukti audit',
    applicableControls: ['documentation', 'evidence', 'reconciliation']
  },
  'SA 501': {
    code: 'SA 501',
    name: 'Bukti Audit - Pertimbangan Khusus',
    description: 'Bukti audit untuk item tertentu',
    applicableControls: ['inventory', 'receivables']
  },
  'SA 505': {
    code: 'SA 505',
    name: 'Konfirmasi Eksternal',
    description: 'Prosedur konfirmasi',
    applicableControls: ['confirmation', 'receivables', 'payables']
  },
  'SA 520': {
    code: 'SA 520',
    name: 'Prosedur Analitis',
    description: 'Penggunaan prosedur analitis',
    applicableControls: ['analytical', 'review']
  },
  'SA 530': {
    code: 'SA 530',
    name: 'Sampling Audit',
    description: 'Pengambilan sampel dalam audit',
    applicableControls: ['sampling', 'testing']
  },
  'SA 540': {
    code: 'SA 540',
    name: 'Audit atas Estimasi Akuntansi',
    description: 'Nilai wajar dan estimasi',
    applicableControls: ['valuation', 'estimates']
  },
  'SA 550': {
    code: 'SA 550',
    name: 'Pihak-pihak yang Mempunyai Hubungan Istimewa',
    description: 'Transaksi dengan pihak berelasi',
    applicableControls: ['related-party', 'disclosure']
  },
  'SA 560': {
    code: 'SA 560',
    name: 'Peristiwa Setelah Tanggal Neraca',
    description: 'Peristiwa setelah periode laporan',
    applicableControls: ['subsequent-events', 'cut-off']
  },
  'SA 570': {
    code: 'SA 570',
    name: 'Kelangsungan Usaha',
    description: 'Asumsi going concern',
    applicableControls: ['going-concern', 'financial-health']
  },
  'SA 580': {
    code: 'SA 580',
    name: 'Pernyataan Tertulis',
    description: 'Representasi manajemen',
    applicableControls: ['management-representation', 'confirmation']
  },
  'SA 600': {
    code: 'SA 600',
    name: 'Menggunakan Pekerjaan Auditor Internal',
    description: 'Pemanfaatan fungsi audit internal',
    applicableControls: ['internal-audit', 'reliance']
  },
  'SA 700': {
    code: 'SA 700',
    name: 'Membentuk Opini dan Melaporkan atas Laporan Keuangan',
    description: 'Opini auditor',
    applicableControls: ['reporting', 'opinion']
  }
};

// COSO Components
const COSO_COMPONENTS = {
  'control-environment': {
    name: 'Lingkungan Pengendalian',
    description: 'Tone at the top, integritas, nilai etika',
    standards: ['SA 315']
  },
  'risk-assessment': {
    name: 'Penilaian Risiko',
    description: 'Identifikasi dan analisis risiko',
    standards: ['SA 315']
  },
  'control-activities': {
    name: 'Aktivitas Pengendalian',
    description: 'Kebijakan dan prosedur pengendalian',
    standards: ['SA 330']
  },
  'information-communication': {
    name: 'Informasi dan Komunikasi',
    description: 'Sistem informasi dan komunikasi',
    standards: ['SA 315']
  },
  'monitoring': {
    name: 'Aktivitas Pemantauan',
    description: 'Pemantauan berkelanjutan',
    standards: ['SA 315', 'SA 600']
  }
};

// Control type templates
const CONTROL_TEMPLATES = {
  preventive: {
    type: 'preventive',
    description: 'Mencegah terjadinya kesalahan atau kecurangan',
    examples: [
      'Persetujuan sebelum transaksi',
      'Pembatasan akses sistem',
      'Segregasi tugas'
    ],
    typicalFrequency: 'Per transaksi',
    standards: ['SA 315', 'SA 330']
  },
  detective: {
    type: 'detective',
    description: 'Mendeteksi kesalahan atau kecurangan yang telah terjadi',
    examples: [
      'Rekonsiliasi',
      'Review laporan',
      'Analisis varians'
    ],
    typicalFrequency: 'Bulanan/Triwulanan',
    standards: ['SA 520', 'SA 500']
  },
  corrective: {
    type: 'corrective',
    description: 'Memperbaiki kesalahan yang terdeteksi',
    examples: [
      'Jurnal penyesuaian',
      'Prosedur perbaikan',
      'Tindak lanjut temuan'
    ],
    typicalFrequency: 'As needed',
    standards: ['SA 560']
  }
};

// Assertion types with related procedures
const ASSERTION_TEMPLATES = {
  occurrence: {
    name: 'Occurrence (Terjadi)',
    description: 'Transaksi dan peristiwa yang dicatat benar-benar telah terjadi',
    typicalProcedures: [
      'Vouch dari jurnal ke dokumen pendukung',
      'Konfirmasi dengan pihak eksternal',
      'Inspeksi dokumen fisik'
    ],
    standards: ['SA 500', 'SA 505']
  },
  completeness: {
    name: 'Completeness (Lengkap)',
    description: 'Semua transaksi dan akun yang harus disajikan telah disertakan',
    typicalProcedures: [
      'Trace dari dokumen sumber ke jurnal',
      'Prosedur analitis untuk kelengkapan',
      'Review cut-off'
    ],
    standards: ['SA 500', 'SA 560']
  },
  accuracy: {
    name: 'Accuracy (Akurat)',
    description: 'Jumlah dan data lain telah dicatat secara akurat',
    typicalProcedures: [
      'Rekalkulasi',
      'Review bukti pendukung',
      'Prosedur analitis'
    ],
    standards: ['SA 500', 'SA 520']
  },
  cutoff: {
    name: 'Cutoff (Tepat Waktu)',
    description: 'Transaksi dicatat pada periode akuntansi yang benar',
    typicalProcedures: [
      'Test cut-off penjualan/pembelian',
      'Review dokumen pengiriman',
      'Analisis transaksi setelah tanggal neraca'
    ],
    standards: ['SA 501', 'SA 560']
  },
  classification: {
    name: 'Classification (Klasifikasi)',
    description: 'Transaksi dicatat dalam akun yang tepat',
    typicalProcedures: [
      'Review chart of accounts',
      'Test klasifikasi transaksi',
      'Review pengungkapan'
    ],
    standards: ['SA 500']
  },
  existence: {
    name: 'Existence (Eksistensi)',
    description: 'Aset, liabilitas, dan ekuitas benar-benar ada',
    typicalProcedures: [
      'Observasi fisik',
      'Konfirmasi',
      'Inspeksi dokumen'
    ],
    standards: ['SA 500', 'SA 501', 'SA 505']
  },
  rights: {
    name: 'Rights & Obligations (Hak & Kewajiban)',
    description: 'Entitas memiliki hak atas aset dan kewajiban atas liabilitas',
    typicalProcedures: [
      'Review dokumen kepemilikan',
      'Konfirmasi hukum',
      'Review perjanjian'
    ],
    standards: ['SA 500', 'SA 550']
  },
  valuation: {
    name: 'Valuation (Penilaian)',
    description: 'Aset, liabilitas, dan ekuitas dinilai dengan tepat',
    typicalProcedures: [
      'Review metode penilaian',
      'Test perhitungan',
      'Review asumsi manajemen'
    ],
    standards: ['SA 540', 'SA 520']
  }
};

class StandardsReference {
  /**
   * Get standard by code
   * @param {string} code
   * @returns {StandardReference|null}
   */
  getStandard(code) {
    return STANDARDS_REFERENCE[code] || null;
  }

  /**
   * Get standards applicable to a control type
   * @param {string} controlType
   * @returns {StandardReference[]}
   */
  getStandardsForControl(controlType) {
    return Object.values(STANDARDS_REFERENCE).filter(std =>
      std.applicableControls.some(ac => ac.toLowerCase().includes(controlType.toLowerCase()))
    );
  }

  /**
   * Get COSO component info
   * @param {string} componentKey
   * @returns {Object|null}
   */
  getCOSOComponent(componentKey) {
    return COSO_COMPONENTS[componentKey] || null;
  }

  /**
   * Get control template by type
   * @param {string} type
   * @returns {Object|null}
   */
  getControlTemplate(type) {
    return CONTROL_TEMPLATES[type] || null;
  }

  /**
   * Get assertion template by type
   * @param {string} type
   * @returns {Object|null}
   */
  getAssertionTemplate(type) {
    return ASSERTION_TEMPLATES[type] || null;
  }

  /**
   * Get all assertions
   * @returns {Object}
   */
  getAllAssertions() {
    return ASSERTION_TEMPLATES;
  }

  /**
   * Get recommended procedures for an assertion
   * @param {string} assertionType
   * @returns {string[]}
   */
  getRecommendedProcedures(assertionType) {
    const assertion = this.getAssertionTemplate(assertionType);
    return assertion ? assertion.typicalProcedures : [];
  }

  /**
   * Get standard references for a procedure
   * @param {string} procedureType
   * @returns {string[]}
   */
  getStandardsForProcedure(procedureType) {
    const procedureMap = {
      'vouch': ['SA 500'],
      'trace': ['SA 500'],
      'confirmation': ['SA 505'],
      'observation': ['SA 500', 'SA 501'],
      'inspection': ['SA 500'],
      'recalculation': ['SA 500'],
      'analytical': ['SA 520'],
      'inquiry': ['SA 500'],
      'reperformance': ['SA 330']
    };
    return procedureMap[procedureType.toLowerCase()] || ['SA 500'];
  }
}

// Export singleton
export const standardsReference = new StandardsReference();
export { STANDARDS_REFERENCE, COSO_COMPONENTS, CONTROL_TEMPLATES, ASSERTION_TEMPLATES };
