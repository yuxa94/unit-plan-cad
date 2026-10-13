param(
    [Parameter(Mandatory=$true)][string]$PythonPath,
    [string]$DestinationRoot,
    [switch]$SkipMcp
)
$ErrorActionPreference = 'Stop'
$unitSource = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$unitPython = (Get-Command $PythonPath -ErrorAction Stop).Source
& $unitPython -c 'import sys; assert sys.version_info >= (3,10), "Python 3.10+ required"'
if ($LASTEXITCODE -ne 0) { throw 'Python 3.10+ is required.' }
& $unitPython (Join-Path $PSScriptRoot 'verify_package.py')
if ($LASTEXITCODE -ne 0) { throw 'Package integrity check failed.' }
if (-not $DestinationRoot) {
    $unitCodexRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex' }
    $DestinationRoot = Join-Path $unitCodexRoot 'skills'
}
$unitDestination = [IO.Path]::GetFullPath((Join-Path $DestinationRoot 'unit-plan-cad'))
if (Test-Path -LiteralPath $unitDestination) { throw "Skill already exists: $unitDestination. Preserve it and install to another DestinationRoot, or review an explicit upgrade." }
if ($unitDestination.StartsWith($unitSource + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Cannot install inside the source package.' }
New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
New-Item -ItemType Directory -Path $unitDestination | Out-Null
$unitManifest = Get-Content -LiteralPath (Join-Path $unitSource 'package-manifest.json') -Raw | ConvertFrom-Json
foreach ($unitEntry in $unitManifest.files) {
    $unitTarget = Join-Path $unitDestination $unitEntry.path
    New-Item -ItemType Directory -Force -Path (Split-Path $unitTarget) | Out-Null
    Copy-Item -LiteralPath (Join-Path $unitSource $unitEntry.path) -Destination $unitTarget
}
Copy-Item -LiteralPath (Join-Path $unitSource 'package-manifest.json') -Destination $unitDestination
& $unitPython (Join-Path $unitDestination 'scripts/verify_package.py')
if ($LASTEXITCODE -ne 0) { throw 'Installed copy verification failed.' }
if (-not $SkipMcp) {
    & $unitPython (Join-Path $unitDestination 'scripts/setup_mcp.py')
    if ($LASTEXITCODE -ne 0) { throw 'Skill files installed, but MCP setup failed. See output; rerun setup_mcp.py after resolving the error.' }
}
[pscustomobject]@{skill=$unitDestination;catalog=(Join-Path $unitDestination 'CAD-FILES.html');mcp_setup_skipped=[bool]$SkipMcp;next='Reload Codex skills. For new PCs follow references/installation.md and complete the live CAD test.'} | ConvertTo-Json
