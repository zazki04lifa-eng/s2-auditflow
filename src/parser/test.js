/**
 * AuditFlow AI - Parser Tests
 * Test cases untuk validasi parser
 */

import { parser } from './index.js';

// Test data
const testCases = [
  {
    name: 'Test 1: Pendapatan PT Maju Jaya',
    input: `PT Maju Jaya adalah perusahaan manufaktur dengan pendapatan tahunan Rp 500 miliar. 
    Proses pendapatan dimulai dari penerimaan pesanan pelanggan, persetujuan kredit, 
    pengiriman barang, hingga penagihan. Terdapat risiko pendapatan fiktif dan 
    pengakuan pendapatan yang tidak sesuai periode. Kontrol utama termasuk persetujuan 
    kredit oleh manajer keuangan dan rekonsiliasi harian antara dokumen pengiriman 
    dan faktur.`,
    expected: {
      industry: 'Manufaktur',
      area: 'Pendapatan',
      hasRisks: true,
      hasControls: true,
      hasSteps: true
    }
  },
  {
    name: 'Test 2: Pembelian PT Sumber Makmur',
    input: `PT Sumber Makmur memiliki proses pembelian yang terpusat. 
    Pembelian di atas Rp 50 juta memerlukan 3 penawaran. 
    Terdapat risiko kewajiban tidak tercatat dan pembelian fiktif.
    Kontrol termasuk persetujuan dari direktur untuk pembelian besar.`,
    expected: {
      industry: 'Retail',
      area: 'Pembelian',
      hasRisks: true,
      hasControls: true,
      hasSteps: true
    }
  },
  {
    name: 'Test 3: Teks umum',
    input: `Proses audit meliputi perencanaan, pelaksanaan, dan pelaporan.
    Auditor harus memeriksa dokumen dan melakukan wawancara.
    Risiko termasuk kesalahan material dan kecurangan.`,
    expected: {
      industry: 'Umum',
      area: 'Umum',
      hasRisks: true,
      hasControls: false,
      hasSteps: true
    }
  }
];

/**
 * Run all tests
 */
export function runParserTests() {
  console.log('🧪 Running Parser Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      const result = parser.parse(test.input);
      
      // Validate results
      const checks = [
        { name: 'Industry', pass: result.industry === test.expected.industry },
        { name: 'Area', pass: result.area === test.expected.area },
        { name: 'Has Risks', pass: result.risks.length > 0 === test.expected.hasRisks },
        { name: 'Has Controls', pass: result.controls.length > 0 === test.expected.hasControls },
        { name: 'Has Steps', pass: result.steps.length > 0 === test.expected.hasSteps }
      ];
      
      const allPassed = checks.every(c => c.pass);
      
      if (allPassed) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        checks.forEach(c => {
          if (!c.pass) {
            console.log(`   └─ Failed: ${c.name}`);
          }
        });
        failed++;
      }
      
      // Log details
      console.log(`   ├─ Industry: ${result.industry}`);
      console.log(`   ├─ Area: ${result.area}`);
      console.log(`   ├─ Risks: ${result.risks.length} found`);
      console.log(`   ├─ Controls: ${result.controls.length} found`);
      console.log(`   └─ Steps: ${result.steps.length} found\n`);
      
    } catch (error) {
      console.log(`💥 ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return { passed, failed, total: passed + failed };
}

// Run tests if this is the main module
if (import.meta.url === `file://${location.pathname}`) {
  runParserTests();
}

export { testCases };
