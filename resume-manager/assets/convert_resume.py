#!/usr/bin/env python3
"""
convert_resume.py - Convert a structured Markdown resume into DOCX and PDF formats.

Usage:
    # Convert an entire role directory (converts both resume.md and cover_letter.md):
    python convert_resume.py "C:/Users/brand/Desktop/Resumes/<Company>/<Role>"

    # Convert a specific markdown file:
    python convert_resume.py "C:/Users/brand/Desktop/Resumes/<Company>/<Role>/resume.md"

Requirements:
    python-docx (for DOCX generation)
    Microsoft Word via win32com (Primary PDF export) or Microsoft Edge (Fallback)
"""

import sys
import os
import argparse
import subprocess
import re
import shutil
import time
from pathlib import Path

def add_hyperlink(paragraph, url: str, text: str, color: str = "004B87", underline: bool = True):
    """Add a real clickable hyperlink to a python-docx paragraph."""
    try:
        import docx
        part = paragraph.part
        r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
        hyperlink = docx.oxml.OxmlElement('w:hyperlink')
        hyperlink.set(docx.oxml.ns.qn('r:id'), r_id)
        new_run = docx.oxml.OxmlElement('w:r')
        rPr = docx.oxml.OxmlElement('w:rPr')
        if color:
            c = docx.oxml.OxmlElement('w:color')
            c.set(docx.oxml.ns.qn('w:val'), color)
            rPr.append(c)
        if underline:
            u = docx.oxml.OxmlElement('w:u')
            u.set(docx.oxml.ns.qn('w:val'), 'single')
            rPr.append(u)
        new_run.append(rPr)
        new_run.text = text
        hyperlink.append(new_run)
        paragraph._p.append(hyperlink)
    except Exception:
        r = paragraph.add_run(text)
        r.font.underline = True

def append_formatted_text(paragraph, text_str: str):
    """Parse inline markdown tokens (links, bold, italic, bold+italic, code, plain text) and append to paragraph."""
    pattern = re.compile(
        r'(\[[^\]]+\]\([^)]+\)|'
        r'\*\*\*[^*]+\*\*\*|___[^_]+___|'
        r'\*\*[^*]+\*\*|__[^_]+__|'
        r'(?<!\*)\*[^*]+\*(?!\*)|'
        r'(?<!\w)_[^_]+_(?!\w)|'
        r'`[^`]+`)'
    )
    pos = 0
    for match in pattern.finditer(text_str):
        start, end = match.span()
        if start > pos:
            paragraph.add_run(text_str[pos:start])
        
        token = match.group(0)
        if token.startswith("[") and "](" in token and token.endswith(")"):
            m = re.match(r'\[(.*?)\]\((.*?)\)', token)
            if m:
                label, url = m.group(1), m.group(2)
                add_hyperlink(paragraph, url, label)
            else:
                paragraph.add_run(token)
        elif (token.startswith("***") and token.endswith("***")) or (token.startswith("___") and token.endswith("___")):
            content = token[3:-3]
            r = paragraph.add_run(content)
            r.font.bold = True
            r.font.italic = True
        elif (token.startswith("**") and token.endswith("**")) or (token.startswith("__") and token.endswith("__")):
            content = token[2:-2]
            r = paragraph.add_run(content)
            r.font.bold = True
        elif (token.startswith("*") and token.endswith("*")) or (token.startswith("_") and token.endswith("_")):
            content = token[1:-1]
            r = paragraph.add_run(content)
            r.font.italic = True
        elif token.startswith("`") and token.endswith("`"):
            content = token[1:-1]
            r = paragraph.add_run(content)
            r.font.name = 'Consolas'
        else:
            paragraph.add_run(token)
        pos = end
        
    if pos < len(text_str):
        paragraph.add_run(text_str[pos:])

