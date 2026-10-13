param([Parameter(Mandatory=$true)][string]$OutputPath, [string]$TemplatePath)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Connect-CAD.ps1')
$unitOutput = [IO.Path]::GetFullPath($OutputPath)
$unitPackage = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ($unitOutput.StartsWith($unitPackage + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Job output must be outside the installed skill.' }
if ([IO.Path]::GetExtension($unitOutput) -ne '.dwg') { throw 'Output must be a DWG path.' }
if (Test-Path -LiteralPath $unitOutput) { throw 'Output already exists. Choose a new versioned path.' }
if (-not (Test-Path -LiteralPath (Split-Path $unitOutput))) { throw 'Create the job output directory first.' }
if ($TemplatePath) {
    $unitTemplate = (Resolve-Path -LiteralPath $TemplatePath).Path
    if ([IO.Path]::GetExtension($unitTemplate) -ne '.dwt') { throw 'TemplatePath must be a DWT template.' }
    $unitNewDoc = $unitCadApp.Documents.Add($unitTemplate)
} else { $unitNewDoc = $unitCadApp.Documents.Add() }
$unitNewDoc.SetVariable('INSUNITS', [int16]4)
$unitNewDoc.SaveAs($unitOutput)
$unitNewDoc.Activate()
if (-not [StringComparer]::OrdinalIgnoreCase.Equals($unitCadApp.ActiveDocument.FullName, $unitOutput)) { throw 'New document did not become active.' }
[pscustomobject]@{path=$unitNewDoc.FullName;units='mm';version=$unitCadApp.Version;model_count=$unitNewDoc.ModelSpace.Count;dispatcher_loaded=$false} | ConvertTo-Json
