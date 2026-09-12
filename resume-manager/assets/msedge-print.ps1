# msedge-print.ps1 - Render an HTML file to PDF via headless Microsoft Edge.
#
# Invoked by convert_resume.py. Uses Start-Process with an explicit argument list,
# which is the only reliable way to pass Edge's --print-to-pdf= path flag on Windows
# (Python subprocess.run with a list of args builds a raw command line that mangles
# Edge's argument parsing).
#
# Note: Start-Process -Wait has no -TimeoutSec parameter. The parent Python
# subprocess.run(..., timeout=45) provides the hard timeout; if this process hangs,
# the wrapper kills it and the Python caller falls through to the next tier.
#
# Usage:
#   pwsh -NoProfile -ExecutionPolicy Bypass -File msedge-print.ps1 \
#     -EdgePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" \
#     -HtmlPath "C:\...\resume.render.html" \
#     -PdfPath "C:\...\Brandon_D_Phillips_Resume.pdf"

[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$EdgePath,
    [Parameter(Mandatory)][string]$HtmlPath,
    [Parameter(Mandatory)][string]$PdfPath
)

$absHtml = [System.IO.Path]::GetFullPath($HtmlPath)
$uri = "file:///" + $absHtml.Replace('\', '/')
$outPath = [System.IO.Path]::GetFullPath($PdfPath)

$p = Start-Process -FilePath $EdgePath `
    -ArgumentList `
        '--headless',`
        '--disable-gpu',`
        '--no-pdf-header-footer',`
        "--print-to-pdf=$outPath",`
        $uri `
    -PassThru -WindowStyle Hidden -Wait

if ($null -eq $p) {
    Write-Error "msedge-print: Start-Process returned no process (launch failure)."
    exit 2
}

if ($p.ExitCode -ne 0) {
    Write-Error "msedge-print: Edge exited with code $($p.ExitCode)."
    exit 2
}

if (-not (Test-Path $outPath)) {
    Write-Error "msedge-print: Output PDF not found at $outPath."
    exit 2
}

# Validate the PDF isn't Edge's empty-document error page.
$content = Get-Content $outPath -Raw -Encoding UTF8
if ($content -match 'ERR_FILE_NOT_FOUND' -or $content -match 'File not found') {
    Write-Error "msedge-print: Edge produced an error page instead of the PDF."
    Remove-Item -Force $outPath -ErrorAction SilentlyContinue
    exit 3
}

Write-Host "msedge-print: Generated $outPath"
exit 0