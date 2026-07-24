/**
 * AuditFlow AI - Contoh Data Dummy
 * 2-3 contoh project lengkap untuk validasi schema
 */

import { Types } from './index.js';

/**
 * Contoh 1: Audit Sikap Pendapatan - PT Maju Jaya
 * Project lengkap dari input sampai analysis
 */
export const exampleProject1 = {
  id: 'proj-001',
  name: 'Audit Sikap Pendapatan - PT Maju Jaya',
  client: 'PT Maju Jaya',
  industry: 'Manufaktur',
  area: 'Pendapatan',
  auditor: 'John Doe, CPA',
  framework: 'SA 315 & SA 330',
  stage: 'analysis',
  sourceInput: {
    type: 'text',
    rawText: `PT Maju Jaya adalah perusahaan manufaktur dengan pendapatan tahunan Rp 500 miliar. 
    Proses pendapatan dimulai dari penerimaan pesanan pelanggan, persetujuan kredit, 
    pengiriman barang, hingga penagihan. Terdapat risiko pendapatan fiktif dan 
    pengakuan pendapatan yang tidak sesuai periode. Kontrol utama termasuk persetujuan 
    kredit oleh manajer keuangan dan rekonsiliasi harian antara dokumen pengiriman 
    dan faktur.`,
    fileName: 'brief_pendapatan.txt'
  },
  flowchartOptions: {
    orientation: 'vertical',
    style: 'swimlane',
    showWcgw: true
  },
  flowchartData: {
    lanes: [
      { id: 'lane-sales', name: 'Sales', order: 1 },
      { id: 'lane-credit', name: 'Credit', order: 2 },
      { id: 'lane-warehouse', name: 'Warehouse', order: 3 },
      { id: 'lane-billing', name: 'Billing', order: 4 }
    ],
    nodes: [
      {
        id: 'node-start',
        type: 'start',
        label: 'Mulai',
        position: { x: 100, y: 50 },
        laneId: 'lane-sales'
      },
      {
        id: 'node-order',
        type: 'process',
        label: 'Terima Pesanan',
        position: { x: 100, y: 150 },
        laneId: 'lane-sales',
        wcgwRefs: ['wcgw-001']
      },
      {
        id: 'node-credit-check',
        type: 'decision',
        label: 'Cek Kredit?',
        position: { x: 100, y: 250 },
        laneId: 'lane-credit',
        wcgwRefs: ['wcgw-002']
      },
      {
        id: 'node-ship',
        type: 'process',
        label: 'Kirim Barang',
        position: { x: 100, y: 350 },
        laneId: 'lane-warehouse'
      },
      {
        id: 'node-bill',
        type: 'document',
        label: 'Buat Faktur',
        position: { x: 100, y: 450 },
        laneId: 'lane-billing'
      },
      {
        id: 'node-end',
        type: 'terminator',
        label: 'Selesai',
        position: { x: 100, y: 550 },
        laneId: 'lane-billing'
      }
    ],
    edges: [
      { id: 'edge-1', sourceNodeId: 'node-start', targetNodeId: 'node-order' },
      { id: 'edge-2', sourceNodeId: 'node-order', targetNodeId: 'node-credit-check' },
      { id: 'edge-3-yes', sourceNodeId: 'node-credit-check', targetNodeId: 'node-ship', label: 'Ya' },
      { id: 'edge-3-no', sourceNodeId: 'node-credit-check', targetNodeId: 'node-end', label: 'Tidak' },
      { id: 'edge-4', sourceNodeId: 'node-ship', targetNodeId: 'node-bill' },
      { id: 'edge-5', sourceNodeId: 'node-bill', targetNodeId: 'node-end' }
    ]
  },
  analysisData: [
    {
      executiveSummary: {
        overview: 'Audit sikap pendapatan PT Maju Jaya mengidentifikasi 3 risiko utama terkait pengakuan pendapatan dan kontrol kredit.',
        keyRisks: 'Risiko pendapatan fiktif, pengakuan tidak sesuai periode, dan kelemahan kontrol kredit.',
        recommendations: 'Perkuat kontrol persetujuan kredit dan implementasi rekonsiliasi otomatis.',
        conclusion: 'Diperlukan prosedur substantif tambahan untuk menguji kelengkapan dan keakuratan pendapatan.'
      },
      risks: [
        {
          id: 'risk-001',
          description: 'Pendapatan fiktif dicatat untuk meningkatkan kinerja',
          level: 'high',
          category: 'Fraud',
          impact: 'Laporan keuangan overstate pendapatan',
          likelihood: 'possible'
        },
        {
          id: 'risk-002',
          description: 'Pengakuan pendapatan tidak sesuai periode akuntansi',
          level: 'medium',
          category: 'Cut-off',
          impact: 'Pendapatan diakui lebih awal atau terlambat',
          likelihood: 'likely'
        }
      ],
      controls: [
        {
          id: 'control-001',
          description: 'Persetujuan kredit oleh manajer keuangan',
          type: 'Preventive',
          frequency: 'Per transaksi',
          owner: 'Manajer Keuangan',
          effective: true
        }
      ],
      assertions: [
        {
          type: 'occurrence',
          description: 'Pendapatan yang dicatat benar-benar terjadi',
          relevantRisks: [{ id: 'risk-001' }],
          auditResponse: 'Vouch pendapatan ke dokumen pengiriman dan pesanan pelanggan'
        }
      ],
      auditResponse: [
        'Test detail atas transaksi pendapatan',
        'Review cut-off pendapatan di sekitar tanggal neraca'
      ],
      auditProcedures: [
        {
          id: 'proc-001',
          assertionType: 'occurrence',
          procedure: 'Pilih sampel 30 faktur dan vouch ke dokumen pengiriman',
          nature: 'Test of details',
          timing: 'Interim',
          extent: '30 sampel'
        }
      ],
      recommendations: [
        {
          id: 'rec-001',
          description: 'Implementasi sistem rekonsiliasi otomatis',
          priority: 'High',
          timeline: '3 bulan',
          responsibleParty: 'IT Department'
        }
      ],
      conclusion: 'Risiko pendapatan fiktif memerlukan perhatian khusus dengan test substantif yang diperluas.'
    }
  ],
  flowchartLocked: false,
  createdAt: new Date('2024-01-15T08:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z')
};

