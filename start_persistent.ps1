[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$root = "c:\Users\huey1\OneDrive\Desktop\제목 없는 World"
$scratchDir = "C:\Users\huey1\.gemini\antigravity\brain\c284134a-5662-4e8f-a3b6-a45584458bbc\scratch"
$logFile = Join-Path $scratchDir "tunnel.log"
$errFile = Join-Path $scratchDir "tunnel_err.log"
$serverOut = Join-Path $scratchDir "server_out.log"
$serverErr = Join-Path $scratchDir "server_err.log"

# Clean up old logs
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item $errFile -ErrorAction SilentlyContinue
Remove-Item $serverOut -ErrorAction SilentlyContinue
Remove-Item $serverErr -ErrorAction SilentlyContinue

# Kill any existing powershell/ssh processes from previous attempts
Get-Process | Where-Object { $_.CommandLine -like "*HttpListener*" -or $_.CommandLine -like "*serveo.net*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Construct powershell server script
$serverCmd = @"
`$http = [System.Net.HttpListener]::new()
`$http.Prefixes.Add('http://127.0.0.1:8787/')
try {
    `$http.Start()
    Write-Output 'Server started successfully.'
} catch {
    Write-Error `$_.Exception.Message
    exit
}
while (`$http.IsListening) {
    try {
        `$ctx = `$http.GetContext()
        `$req = `$ctx.Request
        `$res = `$ctx.Response
        `$localPath = `$req.Url.LocalPath
        if (`$localPath -eq '/') { `$localPath = '/index.html' }
        `$path = Join-Path '$root' `$localPath.Replace('/', '\')
        if (Test-Path `$path -PathType Leaf) {
            `$bytes = [System.IO.File]::ReadAllBytes(`$path)
            `$ext = [System.IO.Path]::GetExtension(`$path)
            `$mime = 'text/plain'
            if (`$ext -eq '.html') { `$mime = 'text/html; charset=utf-8' }
            elseif (`$ext -eq '.js') { `$mime = 'application/javascript; charset=utf-8' }
            elseif (`$ext -eq '.css') { `$mime = 'text/css; charset=utf-8' }
            `$res.ContentType = `$mime
            `$res.ContentLength64 = `$bytes.Length
            `$res.OutputStream.Write(`$bytes, 0, `$bytes.Length)
        } else {
            `$res.StatusCode = 404
        }
        `$res.Close()
    } catch {
        Write-Error `$_.Exception.Message
    }
}
"@

# Start the webserver as a persistent hidden process with redirected logs
Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoProfile", "-Command", $serverCmd -RedirectStandardOutput $serverOut -RedirectStandardError $serverErr
Write-Output "Persistent hidden webserver process started on port 8787."

# Start the SSH tunnel as a persistent process with redirected logs
Start-Process ssh -WindowStyle Hidden -ArgumentList "-o StrictHostKeyChecking=no", "-R 80:127.0.0.1:8787", "serveo.net" -RedirectStandardOutput $logFile -RedirectStandardError $errFile
Write-Output "Connecting to serveo.net tunnel..."

# Wait and read tunnel.log to find the URL
$urlFound = $false
$timeoutSeconds = 15
$elapsed = 0

while ($elapsed -lt $timeoutSeconds -and -not $urlFound) {
    Start-Sleep -Seconds 1
    $elapsed++
    
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -ErrorAction SilentlyContinue | Out-String
        if ($content -like "*Forwarding HTTP traffic from*") {
            # Find the forwarding line
            $lines = Get-Content $logFile -ErrorAction SilentlyContinue
            foreach ($line in $lines) {
                if ($line -like "*Forwarding HTTP traffic from*") {
                    $url = $line.Substring($line.IndexOf("https://")).Trim()
                    Write-Output "SUCCESS: $url"
                    $urlFound = $true
                    break
                }
            }
        }
    }
}

if (-not $urlFound) {
    if (Test-Path $errFile) {
        $err = Get-Content $errFile -ErrorAction SilentlyContinue | Out-String
        Write-Output "Error details: $err"
    } else {
        Write-Output "Error: Tunnel log not found or timed out."
    }
}