def convert_md_to_docx(md_path: Path, docx_path: Path):
    """Convert markdown resume to styled DOCX using python-docx."""
    try:
        import docx
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn
    except ImportError:
        print("[!] python-docx is not installed. Trying pandoc fallback...", file=sys.stderr)
        cmd = ["pandoc", str(md_path), "-o", str(docx_path)]
        subprocess.run(cmd, check=True, timeout=30)
        return

    doc = docx.Document()

    # Set 0.5 inch margins for standard single-page/two-page resume layout
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

    # Set Base Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(33, 33, 33)

    content = md_path.read_text(encoding='utf-8')
    lines = content.splitlines()

    is_cover_letter = "cover" in md_path.stem.lower()
    in_header = True

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        # Skip top-level horizontal rules or markdown codeblocks
        if line_str == "---" or line_str.startswith("```"):
            continue

        # Header 1: Candidate Name
        if line_str.startswith("# "):
            name = line_str[2:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(name)
            run.font.size = Pt(18 if not is_cover_letter else 16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(16, 44, 87)
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            continue

        # Header 2: Major Section Heading (e.g. ## Professional Summary)
        if line_str.startswith("## "):
            section_title = line_str[3:].strip().upper()
            p = doc.add_paragraph()
            run = p.add_run(section_title)
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(16, 44, 87)
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)

            # Add bottom border under section heading
            pBdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            bottom.set(qn('w:val'), 'single')
            bottom.set(qn('w:sz'), '6')
            bottom.set(qn('w:space'), '1')
            bottom.set(qn('w:color'), 'B0C4DE')
            pBdr.append(bottom)
            p._p.get_or_add_pPr().append(pBdr)
            in_header = False
            continue

        # Header 3: Role / Company Title (### Title | Company)
        if line_str.startswith("### "):
            role_info = line_str[4:].strip()
            p = doc.add_paragraph()
            run = p.add_run(role_info)
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 30, 30)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(1)
            continue

        # Bullet items
        if line_str.startswith("- ") or line_str.startswith("* "):
            bullet_text = line_str[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.08
            append_formatted_text(p, bullet_text)
            continue

        # Regular paragraph (contact info, role metadata, summaries, cover letter paragraphs)
        p = doc.add_paragraph()
        if in_header and not is_cover_letter:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(4)
        elif is_cover_letter:
            if in_header:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(8)
                in_header = False
            else:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(8)
                p.paragraph_format.line_spacing = 1.15
        else:
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(3)

        append_formatted_text(p, line_str)

    doc.save(str(docx_path))
    print(f"[✓] Generated DOCX: {docx_path}")

def convert_docx_to_pdf_word(docx_path: Path, pdf_path: Path) -> bool:
    """Convert DOCX directly to PDF using Microsoft Word COM automation (Native, 100% Reliable)."""
    try:
        import win32com.client
        import pythoncom
        pythoncom.CoInitialize()

        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = False

        doc = None
        try:
            doc = word.Documents.Open(str(docx_path.resolve()))
            # 17 = wdFormatPDF
            doc.SaveAs(str(pdf_path.resolve()), FileFormat=17)
            print(f"[✓] Generated PDF (Native Word): {pdf_path}")
            return True
        finally:
            if doc:
                doc.Close(SaveChanges=False)
            word.Quit()
            pythoncom.CoUninitialize()
    except Exception as e:
        return False

def convert_md_to_pdf_browser(md_path: Path, pdf_path: Path, css_path: Path = None) -> bool:
    """Fallback: Convert markdown resume to PDF via headless Edge/Chrome with robust local file loading."""
    try:
        from markdown_it import MarkdownIt
        md = MarkdownIt()
        html_body = md.render(md_path.read_text(encoding='utf-8'))
    except ImportError:
        tmp_html = md_path.with_suffix('.tmp.html')
        subprocess.run(["pandoc", str(md_path), "-o", str(tmp_html)], check=True, timeout=15)
        html_body = tmp_html.read_text(encoding='utf-8')
        tmp_html.unlink(missing_ok=True)

    css_content = """
    @page { size: letter; margin: 0.45in 0.5in; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.35; color: #1a1a1a; margin: 0; padding: 0; }
    h1 { font-size: 18pt; text-align: center; margin: 0 0 4px 0; color: #0f2c59; font-weight: 700; }
    h2 { font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #b0c4de; padding-bottom: 2px; margin: 10px 0 4px 0; color: #0f2c59; font-weight: 700; letter-spacing: 0.5px; }
    h3 { font-size: 10pt; margin: 6px 0 2px 0; color: #222; font-weight: 600; }
    p { margin: 2px 0; }
    ul { margin: 2px 0 6px 18px; padding: 0; }
    li { margin-bottom: 2px; }
    strong { font-weight: 600; color: #111; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 6px 0; }
    """

    full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{css_content}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

    html_path = md_path.with_suffix('.render.html')
    html_path.write_text(full_html, encoding='utf-8')

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    ]
    browser_exe = next((p for p in edge_paths if os.path.exists(p)), None)

    if not browser_exe:
        html_path.unlink(missing_ok=True)
        return False

    cmd = [
        browser_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        "--enable-local-file-accesses",
        f"--print-to-pdf={pdf_path.resolve()}",
        str(html_path.resolve())
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=20)
        time.sleep(0.5)
        print(f"[✓] Generated PDF (Browser): {pdf_path}")
        return True
    except Exception:
        return False
    finally:
        html_path.unlink(missing_ok=True)

def is_file_writable(file_path: Path) -> bool:
    """Check if file can be written or if it is locked by another process (e.g. PDF reader)."""
    if not file_path.exists():
        return True
    try:
        with open(file_path, 'a'):
            pass
        return True
    except (PermissionError, OSError):
        return False

