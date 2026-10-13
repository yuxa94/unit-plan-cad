param([Parameter(Mandatory=$true)][string]$RelativePath)
$ErrorActionPreference = 'Stop'
$unitRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$unitFile = [IO.Path]::GetFullPath((Join-Path $unitRoot $RelativePath))
if (-not $unitFile.StartsWith($unitRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'The file must be inside this package.' }
if (-not (Test-Path -LiteralPath $unitFile) -or [IO.Path]::GetExtension($unitFile) -ne '.dwg') { throw 'Choose an existing packaged DWG.' }
Start-Process -FilePath $unitFile
Write-Output $unitFile
