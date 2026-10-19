$sh = New-Object -ComObject WScript.Shell
$sc1 = $sh.CreateShortcut("C:\Users\ahmet\OneDrive\Masaüstü\NEXUS.lnk")
$sc2 = $sh.CreateShortcut("C:\Users\ahmet\Desktop\NEXUS.lnk")

Write-Output "sc1 IconLocation: '$($sc1.IconLocation)'"
Write-Output "sc1 TargetPath:   '$($sc1.TargetPath)'"
Write-Output "sc2 IconLocation: '$($sc2.IconLocation)'"
Write-Output "sc2 TargetPath:   '$($sc2.TargetPath)'"
