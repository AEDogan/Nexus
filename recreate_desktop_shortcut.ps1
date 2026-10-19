$exePath = "C:\Projeler\nexus\node_modules\electron\dist\NEXUS.exe"
$icoPath = "C:\Projeler\nexus\public\nexus_icon.ico"
$desktop1 = "C:\Users\ahmet\OneDrive\Masaüstü"
$desktop2 = "C:\Users\ahmet\Desktop"

$desktops = @($desktop1, $desktop2)

foreach ($dir in $desktops) {
    if (Test-Path $dir) {
        $oldLnk = Join-Path $dir "NEXUS.lnk"
        if (Test-Path $oldLnk) {
            Remove-Item -Path $oldLnk -Force
        }
        
        $WshShell = New-Object -ComObject WScript.Shell
        $sc = $WshShell.CreateShortcut($oldLnk)
        $sc.TargetPath = $exePath
        $sc.Arguments = "C:\Projeler\nexus"
        $sc.WorkingDirectory = "C:\Projeler\nexus"
        $sc.Description = "NEXUS - Masaüstü Cam Başlatıcı"
        $sc.IconLocation = "$icoPath,0"
        $sc.Save()

        Write-Output "Recreated fresh shortcut at $oldLnk"
    }
}
