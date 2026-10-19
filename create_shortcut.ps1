$icoPath = "C:\Projeler\nexus\public\nexus_icon.ico"
$desktop1 = "C:\Users\ahmet\OneDrive\Masaüstü\NEXUS.lnk"
$desktop2 = "C:\Users\ahmet\Desktop\NEXUS.lnk"

$targets = @($desktop1, $desktop2)
$WshShell = New-Object -ComObject WScript.Shell

foreach ($target in $targets) {
    $parent = Split-Path $target -Parent
    if (Test-Path $parent) {
        $sc = $WshShell.CreateShortcut($target)
        $sc.TargetPath = "C:\Projeler\nexus\node_modules\electron\dist\electron.exe"
        $sc.Arguments = "."
        $sc.WorkingDirectory = "C:\Projeler\nexus"
        $sc.Description = "NEXUS Masaüstü Cam Widget Başlatıcı"
        $sc.IconLocation = "$icoPath,0"
        $sc.Save()
    }
}

$verify = $WshShell.CreateShortcut($desktop1).IconLocation
Write-Output "Verified IconLocation: $verify"
