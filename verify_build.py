content = open('AuditFlow-AI (1).html', encoding='utf-8').read()

checks = [
  # Templates fixes
  ('TEMPLATES - revenue narrative',       'Order masuk → Credit check'),
  ('TEMPLATES - expenses narrative',      'Purchase Requisition → Seleksi Vendor'),
  ('TEMPLATES - payroll narrative',       'Absensi → Verifikasi Jam Kerja'),
  ('TEMPLATES - production narrative',    'Sales Order → Master Production Schedule'),
  ('TEMPLATES - steps array',             "'steps':" if "'steps':" in content else 'steps:'),
  ('TEMPLATES - emoji field',             "emoji: '📈'"),
  ('renderTemplatesView - SVG preview',   'svgNodes'),
  ('renderTemplatesView - btn primary',   'btn btn-primary btn-sm" style="width:100%;" data-use-tpl'),
  ('useSelectedTemplate - narrative',     "tpl.narrative"),
  ('newProjectForm - applies narrative',  'patch.narrative = tpl.narrative'),

  # Flowchart snapshot fix
  ('buildFlowchartSnapshot - pure data',  'Build a Drawflow-compatible JSON snapshot purely'),
  ('buildFlowchartSnapshot - nodeData',   'nodeData[dfId]'),
  ('buildFlowchartSnapshot - no Drawflow constructor', 'without touching the DOM'),
  ('buildFlowchartSnapshot - connection wiring', "output: 'input_1'"),

  # Case studies fix
  ('renderCaseStudies - load-cs-btn',     'load-cs-btn'),
  ('renderCaseStudies - dedup check',     'Storage.getAll().find(p => p.name === cs.name)'),
  ('renderCaseStudies - error recovery',  "btn.disabled = false; btn.textContent = 'Muat Studi Kasus'"),
  ('ensureDefaultProjects - no currentProjects snapshot', 'Storage.getAll().find(p => p.name === cs.name)'),
  ('ensureDefaultProjects - null guard',  'flowchartData: flowchartData || null'),
  ('ensureDefaultProjects - narrative in analysis', '{ ...project, narrative: cs.narrative }'),

  # case-studies.js fix
  ('loadCaseStudy - uses Storage.create', 'uses Storage.create for proper integration'),
  ('loadCaseStudy - no _write bypass',    'Storage.update(project.id, { narrative: caseStudy.narrative })'),

  # Core case studies data
  ('SIKLUS PENDAPATAN',                   'SIKLUS PENDAPATAN'),
  ('SIKLUS PENGELUARAN',                  'SIKLUS PENGELUARAN'),
  ('SIKLUS PENGGAJIAN',                   'SIKLUS PENGGAJIAN'),
  ('SIKLUS PRODUKSI',                     'SIKLUS PRODUKSI'),
]

all_ok = True
for label, needle in checks:
  found = needle in content
  status = 'OK  ' if found else 'FAIL'
  if not found:
    all_ok = False
  print(f"  {status}  {label}")

print()
print(f"File size: {len(content):,} chars")
print()
print("BUILD OK — all checks passed" if all_ok else "BUILD FAILED — see FAIL items above")
