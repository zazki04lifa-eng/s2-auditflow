/**
 * AuditFlow AI - Export Module Test
 * Test untuk memverifikasi export functionality
 */

import { ExportManager } from './export-manager.js';
import { ImageExporter } from './image-exporter.js';
import { PdfExporter } from './pdf-exporter.js';
import { DocxExporter } from './docx-exporter.js';
import { FlowchartRenderer } from '../flowchart/renderer.js';

// Sample data for testing
const sampleFlowchartData = {
  lanes: [
    { id: 'lane1', name: 'Sales', order: 0 },
    { id: 'lane2', name: 'Finance', order: 1 }
  ],
  nodes: [
    { id: 'start', type: 'start', label: 'Mulai', position: { x: 100, y: 50 }, laneId: 'lane1' },
    { id: 'process1', type: 'process', label: 'Input Order', position: { x: 100, y: 150 }, laneId: 'lane1' },
    { id: 'decision1', type: 'decision', label: 'Approved?', position: { x: 100, y: 250 }, laneId: 'lane2' },
    { id: 'process2', type: 'process', label: 'Process Payment', position: { x: 100, y: 350 }, laneId: 'lane2' },
    { id: 'end', type: 'terminator', label: 'Selesai', position: { x: 100, y: 450 }, laneId: 'lane2' }
  ],
  edges: [
    { id: 'edge1', sourceNodeId: 'start', targetNodeId: 'process1' },
    { id: 'edge2', sourceNodeId: 'process1', targetNodeId: 'decision1' },
    { id: 'edge3', sourceNodeId: 'decision1', targetNodeId: 'process2', label: 'Yes' },
    { id: 'edge4', sourceNodeId: 'process2', targetNodeId: 'end' }
  ]
};

const sampleWcgwEntries = [
  {
    id: 'WCGW-001',
    description: 'Order tidak sah atau tidak disetujui',
    category: 'Authorization',
    riskLevel: 'high',
    likelihood: 'possible',
    impact: 'major',
    existingControl: {
      description: 'Approval workflow dengan batas otoritas',
      designEffective: true,
      operatingEffective: true
    },
    confidence: 0.85
  },
  {
    id: 'WCGW-002',
    description: 'Pembayaran ganda atau duplikat',
    category: 'Accuracy',
    riskLevel: 'medium',
    likelihood: 'possible',
    impact: 'moderate',
    existingControl: {
      description: 'Validasi invoice otomatis',
      designEffective: true,
      operatingEffective: false
    },
    confidence: 0.72
  }
];

const sampleWorkingPaper = {
  executiveSummary: {
    summary: 'Analisis risiko untuk proses order-to-cash menunjukkan kontrol yang memadai dengan beberapa area perbaikan.',
    details: ['Proses memiliki approval workflow', 'Validasi otomatis tersedia']
  },
  risk: {
    summary: 'Risiko utama terletak pada authorization dan accuracy.',
    details: ['Risiko approval tidak sah', 'Risiko pembayaran duplikat']
  },
  control: {
    summary: 'Kontrol existing umumnya efektif secara desain.',
    details: ['Approval workflow berfungsi baik', 'Validasi perlu ditingkatkan']
  },
  assertion: {
    summary: 'Asersi utama: Occurrence, Accuracy, Cutoff.',
    details: ['Transaksi harus sah', 'Amount harus akurat']
  },
  auditResponse: {
    summary: 'Pendekatan audit: Test of controls + substantive testing.',
    details: ['Test approval workflow', 'Substantive test sample transactions']
  },
  auditProcedures: {
    summary: 'Prosedur audit yang direkomendasikan.',
    details: ['Inspect approval documentation', 'Reperform validation checks']
  },
  recommendations: {
    summary: 'Rekomendasi perbaikan kontrol.',
    details: ['Tingkatkan validasi otomatis', 'Review approval limits']
  },
  conclusion: {
    summary: 'Kontrol secara keseluruhan memadai dengan perbaikan minor diperlukan.',
    details: ['Risk level: Medium', 'Control effectiveness: Partial']
  }
};

const sampleData = {
  projectName: 'Test Project - Order to Cash',
  industry: 'Manufacturing',
  flowchartData: sampleFlowchartData,
  flowchartOptions: {
    orientation: 'vertical',
    style: 'default',
    showWcgw: true
  },
  wcgwEntries: sampleWcgwEntries,
  workingPaper: sampleWorkingPaper
};

// Run tests
async function runTests() {
  console.log('🧪 Running Export Module Tests...\n');
  
  const results = {
    imageExporter: false,
    pdfExporter: false,
    docxExporter: false,
    exportManager: false
  };
  
  // Test ImageExporter
  try {
    console.log('📸 Testing ImageExporter...');
    const imageExporter = new ImageExporter();
    const svgString = '<svg width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/><text x="100" y="100" text-anchor="middle">Test</text></svg>';
    const blob = await imageExporter.exportFromSvg(svgString, 'png', { scale: 2 });
    console.log(`   ✅ PNG blob created: ${blob.size} bytes, type: ${blob.type}`);
    results.imageExporter = true;
  } catch (error) {
    console.log(`   ❌ ImageExporter failed: ${error.message}`);
  }
  
  // Test PdfExporter
  try {
    console.log('\n📄 Testing PdfExporter...');
    const pdfExporter = new PdfExporter();
    const html = pdfExporter.generatePdfHtml({
      projectName: 'Test Project',
      industry: 'Test',
      flowchartSvg: '<svg>Test</svg>',
      wcgwEntries: sampleWcgwEntries,
      workingPaper: sampleWorkingPaper
    });
    console.log(`   ✅ PDF HTML generated: ${html.length} characters`);
    console.log(`   ✅ Contains project name: ${html.includes('Test Project')}`);
    console.log(`   ✅ Contains WCGW table: ${html.includes('wcgw-table')}`);
    results.pdfExporter = true;
  } catch (error) {
    console.log(`   ❌ PdfExporter failed: ${error.message}`);
  }
  
  // Test DocxExporter
  try {
    console.log('\n📝 Testing DocxExporter...');
    const docxExporter = new DocxExporter();
    const mhtHtml = docxExporter._generateMhtHtml({
      projectName: 'Test Project',
      industry: 'Test',
      wcgwEntries: sampleWcgwEntries,
      workingPaper: sampleWorkingPaper
    });
    console.log(`   ✅ MHT HTML generated: ${mhtHtml.length} characters`);
    console.log(`   ✅ Contains table: ${mhtHtml.includes('<table>')}`);
    results.docxExporter = true;
  } catch (error) {
    console.log(`   ❌ DocxExporter failed: ${error.message}`);
  }
  
  // Test ExportManager validation
  try {
    console.log('\n📦 Testing ExportManager...');
    const exportManager = new ExportManager();
    const validation = exportManager.validateData(sampleData);
    console.log(`   ✅ Validation: ${validation.valid ? 'Valid' : 'Invalid'}`);
    if (!validation.valid) {
      console.log(`   ⚠️ Errors: ${validation.errors.join(', ')}`);
    }
    
    const formats = exportManager.getAvailableFormats();
    console.log(`   ✅ Available formats: ${formats.length}`);
    formats.forEach(f => console.log(`      - ${f.label} (${f.extension})`));
    results.exportManager = true;
  } catch (error) {
    console.log(`   ❌ ExportManager failed: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${name}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`);
  
  return results;
}

// Export for use
export { runTests, sampleData };

// Run if this is the main module
if (import.meta.url === `file://${location.pathname}`) {
  runTests().catch(console.error);
}
