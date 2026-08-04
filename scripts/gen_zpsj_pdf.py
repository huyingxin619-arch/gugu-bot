#!/usr/bin/env python3
"""Generate PDF from the threshold spec markdown with embedded images using Chrome headless."""

import base64
import re
import subprocess
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
MD = BASE / "zpsj-threshold-spec-v2.md"
IMG_DIR = BASE / "scripts" / "zpsj-charts"
OUTPUT_HTML = BASE / "zpsj-threshold-spec-v5.html"
OUTPUT_PDF = BASE / "zpsj-threshold-spec-v5.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def img_to_data_uri(img_path: Path) -> str:
    data = img_path.read_bytes()
    b64 = base64.b64encode(data).decode()
    return f"data:image/png;base64,{b64}"

def md_to_html(md_text: str) -> str:
    # Convert image references ![alt](path) to embedded data URIs
    def replace_img(m):
        alt = m.group(1)
        rel_path = m.group(2)
        img_path = BASE / rel_path
        if img_path.exists():
            uri = img_to_data_uri(img_path)
            return f'<div style="text-align:center;margin:12px 0;"><img src="{uri}" alt="{alt}" style="max-width:90%;height:auto;"/><div style="font-size:0.85em;color:#666;margin-top:4px;">{alt}</div></div>'
        return f'<div style="color:red;">[图片缺失: {rel_path}]</div>'

    img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    md_text = re.sub(img_pattern, replace_img, md_text)

    lines = md_text.split('\n')
    html_lines = []
    in_table = False
    in_code = False
    in_list = False
    code_lines = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Code blocks
        if line.strip().startswith('```'):
            if in_code:
                code_content = '\n'.join(code_lines)
                escaped = code_content.replace('<', '&lt;').replace('>', '&gt;')
                html_lines.append(f'<pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;font-size:0.9em;">{escaped}</pre>')
                code_lines = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # H1
        if line.startswith('# ') and not line.startswith('## '):
            html_lines.append(f'<h1 style="text-align:center;font-size:1.8em;margin:20px 0;">{line[2:].strip()}</h1>')
            i += 1
            continue
        # H2
        if line.startswith('## '):
            if in_table:
                html_lines.append('</table>')
                in_table = False
            html_lines.append(f'<h2 style="font-size:1.4em;margin-top:24px;border-bottom:2px solid #333;padding-bottom:4px;">{line[3:].strip()}</h2>')
            i += 1
            continue
        # H3
        if line.startswith('### '):
            if in_table:
                html_lines.append('</table>')
                in_table = False
            html_lines.append(f'<h3 style="font-size:1.15em;margin-top:18px;">{line[4:].strip()}</h3>')
            i += 1
            continue
        # H4
        if line.startswith('#### '):
            if in_table:
                html_lines.append('</table>')
                in_table = False
            html_lines.append(f'<h4 style="font-size:1.05em;margin-top:14px;">{line[5:].strip()}</h4>')
            i += 1
            continue

        # Tables
        if '|' in line and line.strip().startswith('|'):
            cells = [c.strip() for c in line.strip().split('|')[1:-1]]
            if not in_table:
                html_lines.append('<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:0.9em;">')
                in_table = True
                header_cells = ''.join([f'<th style="border:1px solid #ddd;padding:6px 10px;background:#f0f0f0;text-align:left;">{c}</th>' for c in cells])
                html_lines.append(f'<tr>{header_cells}</tr>')
                i += 1
                if i < len(lines) and re.match(r'^\|[\s\-:|]+\|$', lines[i].strip()):
                    i += 1
                continue
            else:
                row_cells = ''.join([f'<td style="border:1px solid #ddd;padding:6px 10px;">{c}</td>' for c in cells])
                html_lines.append(f'<tr>{row_cells}</tr>')
                i += 1
                continue
        else:
            if in_table:
                html_lines.append('</table>')
                in_table = False

        # Blockquotes
        if line.strip().startswith('> '):
            content = line.strip()[2:]
            html_lines.append(f'<blockquote style="border-left:4px solid #4a90d9;margin:12px 0;padding:8px 16px;background:#f9f9f9;">{content}</blockquote>')
            i += 1
            continue

        # Horizontal rule
        if line.strip() == '---':
            html_lines.append('<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;"/>')
            i += 1
            continue

        # List items
        if re.match(r'^[\-\*]\s', line):
            content = re.sub(r'^[\-\*]\s+', '', line)
            content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
            if not in_list:
                html_lines.append('<ul style="margin:8px 0;padding-left:24px;">')
                in_list = True
            html_lines.append(f'<li style="margin:4px 0;">{content}</li>')
            i += 1
            continue
        elif in_list and line.strip() == '':
            html_lines.append('</ul>')
            in_list = False

        # Numbered lists
        if re.match(r'^\d+\.\s', line):
            content = re.sub(r'^\d+\.\s+', '', line)
            content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
            html_lines.append(f'<div style="margin:4px 0 4px 24px;">{content}</div>')
            i += 1
            continue

        # Regular paragraphs
        if line.strip():
            content = line.strip()
            content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'`([^`]+)`', r'<code style="background:#f0f0f0;padding:1px 4px;border-radius:2px;">\1</code>', content)
            html_lines.append(f'<p style="margin:8px 0;line-height:1.7;">{content}</p>')
            i += 1
            continue

        if in_list:
            html_lines.append('</ul>')
            in_list = False
        i += 1

    if in_table:
        html_lines.append('</table>')
    if in_list:
        html_lines.append('</ul>')
    if in_code:
        code_content = '\n'.join(code_lines)
        escaped = code_content.replace('<', '&lt;').replace('>', '&gt;')
        html_lines.append(f'<pre>{escaped}</pre>')

    body = '\n'.join(html_lines)
    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
@page {{
  size: A4;
  margin: 2cm 2.5cm;
}}
body {{
  font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  font-size: 11pt;
  color: #222;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}}
table {{
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 0.9em;
}}
th, td {{
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}}
th {{
  background: #f0f0f0;
}}
h1 {{
  text-align: center;
  font-size: 1.8em;
  margin: 20px 0;
}}
h2 {{
  font-size: 1.4em;
  margin-top: 24px;
  border-bottom: 2px solid #333;
  padding-bottom: 4px;
}}
h3 {{
  font-size: 1.15em;
  margin-top: 18px;
}}
img {{
  max-width: 90%;
  height: auto;
  display: block;
  margin: 0 auto;
}}
pre {{
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9em;
}}
</style>
</head>
<body>
{body}
</body>
</html>"""
    return html

md_text = MD.read_text()
html = md_to_html(md_text)
OUTPUT_HTML.write_text(html)
print(f"HTML generated: {OUTPUT_HTML}")

# Use Chrome headless to convert HTML to PDF
cmd = [
    CHROME,
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--print-to-pdf=" + str(OUTPUT_PDF),
    "--no-pdf-header-footer",
    str(OUTPUT_HTML)
]
result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
if result.stderr:
    print(f"Chrome stderr: {result.stderr[:500]}")
print(f"PDF generated: {OUTPUT_PDF}")
