$d1 = "C:\Users\ahmet\OneDrive\Masaüstü"
$d2 = "C:\Users\ahmet\Desktop"

Write-Output "--- OneDrive Masaüstü ---"
Get-ChildItem -Path $d1 -Filter "*NEXUS*" | Select-Object Name, FullName, Length, LastWriteTime

Write-Output "--- Standard Desktop ---"
if (Test-Path $d2) {
    Get-ChildItem -Path $d2 -Filter "*NEXUS*" | Select-Object Name, FullName, Length, LastWriteTime
}
