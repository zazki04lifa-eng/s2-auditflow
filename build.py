import os
import re

source_dir = "AuditFlow-AI-source"
output_file = "AuditFlow-AI (1).html"

print("Compiling AuditFlow sources...")

# Read index.html
with open(os.path.join(source_dir, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

# Replace local CSS references with embedded styling
html = html.replace(
    '<link rel="stylesheet" href="libs/drawflow.min.css">',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.css">'
)

with open(os.path.join(source_dir, "css", "style.css"), "r", encoding="utf-8") as f:
    css_content = f.read()

html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    f'<style>\n{css_content}\n</style>'
)

# Concatenate JavaScript files in correct execution order
js_files = [
    "storage.js",
    "case-studies.js",
    "knowledge-base.js",
    "rules-engine.js",
    "flowchart.js",
    "analysis.js",
    "export.js",
    "chatbot.js",
    "app.js"
]

js_contents = []
for js_file in js_files:
    path = os.path.join(source_dir, "js", js_file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    js_contents.append(f"/* ===== js/{js_file} ===== */\n{content}\n")

combined_js = "\n".join(js_contents)

# CDN libraries replacement definition
library_scripts = """<script src="https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script>
if(typeof pdfjsLib !== 'undefined'){
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
</script>"""

# Regex pattern to match all local scripts between drawflow.min.js and app.js
script_pattern = re.compile(
    r'<script src="libs/drawflow.min.js"></script>.*?<script src="js/app.js"></script>',
    re.DOTALL
)

replacement = f"{library_scripts}\n<script>\n{combined_js}\n</script>"

# Replace and write to output file
html = re.sub(script_pattern, lambda m: replacement, html)

with open(output_file, "w", encoding="utf-8") as f:
    f.write(html)

print("Build complete! Output generated in", output_file)