def convert_md_to_pdf(md_path: Path, docx_path: Path, pdf_path: Path, css_path: Path = None):
    """Multi-tiered PDF conversion ensuring zero errors and graceful handling of file locks."""
    target_pdf = pdf_path
    if not is_file_writable(pdf_path):
        print(f"[!] Warning: {pdf_path.name} is currently open and locked by a PDF reader.", file=sys.stderr)
        # Attempt fallback to an alternate name so updated output is still produced
        alt_pdf = pdf_path.with_name(f"{pdf_path.stem}_Updated{pdf_path.suffix}")
        if is_file_writable(alt_pdf):
            print(f"[*] Writing to alternate file: {alt_pdf.name}", file=sys.stderr)
            target_pdf = alt_pdf

    if docx_path.exists() and convert_docx_to_pdf_word(docx_path, target_pdf):
        return

    if convert_md_to_pdf_browser(md_path, target_pdf, css_path):
        return

    pandoc = shutil.which("pandoc")
    if pandoc:
        try:
            cmd = [pandoc, str(md_path), "-o", str(target_pdf),
                   "--pdf-engine=pdflatex",
                   "-V", "geometry:margin=0.5in",
                   "-V", "fontsize=10pt"]
            subprocess.run(cmd, check=True, capture_output=True, timeout=20)
            print(f"[✓] Generated PDF (pandoc): {target_pdf}")
            return
        except Exception:
            pass

    print(f"[!] Warning: Could not generate PDF for {md_path.name}", file=sys.stderr)

def extract_candidate_name(md_path: Path) -> str:
    """Extract candidate name from the first '# Name' line of markdown."""
    try:
        content = md_path.read_text(encoding='utf-8')
        for line in content.splitlines():
            line_str = line.strip()
            if line_str.startswith("# "):
                clean_name = line_str[2:].strip()
                clean_name = re.split(r'[—\-–|]', clean_name)[0].strip()
                formatted = re.sub(r'[^a-zA-Z0-9_ ]', '', clean_name).strip()
                return "_".join(formatted.split())
    except Exception:
        pass
    return "Brandon_Phillips"

def process_single_file(md_path: Path, out_dir: Path = None, out_name: str = None, do_docx: bool = True, do_pdf: bool = True, css_path: Path = None):
    """Process a single markdown resume or cover letter."""
    if not out_dir:
        out_dir = md_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    if out_name:
        base_name = out_name
    else:
        stem = md_path.stem.lower()
        candidate = extract_candidate_name(md_path)
        if "resume" in stem:
            base_name = f"{candidate}_Resume"
        elif "cover" in stem:
            base_name = f"{candidate}_Cover_Letter"
        else:
            base_name = f"{candidate}_{md_path.stem}"

    docx_path = out_dir / f"{base_name}.docx"
    pdf_path = out_dir / f"{base_name}.pdf"

    if do_docx:
        convert_md_to_docx(md_path, docx_path)
    if do_pdf:
        convert_md_to_pdf(md_path, docx_path, pdf_path, css_path)

def main():
    parser = argparse.ArgumentParser(description="Convert Markdown resume to DOCX and PDF")
    parser.add_argument("input_target", type=str, help="Path to markdown resume file or directory")
    parser.add_argument("--docx", action="store_true", help="Generate DOCX output")
    parser.add_argument("--pdf", action="store_true", help="Generate PDF output")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save outputs")
    parser.add_argument("--out-name", type=str, default=None, help="Base output filename without extension")

    args = parser.parse_args()

    target_path = Path(args.input_target)
    if not target_path.exists():
        print(f"[Error] Target not found: {target_path}", file=sys.stderr)
        sys.exit(1)

    generate_all = not args.docx and not args.pdf
    do_docx = args.docx or generate_all
    do_pdf = args.pdf or generate_all

    script_dir = Path(__file__).parent
    css_path = script_dir.parent / "assets" / "resume_style.css"
    out_dir = Path(args.output_dir) if args.output_dir else None

    if target_path.is_dir():
        md_files = list(target_path.glob("*.md"))
        candidates = [f for f in md_files if "resume" in f.stem.lower() or "cover" in f.stem.lower()]
        if not candidates:
            candidates = [f for f in md_files if "interview" not in f.stem.lower()]
        for f in candidates:
            process_single_file(f, out_dir=out_dir, out_name=None, do_docx=do_docx, do_pdf=do_pdf, css_path=css_path)
    else:
        process_single_file(target_path, out_dir=out_dir, out_name=args.out_name, do_docx=do_docx, do_pdf=do_pdf, css_path=css_path)

if __name__ == "__main__":
    main()
