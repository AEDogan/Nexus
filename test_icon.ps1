Add-Type -AssemblyName System.Drawing
try {
    $ico = New-Object System.Drawing.Icon("C:\Projeler\nexus\public\nexus_icon.ico")
    Write-Output "SUCCESS: Icon loaded, size: $($ico.Width)x$($ico.Height)"
} catch {
    Write-Output "ERROR: Failed to load icon: $_"
}
