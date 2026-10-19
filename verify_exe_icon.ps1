Add-Type -AssemblyName System.Drawing
$ico = [System.Drawing.Icon]::ExtractAssociatedIcon("C:\Projeler\nexus\node_modules\electron\dist\NEXUS.exe")
Write-Output "Extracted icon size from NEXUS.exe: $($ico.Width)x$($ico.Height)"
