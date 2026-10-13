$ErrorActionPreference = 'Stop'
if (-not ('UnitPlanCadSession' -as [type])) {
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public class UnitPlanCadSession {
 [DllImport("ole32.dll", CharSet=CharSet.Unicode)] static extern int CLSIDFromProgID(string name, out Guid id);
 [DllImport("oleaut32.dll", PreserveSig=false)] static extern void GetActiveObject(ref Guid id, IntPtr reserved, [MarshalAs(UnmanagedType.IUnknown)] out object obj);
 public static object Connect(string name) { Guid id; Marshal.ThrowExceptionForHR(CLSIDFromProgID(name, out id)); object obj; GetActiveObject(ref id, IntPtr.Zero, out obj); return obj; }
}
'@
}
$unitCadApp = $null
$unitProgIds = @('AutoCAD.Application') + @(Get-ChildItem 'Registry::HKEY_CLASSES_ROOT' -ErrorAction SilentlyContinue | Where-Object PSChildName -Match '^AutoCAD\.Application\.\d+(\.\d+)?$' | Sort-Object PSChildName -Descending | Select-Object -ExpandProperty PSChildName)
foreach ($unitProgId in $unitProgIds) {
    try { $unitCadApp = [UnitPlanCadSession]::Connect($unitProgId); break } catch { }
}
if ($null -eq $unitCadApp) { throw 'Start regular AutoCAD. No accessible running COM session was found; LT is not supported by this helper.' }
