$exePath = "C:\Projeler\nexus\node_modules\electron\dist\NEXUS.exe"
$icoPath = "C:\Projeler\nexus\public\nexus_icon.ico"
$desktops = @("C:\Users\ahmet\OneDrive\Masaüstü", "C:\Users\ahmet\Desktop")

$WshShell = New-Object -ComObject WScript.Shell

foreach ($d in $desktops) {
    if (Test-Path $d) {
        Get-ChildItem -Path $d -Filter "*NEXUS*.lnk" | Remove-Item -Force
        
        $lnkPath = Join-Path $d "NEXUS.lnk"
        $sc = $WshShell.CreateShortcut($lnkPath)
        $sc.TargetPath = $exePath
        $sc.Arguments = "C:\Projeler\nexus"
        $sc.WorkingDirectory = "C:\Projeler\nexus"
        $sc.Description = "NEXUS Masaüstü Cam Başlatıcı"
        $sc.IconLocation = "$icoPath,0"
        $sc.Save()

        Write-Output "Created fresh shortcut: $lnkPath"
    }
}

Write-Output "Restarting explorer to force icon reload..."
Stop-Process -Name explorer -Force
Start-Sleep -Milliseconds 1000
Start-Process explorer
Write-Output "Explorer restarted successfully!"
