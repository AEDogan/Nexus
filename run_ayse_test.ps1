$prompt = Get-Content -Path "C:\Projeler\nexus\test_ayse_teyze_prompt.md" -Raw -Encoding UTF8
$singleLinePrompt = ($prompt -replace '"', '\"') -replace "(\r?\n)+", " "

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "agy.exe"
$psi.Arguments = "--conversation nexus-ayse-test -c --disable-slash-commands --model gemini-3.8-flash-low --print `"$singleLinePrompt`""
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8

$process = [System.Diagnostics.Process]::Start($psi)
$output = $process.StandardOutput.ReadToEnd()
$err = $process.StandardError.ReadToEnd()
$process.WaitForExit()

Write-Output $output
if ($err) { Write-Output "STDERR: $err" }