/**
 * Contoh 2: Audit Pembelian - PT Sumber Makmur
 * Fokus pada risiko pengakuan kewajiban
 */
export const exampleProject2 = {
  id: 'proj-002',
  name: 'Audit Pembelian - PT Sumber Makmur',
  client: 'PT Sumber Makmur',
  industry: 'Retail',
  area: 'Pembelian & Utang Usaha',
  auditor: 'Jane Smith, CPA',
  framework: 'SA 315',
  stage: 'flowchart',
  sourceInput: {
    type: 'text',
    rawText: `PT Sumber Makmur memiliki proses pembelian yang terpusat. 
    Pembelian di atas Rp 50 juta memerlukan 3 penawaran. 
    Terdapat risiko kewajiban tidak tercatat dan pembelian fiktif.`,
    fileName: 'brief_pembelian.txt'
  },
  flowchartOptions: {
    orientation: 'horizontal',
    style: 'basic',
    showWcgw: false
  },
  flowchartData: {
    lanes: [
      { id: 'lane-request', name: 'Request', order: 1 },
      { id: 'lane-procurement', name: 'Procurement', order: 2 },
      { id: 'lane-finance', name: 'Finance', order: 3 }
    ],
    nodes: [
      {
        id: 'node-start-2',
        type: 'start',
        label: 'Mulai',
        position: { x: 50, y: 100 },
        laneId: 'lane-request'
      },
      {
        id: 'node-request',
        type: 'process',
        label: 'Ajukan Permintaan',
        position: { x: 200, y: 100 },
        laneId: 'lane-request'
      },
      {
        id: 'node-quote',
        type: 'process',
        label: 'Minta 3 Penawaran',
        position: { x: 350, y: 100 },
        laneId: 'lane-procurement'
      },
      {
        id: 'node-end-2',
        type: 'terminator',
        label: 'Selesai',
        position: { x: 500, y: 100 },
        laneId: 'lane-finance'
      }
    ],
    edges: [
      { id: 'edge-a', sourceNodeId: 'node-start-2', targetNodeId: 'node-request' },
      { id: 'edge-b', sourceNodeId: 'node-request', targetNodeId: 'node-quote' },
      { id: 'edge-c', sourceNodeId: 'node-quote', targetNodeId: 'node-end-2' }
    ]
  },
  analysisData: [],
  flowchartLocked: true,
  createdAt: new Date('2024-01-16T09:00:00Z'),
  updatedAt: new Date('2024-01-16T09:00:00Z')
};

/**
 * Contoh 3: WcgwEntry examples
 */
export const exampleWcgwEntries = [
  {
    id: 'wcgw-001',
    nodeId: 'node-order',
    description: 'Pesanan pelanggan tidak diverifikasi keabsahannya',
    riskLevel: 'high',
    likelihood: 'possible',
    impact: 'major',
    rootCauseDraft: 'Tidak ada validasi otomatis terhadap data pelanggan',
    existingControl: {
      description: 'Sales memverifikasi manual',
      designEffective: true,
      operatingEffective: false,
      frequency: 'Per transaksi',
      owner: 'Sales Staff'
    },
    controlGap: 'Verifikasi manual tidak konsisten dan rentan human error',
    confidenceScore: 0.85,
    standardRef: 'SA 240 - Fraud Considerations'
  },
  {
    id: 'wcgw-002',
    nodeId: 'node-credit-check',
    description: 'Persetujuan kredit tidak dilakukan untuk pelanggan baru',
    riskLevel: 'medium',
    likelihood: 'likely',
    impact: 'moderate',
    rootCauseDraft: 'Proses persetujuan kredit tidak terdokumentasi dengan baik',
    existingControl: {
      description: 'Manajer keuangan menyetujui kredit',
      designEffective: true,
      operatingEffective: true,
      frequency: 'Per pelanggan baru',
      owner: 'Finance Manager'
    },
    controlGap: 'Tidak ada batasan kredit otomatis berdasarkan scoring',
    confidenceScore: 0.75,
    standardRef: 'SA 315 - Risk Assessment'
  }
];

// Export semua examples
export const Examples = {
  project1: exampleProject1,
  project2: exampleProject2,
  wcgwEntries: exampleWcgwEntries
};
